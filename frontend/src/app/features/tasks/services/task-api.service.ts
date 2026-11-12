import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type {
  Task,
  TaskCreate,
  TaskQueryParams,
  TaskUpdate,
} from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly tasksUrl = 'http://localhost:8000/tasks';

  getTasks(query: TaskQueryParams = {}): Observable<Task[]> {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        params = params.set(key, value);
      }
    }

    return this.http.get<Task[]>(this.tasksUrl, { params });
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.tasksUrl}/${id}`);
  }

  createTask(task: TaskCreate): Observable<Task> {
    return this.http.post<Task>(this.tasksUrl, task);
  }

  updateTask(id: number, changes: TaskUpdate): Observable<Task> {
    return this.http.patch<Task>(`${this.tasksUrl}/${id}`, changes);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.tasksUrl}/${id}`);
  }
}