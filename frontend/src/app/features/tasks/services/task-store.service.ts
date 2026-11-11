
import { Injectable, signal, computed } from '@angular/core';
import { Task, TaskCreate } from '../models/task.model';

@Injectable({
    providedIn: 'root'
})
export class TaskStoreService {

    // Move your existing five mock tasks here
    private readonly _tasks = signal<Task[]>([
        // Paste your mock tasks here
        {
            id: 1,
            title: 'Design Angular UI components with Tailwind CSS',
            description: 'Create responsive sidebar, header, and task grid layout using sky-blue theme.',
            status: 'completed',
            priority: 'high',
            category: 'work',
            due_date: '2026-11-07T12:00:00Z',
            created_at: '2026-11-06T09:00:00Z',
            updated_at: '2026-11-07T14:30:00Z'
        },
        {
            id: 2,
            title: 'Implement FastAPI backend endpoints',
            description: 'Set up CRUD routes for tasks using SQLAlchemy and Pydantic models.',
            status: 'in_progress',
            priority: 'high',
            category: 'work',
            due_date: '2026-11-10T18:00:00Z',
            created_at: '2026-11-07T10:00:00Z',
            updated_at: '2026-11-08T11:15:00Z'
        },
        {
            id: 3,
            title: 'Study advanced Angular Signals',
            description: 'Explore computed signals, effect, and custom reactive state management patterns.',
            status: 'in_progress',
            priority: 'medium',
            category: 'learning',
            due_date: '2026-11-12T15:00:00Z',
            created_at: '2026-11-08T08:30:00Z',
            updated_at: '2026-11-08T08:30:00Z'
        },
        {
            id: 4,
            title: 'Weekly gym and cardio workout',
            description: 'Complete strength training sessions and maintain consistency with fitness routine.',
            status: 'todo',
            priority: 'medium',
            category: 'health',
            due_date: '2026-11-09T20:00:00Z',
            created_at: '2026-11-08T08:30:00Z',
            updated_at: '2026-11-08T08:30:00Z'
        },
        {
            id: 5,
            title: 'Review monthly financial budget',
            description: 'Reconcile cash flow statements and check short-term liquidity risk buffers.',
            status: 'todo',
            priority: 'low',
            category: 'finance',
            due_date: '2026-11-15T12:00:00Z',
            created_at: '2026-11-08T08:30:00Z',
            updated_at: '2026-11-08T08:30:00Z'
        }
    ]);

    // Expose readonly state
    readonly tasks = this._tasks.asReadonly();

    // Derived state
    readonly totalTasks = computed(() => this.tasks().length);

    // CREATE
    addTask(data: TaskCreate): Task {
        const now = new Date().toISOString();

        const newTask: Task = {
            id: Math.max(0, ...this.tasks().map(task => task.id)) + 1,

            title: data.title,
            description: data.description ?? '',
            status: data.status ?? 'todo',
            priority: data.priority ?? 'medium',
            category: data.category ?? 'work',
            due_date: data.due_date ?? null,

            created_at: now,
            updated_at: now
        };

        this._tasks.update(tasks => [...tasks, newTask]);

        return newTask;
    }

    // READ
    getTaskById(id: number): Task | undefined {
        return this.tasks().find(task => task.id === id);
    }

    // UPDATE
    updateTask(id: number, changes: Partial<TaskCreate>): void {
        const now = new Date().toISOString();

        this._tasks.update(tasks =>
            tasks.map(task =>
                task.id === id
                    ? { ...task, ...changes, updated_at: now }
                    : task
            )
        );
    }

    // DELETE
    deleteTask(id: number): void {
        this._tasks.update(tasks =>
            tasks.filter(task => task.id !== id)
        );
    }
}
