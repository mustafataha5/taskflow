
import { Component, inject, input, output, effect } from '@angular/core';
import {
  NonNullableFormBuilder,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { NgClass } from '@angular/common';

import {
  Task,
  TaskCategory,
  TaskCreate,
  TaskStatus,
  TaskPriority
} from '../../models/task.model';
import { dueDateValidator } from '../../../../shared/validators/due-date.validator';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css'
})
export class TaskForm {

  private readonly fb = inject(NonNullableFormBuilder);

  // INPUTS: Data received from the smart component

  // Null = create mode; Task = edit mode
  readonly task = input<Task | null>(null);

  // True while the parent is saving to FastAPI
  readonly saving = input(false);

  // OUTPUT: Send validated form data to the parent
  readonly save = output<TaskCreate>();

  // REACTIVE FORM
  readonly form = this.fb.group({
    title: this.fb.control('', [
      Validators.required,
      Validators.minLength(3)
    ]),

    description: this.fb.control(''),

    status: this.fb.control<TaskStatus>('todo', [
      Validators.required
    ]),

    priority: this.fb.control<TaskPriority>('medium', [
      Validators.required
    ]),

    category: this.fb.control<TaskCategory>('work', [
      Validators.required
    ]),

    // HTML date inputs work with YYYY-MM-DD strings
    due_date: this.fb.control('', [
      Validators.required,
      dueDateValidator()
    ])
  });

  constructor() {
    // Update the form when the parent provides a task.
    effect(() => {
      const task = this.task();

      this.form.reset({
        title: task?.title ?? '',
        description: task?.description ?? '',
        status: task?.status ?? 'todo',
        priority: task?.priority ?? 'medium',
        category: task?.category ?? 'work',
        due_date: task?.due_date?.slice(0, 10) ?? ''
      });
    });
  }

  onSubmit(): void {

    // Prevent duplicate submissions
    if (this.saving()) {
      return;
    }

    // Validate inputs
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Read all form values
    const values = this.form.getRawValue();

    // Normalize empty date into null
    const taskData: TaskCreate = {
      ...values,
      due_date: values.due_date || null
    };

    // Notify the parent
    this.save.emit(taskData);
  }
}
