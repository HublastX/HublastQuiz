import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { QuizService } from '../../services/quiz.service';
import { Fase } from '../../models/fase.model';
import { Pergunta } from '../../models/pergunta.model';
import { Alternativa } from '../../models/alternativa.model';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quiz-container">
      <div class="quiz-header">
        <button class="btn-voltar" (click)="voltar()">
          <span>←</span> Voltar
        </button>
        
        @if (fase) {
          <h1>{{ fase.titulo }}</h1>
          <p class="fase-descricao">{{ fase.descricao }}</p>
        } @else {
          <h1>Carregando quiz...</h1>
        }
      </div>
      
      @if (perguntaAtual && perguntaIndex !== null) {
        <div class="quiz-progress">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="(perguntaIndex + 1) / totalPerguntas * 100"></div>
          </div>
          <div class="progress-text">
            Pergunta {{ perguntaIndex + 1 }} de {{ totalPerguntas }}
          </div>
        </div>
        
        <div class="pergunta-card">
          <h2 class="pergunta-texto">{{ perguntaAtual.texto }}</h2>
          
          <div class="alternativas-lista">
            @for (alternativa of perguntaAtual.alternativas; track alternativa.id) {
              <div 
                class="alternativa-item" 
                [class.selecionada]="alternativaSelecionada === alternativa.id"
                (click)="selecionarAlternativa(alternativa.id)"
              >
                <div class="alternativa-marker">
                  @if (alternativaSelecionada === alternativa.id) {
                    <div class="marker-selected"></div>
                  }
                </div>
                <div class="alternativa-texto">
                  {{ alternativa.texto }}
                </div>
              </div>
            }
          </div>
        </div>
        
        <div class="quiz-navigation">
          <button 
            class="btn btn-outline" 
            [disabled]="perguntaIndex === 0"
            (click)="perguntaAnterior()"
          >
            Anterior
          </button>
          
          <button 
            class="btn btn-primary" 
            [disabled]="!alternativaSelecionada"
            (click)="proximaPergunta()"
          >
            @if (perguntaIndex === totalPerguntas - 1) {
              Finalizar
            } @else {
              Próxima
            }
          </button>
        </div>
      } @else if (carregando) {
        <div class="loading-state">
          <p>Carregando perguntas...</p>
        </div>
      } @else if (finalizado) {
        <div class="resultado-card">
          <h2>Quiz finalizado!</h2>
          <div class="pontuacao">
            <span class="pontuacao-valor">{{ pontuacao }}</span>
            <span class="pontuacao-total">/ {{ totalPerguntas }}</span>
          </div>
          <p class="pontuacao-texto">
            @if (pontuacao === totalPerguntas) {
              Parabéns! Você acertou todas as perguntas!
            } @else if (pontuacao > totalPerguntas * 0.7) {
              Muito bom! Você teve um ótimo desempenho.
            } @else if (pontuacao > totalPerguntas * 0.5) {
              Bom trabalho! Continue praticando.
            } @else {
              Continue estudando e tente novamente.
            }
          </p>
          <div class="resultado-acoes">
            <button class="btn btn-outline" (click)="reiniciarQuiz()">
              Tentar novamente
            </button>
            <button class="btn btn-primary" (click)="voltar()">
              Voltar para fases
            </button>
          </div>
        </div>
      } @else {
        <div class="empty-state">
          <p>Nenhuma pergunta disponível para esta fase.</p>
          <button class="btn btn-primary" (click)="voltar()">
            Voltar para fases
          </button>
        </div>
      }
    </div>
  `,
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit {
  fase: Fase | null = null;
  perguntas: Pergunta[] = [];
  perguntaAtual: Pergunta | null = null;
  perguntaIndex: number | null = null;
  totalPerguntas: number = 0;
  alternativaSelecionada: string | null = null;
  alternativasCorretas = new Map<string, string>();
  carregando: boolean = true;
  finalizado: boolean = false;
  pontuacao: number = 0;

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
        this.carregarFase(id);
        this.carregarPerguntas(id);
      }
    });

    this.quizService.perguntaAtual$.subscribe(pergunta => {
      this.perguntaAtual = pergunta;
      if (pergunta) {
        this.carregarAlternativas(pergunta.id);
      }
    });

    this.quizService.perguntaIndex$.subscribe(index => {
      this.perguntaIndex = index;
    });

    this.quizService.respostas$.subscribe(respostas => {
      if (this.perguntaAtual) {
        this.alternativaSelecionada = respostas.get(this.perguntaAtual.id) || null;
      }
    });
  }

  carregarFase(id: string): void {
    this.apiService.getFase(id).subscribe({
      next: (fase) => {
        this.fase = fase;
        this.quizService.setFaseAtual(fase);
      },
      error: (erro) => {
        console.error('Erro ao carregar fase:', erro);
      }
    });
  }

  carregarPerguntas(faseId: string): void {
    this.apiService.getPerguntasByFase(faseId).subscribe({
      next: (perguntas) => {
        this.perguntas = perguntas;
        this.totalPerguntas = perguntas.length;
        this.quizService.setPerguntas(perguntas);
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar perguntas:', erro);
        this.carregando = false;
      }
    });
  }

  carregarAlternativas(perguntaId: string): void {
    if (!this.perguntaAtual || this.perguntaAtual.alternativas) return;
    
    this.apiService.getAlternativasByPergunta(perguntaId).subscribe({
      next: (alternativas) => {
        if (this.perguntaAtual) {
          this.perguntaAtual.alternativas = alternativas;
          
          // Armazenar a alternativa correta
          const alternativaCorreta = alternativas.find(alt => alt.correta);
          if (alternativaCorreta) {
            this.alternativasCorretas.set(perguntaId, alternativaCorreta.id);
          }
        }
      },
      error: (erro) => {
        console.error('Erro ao carregar alternativas:', erro);
      }
    });
  }

  selecionarAlternativa(alternativaId: string): void {
    if (this.perguntaAtual) {
      this.alternativaSelecionada = alternativaId;
      this.quizService.responder(this.perguntaAtual.id, alternativaId);
    }
  }

  proximaPergunta(): void {
    if (this.perguntaIndex === this.totalPerguntas - 1) {
      this.finalizarQuiz();
    } else {
      this.quizService.proximaPergunta();
      this.alternativaSelecionada = null;
    }
  }

  perguntaAnterior(): void {
    this.quizService.perguntaAnterior();
  }

  finalizarQuiz(): void {
    this.quizService.calcularPontuacao(this.alternativasCorretas);
    this.quizService.pontuacao$.subscribe(pontuacao => {
      this.pontuacao = pontuacao;
    });
    this.finalizado = true;
  }

  reiniciarQuiz(): void {
    this.finalizado = false;
    this.quizService.resetQuiz();
    if (this.fase) {
      this.carregarPerguntas(this.fase.id);
    }
  }

  voltar(): void {
    if (this.fase) {
      this.router.navigate(['/temas', this.fase.tema_id]);
    } else {
      this.router.navigate(['/']);
    }
  }
} 