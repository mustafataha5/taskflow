
import {
  Component,
  computed,
  input,
  output
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

import {
  CdkDropListGroup,
  CdkDropList,
  CdkDrag,
  CdkDragHandle,
  CdkDragDrop
} from '@angular/cdk/drag-drop';

import type {
  Task,
  TaskStatus
} from '../../models/task.model';

import {
  PRIORITY_STYLES
} from '../../utils/task-presentation.ts';

// =========================================
// 1. TYPES
// =========================================

type KanbanColumn = {
  readonly status: TaskStatus;
  readonly label: string;
  readonly dotClass: string;
};

export type TaskStatusChangeEvent = {
  taskId: number;
  newStatus: TaskStatus;
};

// =========================================
// 2. COMPONENT
// =========================================

@Component({
  selector: 'app-task-kanban',
  imports: [
    RouterLink,
    DatePipe,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    CdkDragHandle
  ],
  templateUrl: './task-kanban.html',
  styleUrl: './task-kanban.css',
})
export class TaskKanban {

  // =========================================
  // 3. INPUTS
  // =========================================

  // Full task list provided by the parent.
  readonly tasks = input.required<Task[]>();

  // =========================================
  // 4. OUTPUTS
  // =========================================

  readonly deleteTask = output<number>();

  readonly statusChanged =
    output<TaskStatusChangeEvent>();

  // =========================================
  // 5. PRESENTATION CONFIGURATION
  // =========================================

  readonly priorityStyles = PRIORITY_STYLES;

  readonly columns = [
    {
      status: 'todo',
      label: 'To Do',
      dotClass: 'bg-slate-400'
    },
    {
      status: 'in_progress',
      label: 'In Progress',
      dotClass: 'bg-blue-500'
    },
    {
      status: 'completed',
      label: 'Completed',
      dotClass: 'bg-emerald-500'
    },
    {
      status: 'archived',
      label: 'Archived',
      dotClass: 'bg-violet-500'
    }
  ] satisfies readonly KanbanColumn[];

  // =========================================
  // 6. COMPUTED TASK GROUPING
  // =========================================

  readonly groupedTasks = computed(() => {

    const groups: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      completed: [],
      archived: []
    };

    for (const task of this.tasks()) {
      groups[task.status].push(task);
    }

    return groups;
  });

  // =========================================
  // 7. DRAG AND DROP
  // =========================================

  drop(
    event: CdkDragDrop<Task[], Task[], Task>,
    targetStatus: TaskStatus
  ): void {

    // No persistent ordering in V1.
    if (event.previousContainer === event.container) {
      return;
    }

    // Ignore drops outside the intended container.
    if (!event.isPointerOverContainer) {
      return;
    }

    const task = event.item.data;

    // Do not send redundant updates.
    if (task.status === targetStatus) {
      return;
    }

    // Emit an event rather than modifying input data.
    this.statusChanged.emit({
      taskId: task.id,
      newStatus: targetStatus
    });
  }
}
