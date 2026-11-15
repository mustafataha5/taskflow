import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type {
  Task,
  TaskCreate,
  TaskQueryParams,
  TaskStatsModel,
  TaskStatus,
  TaskUpdate,
} from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskApiService {

  private readonly http = inject(HttpClient);
  private readonly tasksUrl = 'http://localhost:8000/tasks';

  // =========================================
  // 1. GET TASKS (PAGINATED)
  // =========================================

  getTasks(query: TaskQueryParams = {}): Observable<Task[]> {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    }

    return this.http.get<Task[]>(this.tasksUrl, { params });
  }

  // =========================================
  // 2. GET TASK BY ID
  // =========================================

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.tasksUrl}/${id}`);
  }

  // =========================================
  // 3. CREATE TASK
  // =========================================

  createTask(task: TaskCreate): Observable<Task> {
    return this.http.post<Task>(this.tasksUrl, task);
  }

  // =========================================
  // 4. UPDATE TASK
  // =========================================

  updateTask(id: number, changes: TaskUpdate): Observable<Task> {
    return this.http.patch<Task>(`${this.tasksUrl}/${id}`, changes);
  }

  // =========================================
  // 5. DELETE TASK
  // =========================================

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.tasksUrl}/${id}`);
  }

  // =========================================
  // 6. GET TASK STATISTICS
  // =========================================

  getTaskStats(): Observable<TaskStatsModel> {
    return this.http.get<TaskStatsModel>(`${this.tasksUrl}/stats`);
  }

  // =========================================
  // 7. GET TASKS BY STATUS (KANBAN)
  // =========================================

  /**
   * Retrieve every task matching a specific status without pagination.
   * Example: GET /tasks/by-status/in_progress
   */
  getTasksByStatus(status: TaskStatus): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.tasksUrl}/by-status/${status}`);
  }
}