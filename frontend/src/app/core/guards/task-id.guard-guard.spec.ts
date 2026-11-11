import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { taskIdGuardGuard } from './task-id.guard-guard';

describe('taskIdGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => taskIdGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
