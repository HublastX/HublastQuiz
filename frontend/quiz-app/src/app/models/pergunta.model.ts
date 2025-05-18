import { Alternativa } from './alternativa.model';

export interface Pergunta {
  id: string;
  texto: string;
  fase_id: string;
  user_id: string;
  alternativas?: Alternativa[];
} 