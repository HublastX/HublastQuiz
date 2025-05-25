import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { YourQuizzesComponent } from './your-quizzes/your-quizzes.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'seus-quizzes', component: YourQuizzesComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
