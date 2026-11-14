
import { Injectable, signal, computed, inject } from '@angular/core';
import { finalize } from 'rxjs';

import {
  Task,
  TaskCreate,
  TaskStatsModel,
  TaskUpdate,

} from '../models/task.model';

import { TaskApiService } from './task-api.service';

@Injectable({
  providedIn: 'root'
})
export class TaskStoreService {

  private readonly taskApi = inject(TaskApiService);

  // =========================================
  // 1. TASK STATE
  // =========================================

  private readonly _tasks = signal<Task[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly tasks = this._tasks.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // =========================================
  // 2. STATISTICS STATE
  // =========================================

  private readonly _stats = signal<TaskStatsModel | null>(null);
  private readonly _statsLoading = signal(false);
  private readonly _statsError = signal<string | null>(null);

  readonly stats = this._stats.asReadonly();
  readonly statsLoading = this._statsLoading.asReadonly();
  readonly statsError = this._statsError.asReadonly();

  // =========================================
  // 3. PAGINATION STATE
  // =========================================

  readonly pageSize = 10;

  private readonly _page = signal(1);
  private readonly _canGoNext = signal(false);

  readonly page = this._page.asReadonly();
  readonly canGoNext = this._canGoNext.asReadonly();

  private requestedPage = 1;

  // =========================================
  // 4. DERIVED STATE
  // =========================================

  // Number of tasks currently loaded.
  readonly currentPageCount = computed(
    () => this._tasks().length
  );

  // Actual database-wide task count.
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
  // 5. LOAD TASKS
  // =========================================

  loadTasks(page = 1): void {
    if (page < 1 || this._isLoading()) return;

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

        // Requested page is empty.
        if (page > 1 && tasks.length === 0) {
          this._canGoNext.set(false);

          // Navigate backward after deletion.
          this.loadTasksAfterEmptyPage(page - 1);
          return;
        }

        this._tasks.set(tasks);
        this._page.set(page);

        // This is provisional: a full page does not
        // guarantee another page exists.
        this._canGoNext.set(
          tasks.length === this.pageSize
        );
      },

      error: (err) => {
        console.error('Failed to load tasks:', err);

        this._error.set(
          'Could not load tasks. Please try again.'
        );
      }
    });
  }

  /**
   * Reload the previous page after the current
   * page becomes empty.
   *
   * Called from inside the completed HTTP request,
   * so the normal load guard must be bypassed.
   */
  private loadTasksAfterEmptyPage(page: number): void {
    this.taskApi.getTasks({
      page,
      page_size: this.pageSize
    }).subscribe({
      next: (tasks) => {
        this._tasks.set(tasks);
        this._page.set(page);
        this.requestedPage = page;

        this._canGoNext.set(false);
      },

      error: (err) => {
        console.error('Failed to load previous page:', err);

        this._error.set(
          'Could not reload tasks after deletion.'
        );
      }
    });
  }

  // =========================================
  // 6. LOAD STATISTICS
  // =========================================

  loadStats(): void {
    if (this._statsLoading()) return;

    this._statsLoading.set(true);
    this._statsError.set(null);

    this.taskApi.getTaskStats().pipe(
      finalize(() => this._statsLoading.set(false))
    ).subscribe({
      next: (stats) => {
        this._stats.set(stats);
      },

      error: (err) => {
        console.error('Failed to load statistics:', err);

        this._statsError.set(
          'Could not load task statistics.'
        );
      }
    });
  }

  // =========================================
  // 7. REFRESH DATA
  // =========================================

  refresh(): void {
    this.loadTasks(this._page());
    this.loadStats();
  }

  retryLoad(): void {
    this.loadTasks(this.requestedPage);
    this.loadStats();
  }

  // =========================================
  // 8. CREATE TASK
  // =========================================

  addTask(data: TaskCreate): void {
    this._error.set(null);

    this.taskApi.createTask(data).subscribe({
      next: () => {
        this.refresh();
      },

      error: (err) => {
        console.error('Failed to create task:', err);

        this._error.set(
          'Failed to create task. Please try again.'
        );
      }
    });
  }

  // =========================================
  // 9. READ TASK
  // =========================================

  getTaskById(id: number): Task | undefined {
    return this._tasks().find(
      task => task.id === id
    );
  }

  // =========================================
  // 10. UPDATE TASK
  // =========================================

  updateTask(id: number, changes: TaskUpdate): void {
    this._error.set(null);

    this.taskApi.updateTask(id, changes).subscribe({
      next: () => {
        this.refresh();
      },

      error: (err) => {
        console.error('Failed to update task:', err);

        this._error.set(
          'Failed to update task.'
        );
      }
    });
  }

  // =========================================
  // 11. DELETE TASK
  // =========================================

  deleteTask(id: number): void {
    this._error.set(null);

    this.taskApi.deleteTask(id).subscribe({
      next: () => {
        this.refresh();
      },

      error: (err) => {
        console.error('Failed to delete task:', err);

        this._error.set(
          'Failed to delete task.'
        );
      }
    });
  }
}
