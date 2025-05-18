import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Tema } from '../models/tema.model';
import { Fase } from '../models/fase.model';
import { Pergunta } from '../models/pergunta.model';
import { Alternativa } from '../models/alternativa.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private temaAtualSubject = new BehaviorSubject<Tema | null>(null);
  private faseAtualSubject = new BehaviorSubject<Fase | null>(null);
  private perguntaAtualSubject = new BehaviorSubject<Pergunta | null>(null);
  private perguntasSubject = new BehaviorSubject<Pergunta[]>([]);
  private respostasSubject = new BehaviorSubject<Map<string, string>>(new Map());
  private pontuacaoSubject = new BehaviorSubject<number>(0);
  private perguntaIndexSubject = new BehaviorSubject<number>(0);

  constructor() { }

  // Getters para observables
  get temaAtual$(): Observable<Tema | null> {
    return this.temaAtualSubject.asObservable();
  }

  get faseAtual$(): Observable<Fase | null> {
    return this.faseAtualSubject.asObservable();
  }

  get perguntaAtual$(): Observable<Pergunta | null> {
    return this.perguntaAtualSubject.asObservable();
  }

  get perguntas$(): Observable<Pergunta[]> {
    return this.perguntasSubject.asObservable();
  }

  get respostas$(): Observable<Map<string, string>> {
    return this.respostasSubject.asObservable();
  }

  get pontuacao$(): Observable<number> {
    return this.pontuacaoSubject.asObservable();
  }

  get perguntaIndex$(): Observable<number> {
    return this.perguntaIndexSubject.asObservable();
  }

  // Setters para atualizar o estado
  setTemaAtual(tema: Tema): void {
    this.temaAtualSubject.next(tema);
  }

  setFaseAtual(fase: Fase): void {
    this.faseAtualSubject.next(fase);
    this.resetQuiz();
  }

  setPerguntas(perguntas: Pergunta[]): void {
    this.perguntasSubject.next(perguntas);
    if (perguntas.length > 0) {
      this.perguntaAtualSubject.next(perguntas[0]);
      this.perguntaIndexSubject.next(0);
    }
  }

  // Navegação entre perguntas
  proximaPergunta(): void {
    const index = this.perguntaIndexSubject.value;
    const perguntas = this.perguntasSubject.value;
    
    if (index < perguntas.length - 1) {
      const novoIndex = index + 1;
      this.perguntaIndexSubject.next(novoIndex);
      this.perguntaAtualSubject.next(perguntas[novoIndex]);
    }
  }

  perguntaAnterior(): void {
    const index = this.perguntaIndexSubject.value;
    const perguntas = this.perguntasSubject.value;
    
    if (index > 0) {
      const novoIndex = index - 1;
      this.perguntaIndexSubject.next(novoIndex);
      this.perguntaAtualSubject.next(perguntas[novoIndex]);
    }
  }

  // Resposta e pontuação
  responder(perguntaId: string, alternativaId: string): void {
    const respostas = new Map(this.respostasSubject.value);
    respostas.set(perguntaId, alternativaId);
    this.respostasSubject.next(respostas);
  }

  calcularPontuacao(alternativasCorretas: Map<string, string>): void {
    const respostas = this.respostasSubject.value;
    let pontos = 0;
    
    alternativasCorretas.forEach((alternativaId, perguntaId) => {
      if (respostas.get(perguntaId) === alternativaId) {
        pontos++;
      }
    });
    
    this.pontuacaoSubject.next(pontos);
  }

  // Reset do quiz
  resetQuiz(): void {
    this.perguntasSubject.next([]);
    this.perguntaAtualSubject.next(null);
    this.respostasSubject.next(new Map());
    this.pontuacaoSubject.next(0);
    this.perguntaIndexSubject.next(0);
  }
} 