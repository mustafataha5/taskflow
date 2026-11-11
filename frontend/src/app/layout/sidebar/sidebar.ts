
import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  readonly collapsed = input(false);

  readonly toggleCollapse = output<void>();
  readonly navigate = output<void>();

  readonly mainMenu = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'My Tasks', route: '/tasks', icon: 'tasks' },
    { label: 'Projects', route: '/projects', icon: 'projects' },
    { label: 'Analytics', route: '/analytics', icon: 'analytics' },
  ];

  readonly workspaceMenu = [
    { label: 'Team Members', route: '/team', icon: 'team' },
    { label: 'Settings', route: '/settings', icon: 'settings' },
  ];
}
