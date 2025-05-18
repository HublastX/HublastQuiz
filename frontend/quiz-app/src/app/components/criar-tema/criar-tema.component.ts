import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Tema } from '../../models/tema.model';

@Component({
  selector: 'app-criar-tema',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="criar-tema-container">
      <h2>Criar Novo Tema</h2>
      
      <form (ngSubmit)="onSubmit()" #temaForm="ngForm">
        <div class="form-group">
          <label for="titulo">Título</label>
          <input 
            type="text" 
            id="titulo" 
            name="titulo" 
            [(ngModel)]="tema.titulo" 
            required 
            class="form-control"
            placeholder="Digite o título do tema"
          >
        </div>
        
        <div class="form-group">
          <label for="descricao">Descrição</label>
          <textarea 
            id="descricao" 
            name="descricao" 
            [(ngModel)]="tema.descricao" 
            class="form-control"
            placeholder="Digite uma descrição para o tema"
            rows="4"
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="cancelar()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="!temaForm.form.valid">Criar Tema</button>
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
    .criar-tema-container {
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
export class CriarTemaComponent {
  tema: Partial<Tema> = {
    titulo: '',
    descricao: ''
  };
  
  mensagemErro: string | null = null;
  
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}
  
  onSubmit(): void {
    this.mensagemErro = null;
    
    this.apiService.criarTema(this.tema).subscribe({
      next: (temaCriado) => {
        console.log('Tema criado com sucesso:', temaCriado);
        this.router.navigate(['/temas', temaCriado.id]);
      },
      error: (erro) => {
        console.error('Erro ao criar tema:', erro);
        this.mensagemErro = 'Ocorreu um erro ao criar o tema. Por favor, tente novamente.';
      }
    });
  }
  
  cancelar(): void {
    this.router.navigate(['/']);
  }
} 