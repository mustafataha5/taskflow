import { Component, input, output } from '@angular/core';
import { Task } from '../../models/task.model';
import { TaskCard } from '../task-card/task-card';

@Component({
  imports: [TaskCard],
  selector: 'app-task-list',
  styleUrl: './task-list.css',
  templateUrl: './task-list.html',
})
export class TaskList {

   // Data received from TaskListPage
  readonly tasks = input.required<Task[]>();

  // Event forwarded to TaskListPage
  readonly deleteTask = output<number>();

  onDeleteTask(id: number): void {
    // TODO: Forward the deleted task ID to the parent.
    this.deleteTask.emit(id);
  }
}
