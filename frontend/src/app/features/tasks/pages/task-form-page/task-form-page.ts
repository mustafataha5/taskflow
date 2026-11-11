
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TaskForm } from '../../components/task-form/task-form';
import { Task, TaskCreate } from '../../models/task.model';
import { TaskStoreService } from '../../services/task-store.service';

@Component({
  selector: 'app-task-form-page',
  imports: [TaskForm],
  templateUrl: './task-form-page.html'
})
export class TaskFormPage {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskStore = inject(TaskStoreService);

  readonly task = signal<Task | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly isEditMode =
    this.route.snapshot.paramMap.has('id');

  constructor() {
    if (this.isEditMode) {
      const id = Number(this.route.snapshot.paramMap.get('id'));

      if (!Number.isSafeInteger(id) || id <= 0) {
        this.error.set('Invalid task ID.');
        return;
      }

      const existingTask = this.taskStore.getTaskById(id);

      if (existingTask) {
        this.task.set(existingTask);
      } else {
        this.error.set('Task not found.');
      }
    }
  }

  onSave(data: TaskCreate): void {
    if (this.saving()) return;

    // Prevent accidentally creating a task when
    // an edit URL references a missing task.
    if (this.isEditMode && !this.task()) {
      this.error.set('Cannot update: task not found.');
      return;
    }

    this.error.set(null);
    this.saving.set(true);

    try {
      if (this.isEditMode) {
        const id = this.task()!.id;

        this.taskStore.updateTask(id, data);

      } else {
        this.taskStore.addTask(data);
      }

      void this.router.navigate(['/tasks']);

    } catch (error) {
      console.error(error);
      this.error.set('Failed to save task.');

    } finally {
      this.saving.set(false);
    }
  }
}
