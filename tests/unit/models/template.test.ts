import { describe, it, expect } from 'vitest';
import { validateTemplate } from '@/services/templateLoader';
import type { Template } from '@/models/template';
import type { GraphModel } from '@/models/graph';
import type { StateSchema } from '@/models/state';

describe('Template Model', () => {
  const validTemplate: Template = {
    id: 'test-template',
    name: 'Test Template',
    description: 'A test template',
    difficulty: 'beginner',
    tags: ['test', 'example'],
    graph: {
      version: 'v1',
      nodes: [
        {
          id: 'start-1',
          type: 'Start',
          position: { x: 100, y: 100 },
          data: { label: 'Start' },
        },
      ],
      edges: [],
      metadata: { name: 'Test' },
    },
    stateSchema: {
      version: 'v1',
      fields: [
        {
          key: 'input',
          type: 'string',
          required: true,
          description: 'Test field',
        },
      ],
    },
  };

  describe('validateTemplate', () => {
    it('accepts a valid template', () => {
      expect(() => validateTemplate(validTemplate)).not.toThrow();
    });

    it('returns the template when valid', () => {
      const result = validateTemplate(validTemplate);
      expect(result).toEqual(validTemplate);
    });

    it('rejects template without id', () => {
      const invalid = { ...validTemplate, id: undefined };
      expect(() => validateTemplate(invalid)).toThrow('Template must have an id string');
    });

    it('rejects template with non-string id', () => {
      const invalid = { ...validTemplate, id: 123 as unknown as string };
      expect(() => validateTemplate(invalid)).toThrow('Template must have an id string');
    });

    it('rejects template without name', () => {
      const invalid = { ...validTemplate, name: undefined };
      expect(() => validateTemplate(invalid)).toThrow('Template must have a name string');
    });

    it('rejects template without description', () => {
      const invalid = { ...validTemplate, description: undefined };
      expect(() => validateTemplate(invalid)).toThrow('Template must have a description string');
    });

    it('rejects template with invalid difficulty', () => {
      const invalid = { ...validTemplate, difficulty: 'invalid' as any };
      expect(() => validateTemplate(invalid)).toThrow('Template must have a valid difficulty level');
    });

    it('rejects template without tags array', () => {
      const invalid = { ...validTemplate, tags: undefined as any };
      expect(() => validateTemplate(invalid)).toThrow('Template must have a tags array');
    });

    it('rejects template without graph', () => {
      const invalid = { ...validTemplate, graph: undefined as any };
      expect(() => validateTemplate(invalid)).toThrow('Template must have a graph object');
    });

    it('rejects template with wrong graph version', () => {
      const invalid = { ...validTemplate, graph: { ...validTemplate.graph, version: 'v2' as any } };
      expect(() => validateTemplate(invalid)).toThrow('Graph version must be v1');
    });

    it('rejects template without stateSchema', () => {
      const invalid = { ...validTemplate, stateSchema: undefined as any };
      expect(() => validateTemplate(invalid)).toThrow('Template must have a stateSchema object');
    });

    it('rejects template with wrong stateSchema version', () => {
      const invalid = { ...validTemplate, stateSchema: { ...validTemplate.stateSchema, version: 'v2' as any } };
      expect(() => validateTemplate(invalid)).toThrow('StateSchema version must be v1');
    });

    it('rejects non-object input', () => {
      expect(() => validateTemplate(null)).toThrow('Template must be an object');
      expect(() => validateTemplate('string')).toThrow('Template must be an object');
      expect(() => validateTemplate(123)).toThrow('Template must be an object');
    });
  });

  describe('Template difficulty levels', () => {
    it('accepts all valid difficulty levels', () => {
      const difficulties: Array<'beginner' | 'intermediate' | 'advanced'> = ['beginner', 'intermediate', 'advanced'];
      difficulties.forEach((difficulty) => {
        const template = { ...validTemplate, difficulty };
        expect(() => validateTemplate(template)).not.toThrow();
      });
    });
  });
});
