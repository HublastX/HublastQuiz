import { Component } from '@angular/core';

interface Theme {
  id: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-themes',
  standalone: false,
  templateUrl: './themes.component.html',
  styleUrl: './themes.component.scss'
})
export class ThemesComponent {
  themes: Theme[] = [];
  name: string = '';
  description: string = '';
  editingId: number | null = null;

  addOrUpdateTheme() {
    if (!this.name.trim() || !this.description.trim()) return;

    if (this.editingId !== null) {
      // Edição
      const theme = this.themes.find(t => t.id === this.editingId);
      if (theme) {
        theme.name = this.name;
        theme.description = this.description;
      }
      this.editingId = null;
    } else {
      // Criação
      const newTheme: Theme = {
        id: Date.now(),
        name: this.name,
        description: this.description
      };
      this.themes.push(newTheme);
    }

    this.name = '';
    this.description = '';
  }

  editTheme(theme: Theme) {
    this.name = theme.name;
    this.description = theme.description;
    this.editingId = theme.id;
  }

  deleteTheme(id: number) {
    this.themes = this.themes.filter(t => t.id !== id);
  }
}
