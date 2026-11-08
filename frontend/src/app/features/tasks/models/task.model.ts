
export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'completed'
  | 'archived';

export type TaskPriority =
  | 'low'
  | 'medium'
  | 'high';

export type TaskCategory =
  | 'work'
  | 'personal'
  | 'learning'
  | 'health'
  | 'finance'
  | 'other';

// Complete task returned by FastAPI
export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

// Data accepted by POST /tasks
export type TaskCreate = Pick<Task, 'title'> &
  Partial<
    Pick<
      Task,
      | 'description'
      | 'status'
      | 'priority'
      | 'category'
      | 'due_date'
    >
  >;

// Data accepted by PATCH /tasks/{id}
export type TaskUpdate = Partial<TaskCreate>;

// Query parameters for GET /tasks
export interface TaskQueryParams {
  page?: number;
  page_size?: number;
  priority?: TaskPriority;
  category?: TaskCategory;
  status?: TaskStatus;
  sort_by?: 'created_at' | 'due_date';
  order?: 'asc' | 'desc';
}
