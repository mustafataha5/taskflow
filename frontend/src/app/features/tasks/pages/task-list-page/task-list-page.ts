import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TaskList } from '../../components/task-list/task-list';
import { TaskStats } from '../../components/task-stats/task-stats';
import { TaskFilter } from '../../components/task-filter/task-filter';
import { TaskViewSwitcher } from '../../components/task-view-switcher/task-view-switcher';
import { TaskFilters } from '../../models/task-filter.model';
import { TaskView } from '../../models/task.model';
import { TaskStoreService } from '../../services/task-store.service';

@Component({
  imports: [CommonModule, RouterLink, TaskList, TaskStats, TaskFilter, TaskViewSwitcher],
  selector: 'app-task-list-page',
  styleUrl: './task-list-page.css',
  templateUrl: './task-list-page.html',
})
export class TaskListPage implements OnInit {
  readonly taskStore = inject(TaskStoreService);

  ngOnInit(): void {
    // Load the first page of tasks and database statistics on initialization
    this.taskStore.loadTasks(1);
    this.taskStore.loadStats();
  }

  // Shared task and stats signals from the store
  readonly tasks = this.taskStore.tasks;
  readonly stats = this.taskStore.stats;
  readonly statsLoading = this.taskStore.statsLoading;
  readonly statsError = this.taskStore.statsError;

  // UI state for view switching (list, table, board)
  readonly currentView = signal<TaskView>('list');

  changeView(view: TaskView): void {
    this.currentView.set(view);
  }

  readonly filters = signal<TaskFilters>({
    status: 'all',
    priority: 'all',
    category: 'all',
  });

  // Database-wide completed count derived from API stats
  readonly completedCount = computed(
    () => this.stats()?.by_status.completed ?? 0
  );

  /**
   * Navigate to a specific page using the task store.
   */
  goToPage(page: number): void {
    this.taskStore.loadTasks(page);
  }

  onDeleteTask(taskId: number): void {
    this.taskStore.deleteTask(taskId);
  }

  readonly filteredTasks = computed(() => {
    const filters = this.filters();

    return this.tasks().filter(task =>
      (filters.status === 'all' || task.status === filters.status) &&
      (filters.priority === 'all' || task.priority === filters.priority) &&
      (filters.category === 'all' || task.category === filters.category)
    );
  });
}