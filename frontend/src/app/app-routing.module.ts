import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { ThemesComponent } from './pages/themes/themes.component';
import { PhasesComponent } from './pages/phases/phases.component';
import { QuestionsComponent } from './pages/questions/questions.component';
import { UploadQuestionsComponent } from './pages/upload-questions/upload-questions.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [

  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'themes', component: ThemesComponent },
      { path: 'phases', component: PhasesComponent },
      { path: 'questions', component: QuestionsComponent },
      { path: 'upload', component: UploadQuestionsComponent },
      { path: '', redirectTo: 'themes', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
