## November 15, 2026 — Task Views and Kanban Drag-and-Drop

**Branch:** `feature/task-views`

### Completed

- [x] Implemented Angular Task Table view.
- [x] Implemented Kanban Board with four status columns.
- [x] Integrated unpaginated Kanban data from FastAPI.
- [x] Implemented Angular CDK drag-and-drop.
- [x] Added optimistic task status updates with API persistence.
- [x] Added deletion confirmation across all task views.
- [x] Changed the default pagination size to 12.
- [x] Corrected Next button pagination behavior.
- [x] Added contextual loading and error states.
- [x] Improved task and statistics retry handling.
- [x] Improved responsive Kanban layout and accessibility.

### Architecture Decisions

- List and Table share paginated task state.
- Kanban maintains separate unpaginated task state.
- Angular signals manage state and derived values.
- RxJS `forkJoin` retrieves tasks across four statuses.
- TaskStoreService coordinates API updates and refreshes.
- Kanban components emit events rather than directly calling HTTP APIs.
- Dragging between columns changes task status.
- Ordering within a column is not persisted in V1.

### Next Steps

- Add automated frontend tests.
- Refine drag-and-drop error notifications.
- Complete final V1 testing and documentation.
- Review readiness for the V1 release.
