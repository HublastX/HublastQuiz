import { Injectable } from '@angular/core';

export interface Theme {
  id: number;
  name: string;
  description: string;
}

export interface Phase {
  id: number;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizDataService {
  private themes: Theme[] = [];
  private phases: Phase[] = [];

  getThemes(): Theme[] {
    return this.themes;
  }

  addTheme(theme: Theme) {
    this.themes.push(theme);
  }

  getPhases(): Phase[] {
    return this.phases;
  }

  addPhase(phase: Phase) {
    this.phases.push(phase);
  }
}
