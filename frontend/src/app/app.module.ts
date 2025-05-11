import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { ThemesComponent } from './pages/themes/themes.component';
import { PhasesComponent } from './pages/phases/phases.component';
import { QuestionsComponent } from './pages/questions/questions.component';
import { UploadQuestionsComponent } from './pages/upload-questions/upload-questions.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    ThemesComponent,
    PhasesComponent,
    QuestionsComponent,
    UploadQuestionsComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
