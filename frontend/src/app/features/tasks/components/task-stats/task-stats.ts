import { Component, computed, input } from '@angular/core';

import { CommonModule } from '@angular/common';
import { TaskStatsModel } from '../../models/task.model';

interface StatItem {
  label: string;
  value: number;
  color: string;
  icon: string;
}

@Component({
  imports: [CommonModule],
  selector: 'app-task-stats',
  styleUrl: './task-stats.css',
  templateUrl: './task-stats.html',
})
export class TaskStats {
  // Receive the TaskStats response object from FastAPI
  readonly statsData = input.required<TaskStatsModel>();

  readonly stats = computed<StatItem[]>(() => {
    const s = this.statsData();

    return [
      { label: 'Total Tasks', value: s.total, color: 'sky', icon: 'list' },
      { label: 'To Do', value: s.by_status.todo, color: 'slate', icon: 'clock' },
      { label: 'In Progress', value: s.by_status.in_progress, color: 'sky', icon: 'zap' },
      { label: 'Completed', value: s.by_status.completed, color: 'emerald', icon: 'check' },
      { label: 'Archived', value: s.by_status.archived, color: 'zinc', icon: 'archive' },
      { label: 'Overdue', value: s.overdue, color: 'rose', icon: 'alert-triangle' },
    ];
  });
}