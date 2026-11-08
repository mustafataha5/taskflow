import { Component, computed, signal } from '@angular/core';
import { Task } from '../../models/task.model';
import { CommonModule } from '@angular/common';

import { TaskCard } from '../../components/task-card/task-card';
import { RouterLink } from '@angular/router';
import { TaskList } from '../../components/task-list/task-list';
import { TaskStats } from '../../components/task-stats/task-stats';
import { TaskFilters } from '../../models/task-filter.model';
import { TaskFilter } from '../../components/task-filter/task-filter';

@Component({
  imports: [RouterLink, TaskList, TaskStats, TaskFilter],
  selector: 'app-task-list-page',
  styleUrl: './task-list-page.css',
  templateUrl: './task-list-page.html',
})
export class TaskListPage {
  readonly tasks = signal<Task[]>([
    {
      id: 1,
      title: 'Design Angular UI components with Tailwind CSS',
      description: 'Create responsive sidebar, header, and task grid layout using sky-blue theme.',
      status: 'completed',
      priority: 'high',
      category: 'work',
      due_date: '2026-11-07T12:00:00Z',
      created_at: '2026-11-06T09:00:00Z',
      updated_at: '2026-11-07T14:30:00Z'
    },
    {
      id: 2,
      title: 'Implement FastAPI backend endpoints',
      description: 'Set up CRUD routes for tasks using SQLAlchemy and Pydantic models.',
      status: 'in_progress',
      priority: 'high',
      category: 'work',
      due_date: '2026-11-10T18:00:00Z',
      created_at: '2026-11-07T10:00:00Z',
      updated_at: '2026-11-08T11:15:00Z'
    },
    {
      id: 3,
      title: 'Study advanced Angular Signals',
      description: 'Explore computed signals, effect, and custom reactive state management patterns.',
      status: 'in_progress',
      priority: 'medium',
      category: 'learning',
      due_date: '2026-11-12T15:00:00Z',
      created_at: '2026-11-08T08:30:00Z',
      updated_at: '2026-11-08T08:30:00Z'
    },
    {
      id: 4,
      title: 'Weekly gym and cardio workout',
      description: 'Complete strength training sessions and maintain consistency with fitness routine.',
      status: 'todo',
      priority: 'medium',
      category: 'health',
      due_date: '2026-11-09T20:00:00Z',
      created_at: '2026-11-08T08:30:00Z',
      updated_at: '2026-11-08T08:30:00Z'
    },
    {
      id: 5,
      title: 'Review monthly financial budget',
      description: 'Reconcile cash flow statements and check short-term liquidity risk buffers.',
      status: 'todo',
      priority: 'low',
      category: 'finance',
      due_date: '2026-11-15T12:00:00Z',
      created_at: '2026-11-08T08:30:00Z',
      updated_at: '2026-11-08T08:30:00Z'
    }
  ]);

  readonly filters = signal<TaskFilters>({
    status: 'all',
    priority: 'all',
    category: 'all',
  });

  readonly completedCount = computed(
    () => this.tasks().filter(task => task.status === 'completed').length
  );

  onDeleteTask(taskId: number): void {
    this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
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