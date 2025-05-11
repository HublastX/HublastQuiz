import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
   searchTerm: string = '';

   themes = [
    { id: 1, name: 'Matemática', description: 'Perguntas sobre lógica e cálculos' },
    { id: 2, name: 'História', description: 'Perguntas sobre fatos históricos' },
    { id: 3, name: 'Ciências', description: 'Perguntas sobre o mundo natural' },
    { id: 4, name: 'Geografia', description: 'Países, capitais e mapas' },
  ];

  get filteredThemes() {
    return this.themes.filter(theme =>
      theme.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}

