
export type TaskStatus =
  'todo' | 'in_progress' | 'completed' | 'archived';

export type TaskPriority =
  'low' | 'medium' | 'high';

export type TaskCategory =
  'work' | 'personal' | 'learning' |
  'health' | 'finance' | 'other';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskCreate = Pick<
  Task,
  'title' | 'description' | 'priority' | 'category' | 'due_date'
> & {
  status?: TaskStatus;
};

export type TaskUpdate = Partial<TaskCreate>;

export interface PaginatedTasks {
  items: Task[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
