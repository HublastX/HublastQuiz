import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Tema } from '../../models/tema.model';
import { Fase } from '../../models/fase.model';

@Component({
  selector: 'app-criar-fase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="criar-fase-container">
      <h2>Criar Nova Fase</h2>
      
      @if (tema) {
        <div class="tema-info">
          <span class="tema-label">Tema:</span>
          <span class="tema-titulo">{{ tema.titulo }}</span>
        </div>
      }
      
      <form (ngSubmit)="onSubmit()" #faseForm="ngForm">
        <div class="form-group">
          <label for="titulo">Título</label>
          <input 
            type="text" 
            id="titulo" 
            name="titulo" 
            [(ngModel)]="fase.titulo" 
            required 
            class="form-control"
            placeholder="Digite o título da fase"
          >
        </div>
        
        <div class="form-group">
          <label for="descricao">Descrição</label>
          <textarea 
            id="descricao" 
            name="descricao" 
            [(ngModel)]="fase.descricao" 
            class="form-control"
            placeholder="Digite uma descrição para a fase"
            rows="4"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="ordem">Ordem</label>
          <input 
            type="number" 
            id="ordem" 
            name="ordem" 
            [(ngModel)]="fase.ordem" 
            required 
            min="1"
            class="form-control"
            placeholder="Digite a ordem da fase"
          >
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="cancelar()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="!faseForm.form.valid">Criar Fase</button>
        </div>
      </form>
      
      @if (mensagemErro) {
        <div class="mensagem-erro">
          {{ mensagemErro }}
        </div>
      }
    </div>
  `,
  styles: [`
    .criar-fase-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    h2 {
      margin-bottom: 1.5rem;
      color: #1e293b;
    }
    
    .tema-info {
      margin-bottom: 1.5rem;
      padding: 0.75rem 1rem;
      background-color: #f1f5f9;
      border-radius: 6px;
    }
    
    .tema-label {
      font-weight: 600;
      color: #475569;
      margin-right: 0.5rem;
    }
    
    .tema-titulo {
      color: #1e293b;
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
    
    input[type="number"].form-control {
      width: 150px;
    }
    
    textarea.form-control {
      resize: vertical;
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
  `]
})
export class CriarFaseComponent implements OnInit {
  tema: Tema | null = null;
  fase: Partial<Fase> = {
    titulo: '',
    descricao: '',
    ordem: 1
  };
  
  mensagemErro: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const temaId = params.get('temaId');
      if (temaId) {
        this.fase.tema_id = temaId;
        this.carregarTema(temaId);
      } else {
        this.router.navigate(['/']);
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
  
  onSubmit(): void {
    this.mensagemErro = null;
    
    if (!this.fase.tema_id) {
      this.mensagemErro = 'ID do tema não encontrado.';
      return;
    }
    
    this.apiService.criarFase(this.fase).subscribe({
      next: (faseCriada) => {
        console.log('Fase criada com sucesso:', faseCriada);
        this.router.navigate(['/temas', this.fase.tema_id]);
      },
      error: (erro) => {
        console.error('Erro ao criar fase:', erro);
        this.mensagemErro = 'Ocorreu um erro ao criar a fase. Por favor, tente novamente.';
      }
    });
  }
  
  cancelar(): void {
    if (this.fase.tema_id) {
      this.router.navigate(['/temas', this.fase.tema_id]);
    } else {
      this.router.navigate(['/']);
    }
  }
} 