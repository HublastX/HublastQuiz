import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tema } from '../models/tema.model';
import { Fase } from '../models/fase.model';
import { Pergunta } from '../models/pergunta.model';
import { Alternativa } from '../models/alternativa.model';

export interface RespostaImportacao {
  mensagem: string;
  perguntas_importadas: number;
  alternativas_importadas: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3010';
  private userId = '464cf4d0-cf5c-4f46-be0b-91ec486e07cb'; // UUID v4 válido

  constructor(private http: HttpClient) { }

  // Temas
  getTemas(): Observable<Tema[]> {
    return this.http.get<Tema[]>(`${this.apiUrl}/temas/?user_id=${this.userId}`);
  }

  getTema(id: string): Observable<Tema> {
    return this.http.get<Tema>(`${this.apiUrl}/temas/${id}`);
  }

  criarTema(tema: Partial<Tema>): Observable<Tema> {
    const temaComUserId = { ...tema, user_id: this.userId };
    return this.http.post<Tema>(`${this.apiUrl}/temas/`, temaComUserId);
  }

  // Fases
  getFasesByTema(temaId: string): Observable<Fase[]> {
    return this.http.get<Fase[]>(`${this.apiUrl}/fases/tema/${temaId}`);
  }

  getFase(id: string): Observable<Fase> {
    return this.http.get<Fase>(`${this.apiUrl}/fases/${id}`);
  }

  criarFase(fase: Partial<Fase>): Observable<Fase> {
    const faseComUserId = { ...fase, user_id: this.userId };
    return this.http.post<Fase>(`${this.apiUrl}/fases/?tema_id=${fase.tema_id}`, faseComUserId);
  }

  // Perguntas
  getPerguntasByFase(faseId: string): Observable<Pergunta[]> {
    return this.http.get<Pergunta[]>(`${this.apiUrl}/perguntas/fase/${faseId}`);
  }

  getPergunta(id: string): Observable<Pergunta> {
    return this.http.get<Pergunta>(`${this.apiUrl}/perguntas/${id}`);
  }

  // Alternativas
  getAlternativasByPergunta(perguntaId: string): Observable<Alternativa[]> {
    return this.http.get<Alternativa[]>(`${this.apiUrl}/alternativas/pergunta/${perguntaId}`);
  }

  // Importar perguntas via IA ou manualmente
  importarPerguntas(temaId: string, faseId: string, dados: any): Observable<RespostaImportacao> {
    // Remover o uso do objeto fixo dadosTeste e usar os dados fornecidos
    return this.http.post<RespostaImportacao>(
      `${this.apiUrl}/importar/${temaId}/${faseId}?user_id=${this.userId}`, 
      dados
    );
  }
  
  // Testar importação de perguntas
  testarImportarPerguntas(temaId: string, faseId: string): Observable<RespostaImportacao> {
    return this.http.post<RespostaImportacao>(`${this.apiUrl}/importar/teste-simples`, {});
  }

  // Gerar perguntas com IA
  gerarPerguntasIA(dados: { prompt: string, tema_id: string, fase_id: string }): Observable<RespostaImportacao> {
    return this.http.post<RespostaImportacao>(`${this.apiUrl}/gerar-perguntas?user_id=${this.userId}`, dados);
  }

  // Upload de PDF
  uploadPDF(temaId: string, faseId: string, file: File): Observable<RespostaImportacao> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<RespostaImportacao>(
      `${this.apiUrl}/upload-pdf/${temaId}/${faseId}?user_id=${this.userId}`, 
      formData
    );
  }
} 