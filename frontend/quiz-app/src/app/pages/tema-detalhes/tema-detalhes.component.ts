import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { QuizService } from '../../services/quiz.service';
import { Tema } from '../../models/tema.model';
import { Fase } from '../../models/fase.model';

@Component({
  selector: 'app-tema-detalhes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tema-container">
      <div class="tema-header">
        <button class="btn-voltar" (click)="voltar()">
          <span>←</span> Voltar
        </button>
        
        @if (tema) {
          <h1>{{ tema.titulo }}</h1>
          <p class="tema-descricao">{{ tema.descricao }}</p>
        } @else {
          <h1>Carregando tema...</h1>
        }
      </div>
      
      <div class="fases-section">
        <div class="fases-header">
          <h2>Fases</h2>
          <button class="btn btn-primary" (click)="criarNovaFase()">
            Criar Nova Fase
          </button>
        </div>
        
        <div class="fases-grid">
          @for (fase of fases; track fase.id) {
            <div class="fase-card">
              <div class="fase-numero">{{ fase.ordem }}</div>
              <h3>{{ fase.titulo }}</h3>
              <p>{{ fase.descricao }}</p>
              
              <div class="fase-acoes">
                <button class="btn btn-outline btn-sm" (click)="criarPerguntas(fase)">
                  Criar Perguntas
                </button>
                <button class="btn btn-outline btn-sm" (click)="uploadPerguntas(fase)">
                  Upload PDF
                </button>
                <button class="btn btn-primary btn-sm" (click)="iniciarQuiz(fase)">
                  Iniciar Quiz
                </button>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <p>Nenhuma fase disponível para este tema.</p>
              <button class="btn btn-primary" (click)="criarNovaFase()">
                Criar Primeira Fase
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./tema-detalhes.component.scss']
})
export class TemaDetalhesComponent implements OnInit {
  tema: Tema | null = null;
  fases: Fase[] = [];
  temaId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.temaId = id;
        this.carregarTema(id);
        this.carregarFases(id);
      }
    });
  }

  carregarTema(id: string): void {
    this.apiService.getTema(id).subscribe({
      next: (tema) => {
        this.tema = tema;
        this.quizService.setTemaAtual(tema);
      },
      error: (erro) => {
        console.error('Erro ao carregar tema:', erro);
      }
    });
  }

  carregarFases(temaId: string): void {
    this.apiService.getFasesByTema(temaId).subscribe({
      next: (fases) => {
        this.fases = fases.sort((a, b) => a.ordem - b.ordem);
      },
      error: (erro) => {
        console.error('Erro ao carregar fases:', erro);
      }
    });
  }

  iniciarQuiz(fase: Fase): void {
    this.quizService.setFaseAtual(fase);
    this.router.navigate(['/fases', fase.id]);
  }

  criarNovaFase(): void {
    this.router.navigate(['/criar-fase', this.temaId]);
  }

  criarPerguntas(fase: Fase): void {
    this.router.navigate(['/criar-perguntas', fase.id]);
  }

  uploadPerguntas(fase: Fase): void {
    this.router.navigate(['/upload-perguntas', fase.id]);
  }

  voltar(): void {
    this.router.navigate(['/']);
  }
} 