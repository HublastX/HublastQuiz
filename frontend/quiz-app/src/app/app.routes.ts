import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { TemaDetalhesComponent } from './pages/tema-detalhes/tema-detalhes.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { CriarTemaComponent } from './components/criar-tema/criar-tema.component';
import { CriarFaseComponent } from './components/criar-fase/criar-fase.component';
import { CriarPerguntasComponent } from './components/criar-perguntas/criar-perguntas.component';
import { UploadPerguntasComponent } from './components/upload-perguntas/upload-perguntas.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'temas/:id', component: TemaDetalhesComponent },
  { path: 'fases/:id', component: QuizComponent },
  { path: 'criar-tema', component: CriarTemaComponent },
  { path: 'criar-fase/:temaId', component: CriarFaseComponent },
  { path: 'criar-perguntas/:faseId', component: CriarPerguntasComponent },
  { path: 'upload-perguntas/:faseId', component: UploadPerguntasComponent },
  { path: '**', redirectTo: '' }
];
