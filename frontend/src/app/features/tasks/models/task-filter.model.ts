import {
  TaskStatus,
  TaskPriority,
  TaskCategory
} from './task.model';

export interface TaskFilters {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  category: TaskCategory | 'all';
}