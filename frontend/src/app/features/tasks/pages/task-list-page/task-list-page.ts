import { Component, computed, inject, signal } from '@angular/core';
import { Task } from '../../models/task.model';
import { CommonModule } from '@angular/common';

import { TaskCard } from '../../components/task-card/task-card';
import { RouterLink } from '@angular/router';
import { TaskList } from '../../components/task-list/task-list';
import { TaskStats } from '../../components/task-stats/task-stats';
import { TaskFilters } from '../../models/task-filter.model';
import { TaskFilter } from '../../components/task-filter/task-filter';
import { TaskStoreService } from '../../services/task-store.service';

@Component({
  imports: [RouterLink, TaskList, TaskStats, TaskFilter],
  selector: 'app-task-list-page',
  styleUrl: './task-list-page.css',
  templateUrl: './task-list-page.html',
})
export class TaskListPage {
  private readonly taskStore = inject(TaskStoreService);

// Shared tasks signal
readonly tasks = this.taskStore.tasks;

  readonly filters = signal<TaskFilters>({
    status: 'all',
    priority: 'all',
    category: 'all',
  });

  readonly completedCount = computed(
    () => this.tasks().filter(task => task.status === 'completed').length
  );

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