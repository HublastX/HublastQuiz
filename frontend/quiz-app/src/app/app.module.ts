import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { YourQuizzesComponent } from './your-quizzes/your-quizzes.component';
import { CreateQuizComponent } from './create-quiz/create-quiz.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    YourQuizzesComponent,
    CreateQuizComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
