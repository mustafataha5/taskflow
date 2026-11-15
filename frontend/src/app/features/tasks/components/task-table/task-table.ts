import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Task, TaskCategory, TaskStatus } from '../../models/task.model';

type CategoryStyle = {
  badge: string;
  dot: string;
};

const CATEGORY_STYLES: Record<TaskCategory, CategoryStyle> = {
  work: {
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
    dot: 'bg-indigo-500',
  },
  personal: {
    badge: 'bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300',
    dot: 'bg-pink-500',
  },
  learning: {
    badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300',
    dot: 'bg-cyan-500',
  },
  health: {
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  finance: {
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  other: {
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
};

type StatusStyle = {
  badge: string;
  dot: string;
};

const STATUS_STYLES: Record<TaskStatus, StatusStyle> = {
  todo: {
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
  in_progress: {
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  completed: {
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  archived: {
    badge: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    dot: 'bg-violet-500',
  },
};

@Component({
  selector: 'app-task-table',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './task-table.html',
  styleUrl: './task-table.css',
})
export class TaskTable {
  readonly tasks = input.required<Task[]>();
  readonly deleteTask = output<number>();

  readonly categoryStyles = CATEGORY_STYLES;
  readonly statusStyles = STATUS_STYLES;

  formatStatus(status: string): string {
    return status.replace('_', ' ');
  }
}