import { Injectable, signal, computed, inject } from '@angular/core';
import { finalize, forkJoin, Observable } from 'rxjs';

import {
  Task,
  TaskCreate,
  TaskStatsModel,
  TaskStatus,
  TaskUpdate,
} from '../models/task.model';

import { TaskApiService } from './task-api.service';

// Runtime list of statuses for Kanban requests.
const TASK_STATUSES: readonly TaskStatus[] = [
  'todo',
  'in_progress',
  'completed',
  'archived',
];

@Injectable({
  providedIn: 'root'
})
export class TaskStoreService {

  private readonly taskApi = inject(TaskApiService);

  // =========================================
  // 1. TASK STATE (LIST & TABLE)
  // =========================================

  private readonly _tasks = signal<Task[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly tasks = this._tasks.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // =========================================
  // 2. KANBAN BOARD STATE (UNPAGINATED)
  // =========================================

  private readonly _boardTasks = signal<Task[]>([]);
  private readonly _isBoardLoading = signal(false);
  private readonly _boardError = signal<string | null>(null);

  readonly boardTasks = this._boardTasks.asReadonly();
  readonly isBoardLoading = this._isBoardLoading.asReadonly();
  readonly boardError = this._boardError.asReadonly();

  // Dedicated error state for Kanban drag-and-drop mutations
  private readonly _mutationError = signal<string | null>(null);
  readonly mutationError = this._mutationError.asReadonly();

  // Tracks whether the board has been requested.
  private boardInitialized = false;

  // Queue a refresh if a board request is already running.
  private boardRefreshPending = false;

  // Track in-flight drag-and-drop updates
  private readonly pendingStatusUpdates = new Set<number>();

  // =========================================
  // 3. STATISTICS STATE
  // =========================================

  private readonly _stats = signal<TaskStatsModel | null>(null);
  private readonly _statsLoading = signal(false);
  private readonly _statsError = signal<string | null>(null);

  readonly stats = this._stats.asReadonly();
  readonly statsLoading = this._statsLoading.asReadonly();
  readonly statsError = this._statsError.asReadonly();

  // =========================================
  // 4. PAGINATION STATE
  // =========================================

  readonly pageSize = 12;

  private readonly _page = signal(1);

  readonly page = this._page.asReadonly();

  // Correct for the current unfiltered GET /tasks API.
  readonly canGoNext = computed(() => {
    const stats = this._stats();

    if (!stats) {
      return false;
    }

    return this._page() * this.pageSize < stats.total;
  });

  private requestedPage = 1;

  // =========================================
  // 5. DERIVED STATE
  // =========================================

  readonly currentPageCount = computed(
    () => this._tasks().length
  );

  readonly totalTasks = computed(
    () => this._stats()?.total ?? 0
  );

  readonly completedTasks = computed(
    () => this._stats()?.by_status.completed ?? 0
  );

  readonly overdueTasks = computed(
    () => this._stats()?.overdue ?? 0
  );

  // =========================================
  // 6. LOAD TASKS (PAGINATED)
  // =========================================

  loadTasks(page = 1): void {
    if (page < 1 || this._isLoading()) {
      return;
    }

    this.requestedPage = page;
    this._isLoading.set(true);
    this._error.set(null);

    this.taskApi.getTasks({
      page,
      page_size: this.pageSize
    }).pipe(
      finalize(() => this._isLoading.set(false))
    ).subscribe({
      next: (tasks) => {
        if (page > 1 && tasks.length === 0) {
          this.loadTasksAfterEmptyPage(page - 1);
          return;
        }

        this._tasks.set(tasks);
        this._page.set(page);
      },

      error: (err) => {
        console.error('Failed to load tasks:', err);

        this._error.set(
          'Could not load tasks. Please try again.'
        );
      }
    });
  }

  private loadTasksAfterEmptyPage(page: number): void {
    this.taskApi.getTasks({
      page,
      page_size: this.pageSize
    }).subscribe({
      next: (tasks) => {
        this._tasks.set(tasks);
        this._page.set(page);
        this.requestedPage = page;
      },

      error: (err) => {
        console.error(
          'Failed to load previous page:',
          err
        );

        this._error.set(
          'Could not reload tasks after deletion.'
        );
      }
    });
  }

  // =========================================
  // 7. LOAD KANBAN BOARD (UNPAGINATED)
  // =========================================

  loadAllTasks(): void {
    this.boardInitialized = true;

    if (this._isBoardLoading()) {
      this.boardRefreshPending = true;
      return;
    }

    this._isBoardLoading.set(true);
    this._boardError.set(null);

    const requests = TASK_STATUSES.reduce(
      (acc, status) => {
        acc[status] = this.taskApi.getTasksByStatus(status);
        return acc;
      },
      {} as Record<TaskStatus, Observable<Task[]>>
    );

    forkJoin(requests).pipe(
      finalize(() => {
        this._isBoardLoading.set(false);

        if (this.boardRefreshPending) {
          this.boardRefreshPending = false;
          this.loadAllTasks();
        }
      })
    ).subscribe({
      next: (results) => {
        const allTasks = TASK_STATUSES.flatMap(
          status => results[status]
        );

        if (!this.boardRefreshPending) {
          // Merge fetched tasks while protecting pending optimistic updates from being overwritten
          const currentTasks = new Map(
            this._boardTasks().map(task => [task.id, task])
          );

          const mergedTasks = allTasks.map(task => {
            if (!this.pendingStatusUpdates.has(task.id)) {
              return task;
            }

            const optimisticTask = currentTasks.get(task.id);

            return optimisticTask
              ? { ...task, status: optimisticTask.status }
              : task;
          });

          this._boardTasks.set(mergedTasks);
        }
      },

      error: (err) => {
        console.error(
          'Failed to load Kanban board tasks:',
          err
        );

        if (!this.boardRefreshPending) {
          this._boardError.set(
            'Could not load Kanban board tasks.'
          );
        }
      }
    });
  }

  // =========================================
  // 8. LOAD STATISTICS
  // =========================================

  loadStats(): void {
    if (this._statsLoading()) {
      return;
    }

    this._statsLoading.set(true);
    this._statsError.set(null);

    this.taskApi.getTaskStats().pipe(
      finalize(() => this._statsLoading.set(false))
    ).subscribe({
      next: (stats) => {
        this._stats.set(stats);
      },

      error: (err) => {
        console.error(
          'Failed to load statistics:',
          err
        );

        this._statsError.set(
          'Could not load task statistics.'
        );
      }
    });
  }

  // =========================================
  // 9. REFRESH DATA
  // =========================================

  refresh(): void {
    this.loadTasks(this._page());
    this.loadStats();

    if (this.boardInitialized) {
      this.loadAllTasks();
    }
  }

  retryLoad(): void {
    this.loadTasks(this.requestedPage);
    this.loadStats();
  }

  // =========================================
  // 10. CREATE TASK
  // =========================================

  addTask(data: TaskCreate): void {
    this._error.set(null);

    this.taskApi.createTask(data).subscribe({
      next: () => {
        this.refresh();
      },

      error: (err) => {
        console.error(
          'Failed to create task:',
          err
        );

        this._error.set(
          'Failed to create task. Please try again.'
        );
      }
    });
  }

  // =========================================
  // 11. READ TASK
  // =========================================

  getTaskById(id: number): Task | undefined {
    return (
      this._tasks().find(task => task.id === id) ??
      this._boardTasks().find(task => task.id === id)
    );
  }

  // =========================================
  // 12. UPDATE TASK
  // =========================================

  updateTask(id: number, changes: TaskUpdate): void {
    this._error.set(null);

    this.taskApi.updateTask(id, changes).subscribe({
      next: () => {
        this.refresh();
      },

      error: (err) => {
        console.error(
          'Failed to update task:',
          err
        );

        this._error.set(
          'Failed to update task.'
        );
      }
    });
  }

  // =========================================
  // 13. DELETE TASK
  // =========================================

  deleteTask(id: number): void {
    this._error.set(null);

    this.taskApi.deleteTask(id).subscribe({
      next: () => {
        this.refresh();
      },

      error: (err) => {
        console.error(
          'Failed to delete task:',
          err
        );

        this._error.set(
          'Failed to delete task.'
        );
      }
    });
  }

  // =========================================
  // 14. OPTIMISTIC KANBAN STATUS UPDATE
  // =========================================

  updateTaskStatus(
    id: number,
    status: TaskStatus
  ): void {
    const originalTask = this._boardTasks()
      .find(task => task.id === id);

    if (!originalTask || originalTask.status === status) {
      return;
    }

    if (this.pendingStatusUpdates.has(id)) {
      return;
    }

    this.pendingStatusUpdates.add(id);
    this._mutationError.set(null);

    // Optimistically update board state immediately
    this._boardTasks.update(tasks =>
      tasks.map(task =>
        task.id === id
          ? { ...task, status }
          : task
      )
    );

    this.taskApi.updateTask(id, { status }).pipe(
      finalize(() => {
        this.pendingStatusUpdates.delete(id);
      })
    ).subscribe({
      next: () => {
        this.refresh();
      },
      error: (err) => {
        console.error('Failed to move task:', err);

        // Revert optimistic update on failure
        this._boardTasks.update(tasks =>
          tasks.map(task =>
            task.id === id
              ? { ...task, status: originalTask.status }
              : task
          )
        );

        this._mutationError.set(
          'Could not move task. The previous status was restored.'
        );
      }
    });
  }
}