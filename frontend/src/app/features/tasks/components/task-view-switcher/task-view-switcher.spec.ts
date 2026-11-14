import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskViewSwitcher } from './task-view-switcher';

describe('TaskViewSwitcher', () => {
  let component: TaskViewSwitcher;
  let fixture: ComponentFixture<TaskViewSwitcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskViewSwitcher],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskViewSwitcher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
