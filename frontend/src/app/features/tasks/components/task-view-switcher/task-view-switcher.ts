import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskView } from '../../models/task.model';

@Component({
  selector: 'app-task-view-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-view-switcher.html',
  styleUrl: './task-view-switcher.css'
})
export class TaskViewSwitcher {
  readonly view = input.required<TaskView>();
  readonly viewChange = output<TaskView>();

  readonly views: {
    value: TaskView;
    label: string;
  }[] = [
    { value: 'list', label: 'List' },
    { value: 'table', label: 'Table' },
    { value: 'board', label: 'Board' }
  ];

  changeView(newView: TaskView): void {
    if (this.view() !== newView) {
      this.viewChange.emit(newView);
    }
  }
}