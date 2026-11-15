import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskKanban } from './task-kanban';

describe('TaskKanban', () => {
  let component: TaskKanban;
  let fixture: ComponentFixture<TaskKanban>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskKanban],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskKanban);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
