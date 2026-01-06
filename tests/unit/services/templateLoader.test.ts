import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllTemplates, getTemplateMetadata, getTemplateById, validateTemplate } from '@/services/templateLoader';
import type { Template } from '@/models/template';

// Mock the template imports
vi.mock('../assets/templates/react-agent.json', () => ({
  default: {
    id: 'react-agent',
    name: 'ReAct Agent',
    description: 'Test',
    difficulty: 'beginner',
    tags: ['test'],
    graph: { version: 'v1', nodes: [], edges: [], metadata: {} },
    stateSchema: { version: 'v1', fields: [] },
  },
}));

vi.mock('../assets/templates/router.json', () => ({
  default: {
    id: 'router',
    name: 'Router',
    description: 'Test',
    difficulty: 'beginner',
    tags: ['test'],
    graph: { version: 'v1', nodes: [], edges: [], metadata: {} },
    stateSchema: { version: 'v1', fields: [] },
  },
}));

describe('Template Loader', () => {
  beforeEach(() => {
    // Clear module cache between tests
    vi.resetModules();
  });

  describe('validateTemplate', () => {
    const validTemplate: Template = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      difficulty: 'beginner',
      tags: [],
      graph: { version: 'v1', nodes: [], edges: [], metadata: {} },
      stateSchema: { version: 'v1', fields: [] },
    };

    it('accepts valid template', () => {
      expect(() => validateTemplate(validTemplate)).not.toThrow();
    });

    it('throws on null', () => {
      expect(() => validateTemplate(null)).toThrow();
    });

    it('throws on missing id', () => {
      const { id, ...rest } = validTemplate;
      expect(() => validateTemplate(rest)).toThrow();
    });

    it('throws on invalid difficulty', () => {
      expect(() => validateTemplate({ ...validTemplate, difficulty: 'invalid' as any })).toThrow();
    });
  });

  describe('getTemplateMetadata', () => {
    it('returns array of metadata', () => {
      const metadata = getTemplateMetadata();
      expect(Array.isArray(metadata)).toBe(true);
    });

    it('metadata contains required fields', () => {
      const metadata = getTemplateMetadata();
      if (metadata.length > 0) {
        expect(metadata[0]).toHaveProperty('id');
        expect(metadata[0]).toHaveProperty('name');
        expect(metadata[0]).toHaveProperty('description');
        expect(metadata[0]).toHaveProperty('difficulty');
        expect(metadata[0]).toHaveProperty('tags');
      }
    });
  });

  describe('getAllTemplates', () => {
    it('returns array of templates', () => {
      const templates = getAllTemplates();
      expect(Array.isArray(templates)).toBe(true);
    });

    it('templates are valid', () => {
      const templates = getAllTemplates();
      templates.forEach((t) => {
        expect(() => validateTemplate(t)).not.toThrow();
      });
    });
  });

  describe('getTemplateById', () => {
    it('returns template if found', () => {
      const templates = getAllTemplates();
      if (templates.length > 0) {
        const found = getTemplateById(templates[0].id);
        expect(found).toBeDefined();
        expect(found?.id).toBe(templates[0].id);
      }
    });

    it('returns undefined if not found', () => {
      const found = getTemplateById('non-existent');
      expect(found).toBeUndefined();
    });
  });
});
