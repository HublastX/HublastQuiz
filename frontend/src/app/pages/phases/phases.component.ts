import { Component } from '@angular/core';

interface Phase {
  id: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-phases',
  standalone: false,
  templateUrl: './phases.component.html',
  styleUrl: './phases.component.scss'
})
export class PhasesComponent {
   phases: Phase[] = [];
  name: string = '';
  description: string = '';
  editingId: number | null = null;

  addOrUpdatePhase() {
    if (!this.name.trim() || !this.description.trim()) return;

    if (this.editingId !== null) {
      const phase = this.phases.find(p => p.id === this.editingId);
      if (phase) {
        phase.name = this.name;
        phase.description = this.description;
      }
      this.editingId = null;
    } else {
      const newPhase: Phase = {
        id: Date.now(),
        name: this.name,
        description: this.description
      };
      this.phases.push(newPhase);
    }

    this.name = '';
    this.description = '';
  }

  editPhase(phase: Phase) {
    this.name = phase.name;
    this.description = phase.description;
    this.editingId = phase.id;
  }

  deletePhase(id: number) {
    this.phases = this.phases.filter(p => p.id !== id);
  }
}
