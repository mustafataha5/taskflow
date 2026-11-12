import { Injectable, signal, computed, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { Task, TaskCreate, TaskUpdate } from '../models/task.model';
import { TaskApiService } from './task-api.service';

@Injectable({
    providedIn: 'root'
})
export class TaskStoreService {
    private readonly taskApi = inject(TaskApiService);

    // Existing core state signals
    private readonly _tasks = signal<Task[]>([]);
    private readonly _isLoading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    // Pagination state fields
    readonly pageSize = 10;
    private readonly _page = signal(1);
    private readonly _canGoNext = signal(false);
    private requestedPage = 1;

    // Public readonly state exposures
    readonly tasks = this._tasks.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly error = this._error.asReadonly();
    readonly page = this._page.asReadonly();
    readonly canGoNext = this._canGoNext.asReadonly();

    // Derived state (reflects current page view)
    readonly totalTasks = computed(() => this.tasks().length);

    /**
     * Load tasks from FastAPI with page-based pagination.
     */
    loadTasks(page = 1): void {
        if (page < 1 || this._isLoading()) return;

        this.requestedPage = page;
        this._isLoading.set(true);
        this._error.set(null);

        this.taskApi.getTasks({ page, page_size: this.pageSize }).pipe(
            finalize(() => this._isLoading.set(false)),
        ).subscribe({
            next: (tasks) => {
                if (page > this._page() && tasks.length === 0) {
                    this._canGoNext.set(false);
                    return;
                }

                this._tasks.set(tasks);
                this._page.set(page);
                this._canGoNext.set(tasks.length === this.pageSize);
            },
            error: (err) => {
                console.error('Failed to load tasks:', err);
                this._error.set('Could not load tasks. Please try again.');
            },
        });
    }

    /**
     * Retry loading tasks using the last requested page.
     */
    retryLoad(): void {
        this.loadTasks(this.requestedPage);
    }

    // CREATE
    addTask(data: TaskCreate): void {
        this.taskApi.createTask(data).subscribe({
            next: () => {
                this.loadTasks(this._page());
            },
            error: (err) => {
                console.error('Failed to create task:', err);
                this._error.set('Failed to create task. Please try again.');
            }
        });
    }

    // READ
    getTaskById(id: number): Task | undefined {
        return this.tasks().find(task => task.id === id);
    }

    // UPDATE
    updateTask(id: number, changes: TaskUpdate): void {
        this.taskApi.updateTask(id, changes).subscribe({
            next: () => {
                this.loadTasks(this._page());
            },
            error: (err) => {
                console.error('Failed to update task:', err);
                this._error.set('Failed to update task.');
            }
        });
    }

    // DELETE
    deleteTask(id: number): void {
        this.taskApi.deleteTask(id).subscribe({
            next: () => {
                this.loadTasks(this._page());
            },
            error: (err) => {
                console.error('Failed to delete task:', err);
                this._error.set('Failed to delete task.');
            }
        });
    }
}