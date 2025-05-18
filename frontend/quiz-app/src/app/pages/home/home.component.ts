import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { QuizService } from '../../services/quiz.service';
import { Tema } from '../../models/tema.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <h1>HublastQuiz</h1>
        <p>Teste seus conhecimentos em diversos temas</p>
      </div>
      
      <div class="temas-section">
        <div class="temas-header">
          <h2>Escolha um tema</h2>
          <button class="btn btn-primary" (click)="criarNovoTema()">
            Criar Novo Tema
          </button>
        </div>
        
        <div class="temas-grid">
          @for (tema of temas; track tema.id) {
            <div class="tema-card" (click)="selecionarTema(tema)">
              <h3>{{ tema.titulo }}</h3>
              <p>{{ tema.descricao }}</p>
            </div>
          } @empty {
            <div class="empty-state">
              <p>Nenhum tema disponível no momento.</p>
              <button class="btn btn-primary" (click)="criarNovoTema()">
                Criar Primeiro Tema
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  temas: Tema[] = [];

  constructor(
    private apiService: ApiService,
    private quizService: QuizService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarTemas();
  }

  carregarTemas(): void {
    this.apiService.getTemas().subscribe({
      next: (temas) => {
        this.temas = temas;
      },
      error: (erro) => {
        console.error('Erro ao carregar temas:', erro);
      }
    });
  }

  selecionarTema(tema: Tema): void {
    this.quizService.setTemaAtual(tema);
    this.router.navigate(['/temas', tema.id]);
  }

  criarNovoTema(): void {
    this.router.navigate(['/criar-tema']);
  }
} 