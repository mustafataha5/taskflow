import { Component, input, output } from '@angular/core';
import { Task } from '../../models/task.model';
import {  DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  imports: [NgClass, DatePipe,RouterLink],
  selector: 'app-task-card',
  styleUrl: './task-card.css',
  templateUrl: './task-card.html',
})
export class TaskCard {

  readonly task = input.required<Task>();
  readonly deleteTask = output<number>();

  onDelete(): void {
    this.deleteTask.emit(this.task().id);
  }
}
