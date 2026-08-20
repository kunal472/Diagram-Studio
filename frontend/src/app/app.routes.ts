import { Routes } from '@angular/router';
import { StudioDashboardComponent } from './components/studio-dashboard/studio-dashboard.component';
import { WorkspaceListComponent } from './components/workspace-list/workspace-list.component';

export const routes: Routes = [
  {
    path: '',
    component: StudioDashboardComponent,
    title: 'Studio | Interactive Diagram & Flowchart Studio'
  },
  {
    path: 'workspaces',
    component: WorkspaceListComponent,
    title: 'Saved Workspaces | Diagram Studio'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
