import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Fase } from '../../models/fase.model';
import { Tema } from '../../models/tema.model';

interface AlternativaForm {
  texto: string;
  correta: boolean;
}

interface PerguntaForm {
  texto: string;
  alternativas: AlternativaForm[];
}

@Component({
  selector: 'app-criar-perguntas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="criar-perguntas-container">
      <h2>Criar Perguntas</h2>
      
      @if (tema && fase) {
        <div class="info-header">
          <div class="tema-info">
            <span class="label">Tema:</span>
            <span class="valor">{{ tema.titulo }}</span>
          </div>
          <div class="fase-info">
            <span class="label">Fase:</span>
            <span class="valor">{{ fase.titulo }}</span>
          </div>
        </div>
      }
      
      <div class="tabs">
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'manual'"
          (click)="activeTab = 'manual'"
        >
          Criação Manual
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'ia'"
          (click)="activeTab = 'ia'"
        >
          Geração por IA
        </button>
      </div>
      
      @if (activeTab === 'manual') {
        <div class="tab-content">
          <div class="perguntas-list">
            @for (pergunta of perguntas; track i; let i = $index) {
              <div class="pergunta-card">
                <div class="pergunta-header">
                  <h3>Pergunta {{ i + 1 }}</h3>
                  <button class="btn-remove" (click)="removerPergunta(i)" *ngIf="perguntas.length > 1">
                    <span>×</span>
                  </button>
                </div>
                
                <div class="form-group">
                  <label for="pergunta-{{ i }}">Texto da pergunta</label>
                  <textarea 
                    id="pergunta-{{ i }}" 
                    name="pergunta-{{ i }}" 
                    [(ngModel)]="pergunta.texto" 
                    required 
                    class="form-control"
                    placeholder="Digite a pergunta"
                    rows="2"
                  ></textarea>
                </div>
                
                <div class="alternativas-section">
                  <h4>Alternativas</h4>
                  
                  @for (alternativa of pergunta.alternativas; track j; let j = $index) {
                    <div class="alternativa-item">
                      <div class="alternativa-header">
                        <h5>Alternativa {{ j + 1 }}</h5>
                        <button class="btn-remove" (click)="removerAlternativa(i, j)" *ngIf="pergunta.alternativas.length > 2">
                          <span>×</span>
                        </button>
                      </div>
                      
                      <div class="alternativa-content">
                        <div class="form-group">
                          <label for="alt-{{ i }}-{{ j }}">Texto</label>
                          <input 
                            type="text" 
                            id="alt-{{ i }}-{{ j }}" 
                            name="alt-{{ i }}-{{ j }}" 
                            [(ngModel)]="alternativa.texto" 
                            required 
                            class="form-control"
                            placeholder="Digite a alternativa"
                          >
                        </div>
                        
                        <div class="form-check">
                          <input 
                            type="radio" 
                            id="correta-{{ i }}-{{ j }}" 
                            name="correta-{{ i }}" 
                            [value]="j"
                            [(ngModel)]="pergunta.alternativaCorretaIndex" 
                            class="form-check-input"
                          >
                          <label class="form-check-label" for="correta-{{ i }}-{{ j }}">
                            Alternativa correta
                          </label>
                        </div>
                      </div>
                    </div>
                  }
                  
                  <button type="button" class="btn btn-outline btn-sm" (click)="adicionarAlternativa(i)" [disabled]="pergunta.alternativas.length >= 4">
                    Adicionar Alternativa
                  </button>
                </div>
              </div>
            }
            
            <button type="button" class="btn btn-outline" (click)="adicionarPergunta()">
              Adicionar Pergunta
            </button>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-outline" (click)="cancelar()">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="salvarPerguntas()" [disabled]="!formValido()">
              Salvar Perguntas
            </button>
            <button type="button" class="btn btn-secondary" (click)="testarImportacao()">
              Testar Importação
            </button>
          </div>
        </div>
      } @else if (activeTab === 'ia') {
        <div class="tab-content">
          <div class="form-group">
            <label for="prompt">Descrição para geração de perguntas</label>
            <textarea 
              id="prompt" 
              name="prompt" 
              [(ngModel)]="promptIA" 
              required 
              class="form-control"
              placeholder="Descreva o tipo de perguntas que você deseja gerar. Ex: 'Gerar 5 perguntas sobre programação em JavaScript com 4 alternativas cada'"
              rows="4"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-outline" (click)="cancelar()">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="gerarPerguntasIA()" [disabled]="!promptIA.trim()">
              Gerar Perguntas
            </button>
          </div>
          
          @if (carregandoIA) {
            <div class="loading-ia">
              <div class="spinner"></div>
              <p>Gerando perguntas com IA...</p>
            </div>
          }
        </div>
      }
      
      @if (mensagemErro) {
        <div class="mensagem-erro">
          {{ mensagemErro }}
        </div>
      }
      
      @if (mensagemSucesso) {
        <div class="mensagem-sucesso">
          {{ mensagemSucesso }}
        </div>
      }
    </div>
  `,
  styles: [`
    .criar-perguntas-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    h2 {
      margin-bottom: 1.5rem;
      color: #1e293b;
    }
    
    .info-header {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background-color: #f1f5f9;
      border-radius: 8px;
    }
    
    .tema-info, .fase-info {
      display: flex;
      align-items: center;
    }
    
    .label {
      font-weight: 600;
      color: #475569;
      margin-right: 0.5rem;
    }
    
    .valor {
      color: #1e293b;
    }
    
    .tabs {
      display: flex;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .tab-btn {
      padding: 0.75rem 1.5rem;
      background: none;
      border: none;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .tab-btn.active {
      color: #6366f1;
      border-bottom: 2px solid #6366f1;
      margin-bottom: -2px;
    }
    
    .tab-content {
      margin-top: 1.5rem;
    }
    
    .pergunta-card {
      background-color: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .pergunta-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .pergunta-header h3 {
      margin: 0;
      color: #1e293b;
    }
    
    .btn-remove {
      background: none;
      border: none;
      color: #ef4444;
      font-size: 1.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }
    
    .btn-remove:hover {
      background-color: #fee2e2;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #475569;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    textarea.form-control {
      resize: vertical;
    }
    
    .alternativas-section {
      margin-top: 1.5rem;
    }
    
    .alternativas-section h4 {
      margin-bottom: 1rem;
      color: #334155;
    }
    
    .alternativa-item {
      background-color: #f8fafc;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    
    .alternativa-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    
    .alternativa-header h5 {
      margin: 0;
      color: #334155;
      font-size: 0.95rem;
    }
    
    .alternativa-content {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }
    
    .alternativa-content .form-group {
      flex: 1;
      margin-bottom: 0;
    }
    
    .form-check {
      display: flex;
      align-items: center;
      margin-top: 2rem;
    }
    
    .form-check-input {
      margin-right: 0.5rem;
    }
    
    .form-check-label {
      margin-bottom: 0;
    }
    
    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }
    
    .loading-ia {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 2rem;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(99, 102, 241, 0.1);
      border-left-color: #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .mensagem-erro {
      margin-top: 1rem;
      padding: 0.75rem;
      background-color: #fee2e2;
      color: #ef4444;
      border-radius: 6px;
      font-size: 0.95rem;
    }
    
    .mensagem-sucesso {
      margin-top: 1rem;
      padding: 0.75rem;
      background-color: #dcfce7;
      color: #10b981;
      border-radius: 6px;
      font-size: 0.95rem;
    }
  `]
})
export class CriarPerguntasComponent implements OnInit {
  tema: Tema | null = null;
  fase: Fase | null = null;
  
  activeTab: 'manual' | 'ia' = 'manual';
  
  perguntas: Array<PerguntaForm & { alternativaCorretaIndex: number }> = [];
  
  promptIA: string = '';
  carregandoIA: boolean = false;
  
  mensagemErro: string | null = null;
  mensagemSucesso: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const faseId = params.get('faseId');
      if (faseId) {
        this.carregarFase(faseId);
      } else {
        this.router.navigate(['/']);
      }
    });
    
    // Inicializar com uma pergunta vazia
    this.adicionarPergunta();
  }
  
  carregarFase(faseId: string): void {
    this.apiService.getFase(faseId).subscribe({
      next: (fase) => {
        this.fase = fase;
        if (fase.tema_id) {
          this.carregarTema(fase.tema_id);
        }
      },
      error: (erro) => {
        console.error('Erro ao carregar fase:', erro);
        this.mensagemErro = 'Erro ao carregar informações da fase.';
      }
    });
  }
  
  carregarTema(temaId: string): void {
    this.apiService.getTema(temaId).subscribe({
      next: (tema) => {
        this.tema = tema;
      },
      error: (erro) => {
        console.error('Erro ao carregar tema:', erro);
        this.mensagemErro = 'Erro ao carregar informações do tema.';
      }
    });
  }
  
  adicionarPergunta(): void {
    this.perguntas.push({
      texto: '',
      alternativas: [
        { texto: '', correta: false },
        { texto: '', correta: false }
      ],
      alternativaCorretaIndex: 0
    });
  }
  
  removerPergunta(index: number): void {
    this.perguntas.splice(index, 1);
  }
  
  adicionarAlternativa(perguntaIndex: number): void {
    if (this.perguntas[perguntaIndex].alternativas.length < 4) {
      this.perguntas[perguntaIndex].alternativas.push({
        texto: '',
        correta: false
      });
    }
  }
  
  removerAlternativa(perguntaIndex: number, alternativaIndex: number): void {
    const pergunta = this.perguntas[perguntaIndex];
    
    // Ajustar o índice da alternativa correta se necessário
    if (pergunta.alternativaCorretaIndex === alternativaIndex) {
      pergunta.alternativaCorretaIndex = 0;
    } else if (pergunta.alternativaCorretaIndex > alternativaIndex) {
      pergunta.alternativaCorretaIndex--;
    }
    
    pergunta.alternativas.splice(alternativaIndex, 1);
  }
  
  formValido(): boolean {
    // Verificar se todas as perguntas têm texto
    const todasPerguntasTemTexto = this.perguntas.every(p => p.texto.trim() !== '');
    
    // Verificar se todas as alternativas têm texto
    const todasAlternativasTemTexto = this.perguntas.every(p => 
      p.alternativas.every(a => a.texto.trim() !== '')
    );
    
    return todasPerguntasTemTexto && todasAlternativasTemTexto;
  }
  
  salvarPerguntas(): void {
    this.mensagemErro = null;
    this.mensagemSucesso = null;
    
    if (!this.fase || !this.fase.id) {
      this.mensagemErro = 'Fase não encontrada.';
      return;
    }
    
    // Verificar se cada pergunta tem uma alternativa correta
    const perguntasInvalidas = this.perguntas.filter(p => 
      p.alternativaCorretaIndex === undefined || p.alternativaCorretaIndex < 0 || 
      p.alternativaCorretaIndex >= p.alternativas.length
    );
    
    if (perguntasInvalidas.length > 0) {
      this.mensagemErro = 'Cada pergunta deve ter uma alternativa marcada como correta.';
      return;
    }
    
    // Preparar os dados no formato exato esperado pelo backend
    const perguntasFormatadas = this.formatarPerguntasParaBackend();
    
    // Logar os dados que estão sendo enviados
    console.log('Dados enviados para API:', JSON.stringify(perguntasFormatadas));
    console.log('Estrutura de dados:');
    console.log('- Tipo de dados:', typeof perguntasFormatadas);
    console.log('- Propriedades:', Object.keys(perguntasFormatadas));
    console.log('- Tipo de perguntas:', Array.isArray(perguntasFormatadas.perguntas) ? 'Array' : typeof perguntasFormatadas.perguntas);
    console.log('- Número de perguntas:', perguntasFormatadas.perguntas.length);
    if (perguntasFormatadas.perguntas.length > 0) {
      console.log('- Primeira pergunta:', perguntasFormatadas.perguntas[0]);
      console.log('- Propriedades da primeira pergunta:', Object.keys(perguntasFormatadas.perguntas[0]));
      if (perguntasFormatadas.perguntas[0].alternativas) {
        console.log('- Tipo de alternativas:', Array.isArray(perguntasFormatadas.perguntas[0].alternativas) ? 'Array' : typeof perguntasFormatadas.perguntas[0].alternativas);
        console.log('- Número de alternativas:', perguntasFormatadas.perguntas[0].alternativas.length);
        if (perguntasFormatadas.perguntas[0].alternativas.length > 0) {
          console.log('- Primeira alternativa:', perguntasFormatadas.perguntas[0].alternativas[0]);
        }
      }
    }
    
    // Enviar para a API
    this.apiService.importarPerguntas(this.tema!.id, this.fase.id, perguntasFormatadas).subscribe({
      next: (resposta) => {
        console.log('Perguntas salvas com sucesso:', resposta);
        this.mensagemSucesso = `${resposta.perguntas_importadas} perguntas e ${resposta.alternativas_importadas} alternativas foram salvas com sucesso!`;
        
        // Limpar o formulário após sucesso
        setTimeout(() => {
          if (this.fase && this.tema) {
            this.router.navigate(['/temas', this.tema.id]);
          }
        }, 2000);
      },
      error: (erro) => {
        console.error('Erro ao salvar perguntas:', erro);
        if (erro.status === 422) {
          this.mensagemErro = 'Erro de validação: Verifique se todas as perguntas têm texto e se cada pergunta tem pelo menos uma alternativa correta.';
          if (erro.error && erro.error.detail) {
            console.error('Detalhes do erro:', erro.error.detail);
            this.mensagemErro += ' Detalhes: ' + erro.error.detail;
          }
        } else {
          this.mensagemErro = 'Ocorreu um erro ao salvar as perguntas. Por favor, tente novamente.';
        }
      }
    });
  }
  
  testarImportacao(): void {
    this.mensagemErro = null;
    this.mensagemSucesso = null;
    
    if (!this.fase || !this.fase.id || !this.tema || !this.tema.id) {
      this.mensagemErro = 'Fase ou tema não encontrado.';
      return;
    }
    
    // Usar o endpoint de teste
    this.apiService.testarImportarPerguntas(this.tema.id, this.fase.id).subscribe({
      next: (resposta) => {
        console.log('Teste de importação bem-sucedido:', resposta);
        this.mensagemSucesso = `TESTE: ${resposta.perguntas_importadas} perguntas e ${resposta.alternativas_importadas} alternativas foram importadas com sucesso!`;
      },
      error: (erro) => {
        console.error('Erro no teste de importação:', erro);
        this.mensagemErro = 'Ocorreu um erro no teste de importação. Por favor, tente novamente.';
      }
    });
  }
  
  gerarPerguntasIA(): void {
    this.mensagemErro = null;
    this.mensagemSucesso = null;
    this.carregandoIA = true;
    
    if (!this.fase || !this.fase.id || !this.tema || !this.tema.id) {
      this.mensagemErro = 'Tema ou fase não encontrados.';
      this.carregandoIA = false;
      return;
    }
    
    const dados = {
      prompt: this.promptIA,
      tema_id: this.tema.id,
      fase_id: this.fase.id
    };
    
    this.apiService.gerarPerguntasIA(dados).subscribe({
      next: (resposta) => {
        console.log('Perguntas geradas com sucesso:', resposta);
        this.carregandoIA = false;
        this.mensagemSucesso = `${resposta.perguntas_importadas} perguntas e ${resposta.alternativas_importadas} alternativas foram geradas com sucesso!`;
        
        // Redirecionar após sucesso
        setTimeout(() => {
          if (this.tema) {
            this.router.navigate(['/temas', this.tema.id]);
          }
        }, 2000);
      },
      error: (erro) => {
        console.error('Erro ao gerar perguntas:', erro);
        this.carregandoIA = false;
        this.mensagemErro = 'Ocorreu um erro ao gerar as perguntas com IA. Por favor, tente novamente.';
      }
    });
  }
  
  cancelar(): void {
    if (this.tema) {
      this.router.navigate(['/temas', this.tema.id]);
    } else {
      this.router.navigate(['/']);
    }
  }
  
  // Função para formatar os dados exatamente como o backend espera
  private formatarPerguntasParaBackend(): any {
    const perguntasFormatadas = this.perguntas.map(p => {
      // Formatar alternativas
      const alternativas = p.alternativas.map((a, index) => {
        return {
          texto: a.texto.trim(),
          correta: index === p.alternativaCorretaIndex,
          letra: String.fromCharCode(65 + index) // A, B, C, D...
        };
      });
      
      // Formatar pergunta
      return {
        pergunta: p.texto.trim(),
        alternativas: alternativas
      };
    });
    
    // Retornar no formato esperado pelo backend
    return {
      perguntas: perguntasFormatadas
    };
  }
} 