import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { RouterLink } from '@angular/router';

import { TaskList } from '../../components/task-list/task-list';
import { TaskStats } from '../../components/task-stats/task-stats';
import { TaskFilter } from '../../components/task-filter/task-filter';
import { TaskViewSwitcher } from '../../components/task-view-switcher/task-view-switcher';
import { TaskTable } from '../../components/task-table/task-table';
import { TaskKanban } from '../../components/task-kanban/task-kanban';

import { TaskFilters } from '../../models/task-filter.model';
import { TaskView, TaskStatus } from '../../models/task.model';
import { TaskStoreService } from '../../services/task-store.service';

@Component({
  selector: 'app-task-list-page',
  imports: [
    RouterLink,
    TaskList,
    TaskStats,
    TaskFilter,
    TaskViewSwitcher,
    TaskTable,
    TaskKanban
  ],
  templateUrl: './task-list-page.html',
  styleUrl: './task-list-page.css',
})
export class TaskListPage implements OnInit {

  // =========================================
  // 1. DEPENDENCIES
  // =========================================

  readonly taskStore = inject(TaskStoreService);

  // =========================================
  // 2. INITIALIZATION
  // =========================================

  ngOnInit(): void {
    this.taskStore.loadTasks(1);
    this.taskStore.loadStats();
  }

  // =========================================
  // 3. TASK STATE
  // =========================================

  readonly tasks = this.taskStore.tasks;
  readonly boardTasks = this.taskStore.boardTasks;

  // =========================================
  // 4. STATISTICS STATE
  // =========================================

  readonly stats = this.taskStore.stats;
  readonly statsLoading = this.taskStore.statsLoading;
  readonly statsError = this.taskStore.statsError;

  // =========================================
  // 5. VIEW SWITCHING
  // =========================================

  readonly currentView = signal<TaskView>('list');

  changeView(view: TaskView): void {
    if (this.currentView() === view) {
      return;
    }

    this.currentView.set(view);

    if (view === 'board') {
      this.taskStore.loadAllTasks();
    }
  }

  // =========================================
  // 6. FILTER STATE
  // =========================================

  readonly filters = signal<TaskFilters>({
    status: 'all',
    priority: 'all',
    category: 'all',
  });

  readonly filteredTasks = computed(() => {
    const filters = this.filters();

    return this.tasks().filter(task =>
      (filters.status === 'all' ||
        task.status === filters.status) &&
      (filters.priority === 'all' ||
        task.priority === filters.priority) &&
      (filters.category === 'all' ||
        task.category === filters.category)
    );
  });

  // =========================================
  // 7. PAGINATION
  // =========================================

  goToPage(page: number): void {
    this.taskStore.loadTasks(page);
  }

  // =========================================
  // 8. RETRY
  // =========================================

  /**
   * Retry List/Table and statistics.
   */
  retryTasks(): void {
    this.taskStore.retryLoad();
  }

  /**
   * Retry Kanban and statistics.
   */
  retryBoard(): void {
    this.taskStore.loadAllTasks();
    this.taskStore.loadStats();
  }

  /**
   * Retry statistics independently.
   */
  retryStats(): void {
    this.taskStore.loadStats();
  }

  // =========================================
  // 9. TASK ACTIONS (DELETE & STATUS CHANGE)
  // =========================================

  onDeleteTask(taskId: number): void {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task? ' +
      'This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.taskStore.deleteTask(taskId);
  }

  /**
   * Handle drag-and-drop status changes from the Kanban board.
   */
  onStatusChanged(event: {
    taskId: number;
    newStatus: TaskStatus;
  }): void {
    this.taskStore.updateTaskStatus(
      event.taskId,
      event.newStatus
    );
  }
}