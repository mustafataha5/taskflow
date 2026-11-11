
import { Component, computed, inject } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { TaskStoreService } from '../../services/task-store.service';

@Component({
  selector: 'app-task-details-page',
  imports: [DatePipe, NgClass, RouterLink],
  templateUrl: './task-details-page.html',
  styleUrl: './task-details-page.css'
})
export class TaskDetailsPage {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskStore = inject(TaskStoreService);

  // Convert route parameters into a signal.
  readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap
  });

  // Derive and validate the task ID.
  readonly taskId = computed(() => {
    const idParam = this.params().get('id');

    if (!idParam || !/^[1-9]\d*$/.test(idParam)) {
      return null;
    }

    const id = Number(idParam);

    return Number.isSafeInteger(id) ? id : null;
  });

  // Automatically update when the task store changes.
  readonly task = computed(() => {
    const id = this.taskId();

    if (id === null) {
      return null;
    }

    return this.taskStore.tasks().find(t => t.id === id) ?? null;
  });

  // Derived error state.
  readonly errorMessage = computed(() => {
    const id = this.taskId();

    if (id === null) {
      return 'Invalid task ID provided.';
    }

    if (!this.task()) {
      return `Task with ID #${id} could not be found.`;
    }

    return null;
  });

  onDelete(): void {
    const currentTask = this.task();

    if (!currentTask) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${currentTask.title}"?`
    );

    if (!confirmed) return;

    this.taskStore.deleteTask(currentTask.id);

    void this.router.navigate(['/tasks']);
  }
}
