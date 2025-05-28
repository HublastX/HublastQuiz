import { Component } from '@angular/core';

interface Quiz {
  theme: string;
  phase: string;
}

@Component({
  selector: 'app-your-quizzes',
  templateUrl: './your-quizzes.component.html',
  styleUrls: ['./your-quizzes.component.scss']
})
export class YourQuizzesComponent {
  quizzes: Quiz[] = [
    { theme: 'Matemática', phase: 'Básico' },
    { theme: 'História', phase: 'Intermediário' },
    { theme: 'Ciências', phase: 'Avançado' },
  ];

  // Lista de fases disponíveis
  availablePhases: string[] = ['Básico', 'Intermediário', 'Avançado'];
  
  // Controlar qual seletor está aberto
  openSelectorIndex: number | null = null;

  // Método para alternar a fase de um quiz
  changePhase(quiz: Quiz, newPhase: string): void {
    quiz.phase = newPhase;
    this.openSelectorIndex = null; // Fecha o seletor após a seleção
  }

  // Método para alternar a visibilidade do seletor
  toggleSelector(index: number, event: Event): void {
    event.stopPropagation(); // Impede a propagação do evento
    if (this.openSelectorIndex === index) {
      this.openSelectorIndex = null; // Fecha se já estiver aberto
    } else {
      this.openSelectorIndex = index; // Abre se estiver fechado
    }
  }

  // Método para fechar todos os seletores quando clicar fora
  closeSelectors(): void {
    this.openSelectorIndex = null;
  }
}
