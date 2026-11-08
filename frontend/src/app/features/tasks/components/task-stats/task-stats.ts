import { Component, computed, input } from '@angular/core';
import { Task, TaskStatus } from '../../models/task.model';
import { CommonModule } from '@angular/common';


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

     readonly tasks = input.required<Task[]>();

  readonly stats = computed<StatItem[]>(() => {
    const tasks = this.tasks();

    const count = (status: TaskStatus) =>
      tasks.filter(task => task.status === status).length;

    return [
      { label: 'Total Tasks', value: tasks.length, color: 'sky', icon: 'list' },
      { label: 'To Do', value: count('todo'), color: 'slate', icon: 'clock' },
      { label: 'In Progress', value: count('in_progress'), color: 'sky', icon: 'zap' },
      { label: 'Completed', value: count('completed'), color: 'emerald', icon: 'check' },
      { label: 'Archived', value: count('archived'), color: 'zinc', icon: 'archive' },
    ];
  });
}
