import { Component, input } from '@angular/core';
import { Task } from '../../models/task.model';

@Component({
  imports: [],
  selector: 'app-task-filter',
  styleUrl: './task-filter.css',
  templateUrl: './task-filter.html',
})
export class TaskFilter {

  tasks = input.required<Task []>() ; 
}
