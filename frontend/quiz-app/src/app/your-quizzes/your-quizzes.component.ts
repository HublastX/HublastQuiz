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
}
