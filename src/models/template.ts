import { GraphModel } from './graph';
import { StateSchema } from './state';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Template {
  id: string;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  tags: string[];
  graph: GraphModel;
  stateSchema: StateSchema;
  preview?: string;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  tags: string[];
  preview?: string;
}
