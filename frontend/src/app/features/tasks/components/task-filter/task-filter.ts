import { Component, input, output } from '@angular/core';
import { TaskFilters } from '../../models/task-filter.model';

@Component({
  selector: 'app-task-filter',
  imports: [],
  templateUrl: './task-filter.html',
  styleUrl: './task-filter.css',
})
export class TaskFilter {
  readonly filters = input.required<TaskFilters>();

  readonly filtersChange = output<TaskFilters>();

  updateStatus(status: TaskFilters['status']): void {
    this.filtersChange.emit({
      ...this.filters(),
      status,
    });
  }

  updatePriority(priority: TaskFilters['priority']): void {
    this.filtersChange.emit({
      ...this.filters(),
      priority,
    });
  }

  updateCategory(category: TaskFilters['category']): void {
    this.filtersChange.emit({
      ...this.filters(),
      category,
    });
  }

  resetFilters(): void {
    this.filtersChange.emit({
      status: 'all',
      priority: 'all',
      category: 'all',
    });
  }
}