import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Tema } from '../../models/tema.model';
import { Fase } from '../../models/fase.model';

@Component({
  selector: 'app-upload-perguntas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="upload-container">
      <h2>Upload de Perguntas</h2>
      
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
      
      <div class="upload-area" 
        [class.drag-over]="isDragOver"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <div class="upload-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <p class="upload-text">Arraste e solte um arquivo PDF aqui</p>
        <p class="upload-text-small">ou</p>
        <label class="btn btn-primary">
          Selecionar Arquivo
          <input 
            type="file" 
            accept=".pdf" 
            style="display: none;" 
            (change)="onFileSelected($event)"
          >
        </label>
        @if (selectedFile) {
          <p class="selected-file">
            Arquivo selecionado: {{ selectedFile.name }}
          </p>
        }
      </div>
      
      @if (isUploading) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Processando arquivo...</p>
        </div>
      }
      
      <div class="form-actions">
        <button type="button" class="btn btn-outline" (click)="cancelar()">Cancelar</button>
        <button 
          type="button" 
          class="btn btn-primary" 
          [disabled]="!selectedFile || isUploading"
          (click)="uploadFile()"
        >
          Enviar Arquivo
        </button>
      </div>
      
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
    .upload-container {
      max-width: 700px;
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
    
    .upload-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      margin-bottom: 2rem;
      border: 2px dashed #cbd5e1;
      border-radius: 8px;
      background-color: #f8fafc;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    
    .upload-area.drag-over {
      border-color: #6366f1;
      background-color: rgba(99, 102, 241, 0.05);
    }
    
    .upload-icon {
      margin-bottom: 1rem;
      color: #94a3b8;
    }
    
    .upload-text {
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
      color: #475569;
    }
    
    .upload-text-small {
      margin-bottom: 1rem;
      color: #64748b;
    }
    
    .selected-file {
      margin-top: 1rem;
      color: #334155;
      font-size: 0.95rem;
    }
    
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 2rem 0;
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
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
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
export class UploadPerguntasComponent implements OnInit {
  tema: Tema | null = null;
  fase: Fase | null = null;
  
  selectedFile: File | null = null;
  isDragOver: boolean = false;
  isUploading: boolean = false;
  
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
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }
  
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }
  
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files) {
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf') {
          this.selectedFile = file;
        } else {
          this.mensagemErro = 'Por favor, selecione apenas arquivos PDF.';
        }
      }
    }
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'application/pdf') {
        this.selectedFile = file;
        this.mensagemErro = null;
      } else {
        this.mensagemErro = 'Por favor, selecione apenas arquivos PDF.';
      }
    }
  }
  
  uploadFile(): void {
    if (!this.selectedFile || !this.tema || !this.fase) {
      this.mensagemErro = 'Selecione um arquivo PDF e verifique se o tema e a fase estão carregados.';
      return;
    }
    
    this.isUploading = true;
    this.mensagemErro = null;
    this.mensagemSucesso = null;
    
    this.apiService.uploadPDF(this.tema.id, this.fase.id, this.selectedFile).subscribe({
      next: (resposta) => {
        console.log('Upload realizado com sucesso:', resposta);
        this.isUploading = false;
        this.mensagemSucesso = `${resposta.perguntas_importadas} perguntas e ${resposta.alternativas_importadas} alternativas foram importadas com sucesso!`;
        
        // Redirecionar após sucesso
        setTimeout(() => {
          if (this.tema) {
            this.router.navigate(['/temas', this.tema.id]);
          }
        }, 2000);
      },
      error: (erro) => {
        console.error('Erro ao fazer upload:', erro);
        this.isUploading = false;
        this.mensagemErro = 'Ocorreu um erro ao processar o arquivo. Por favor, tente novamente.';
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
} 