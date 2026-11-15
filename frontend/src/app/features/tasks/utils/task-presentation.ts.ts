import type { TaskPriority } from '../models/task.model';

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  high: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
};
export class TaskPresentationTs {}
