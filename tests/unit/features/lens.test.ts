import { describe, it, expect } from 'vitest';
import { getNodeConceptualType, NODE_ROLES, ROLE_COLORS } from '@/features/lens/lensContent';
import type { ConceptualRole } from '@/features/lens/lensContent';

describe('Lens Content', () => {
  describe('getNodeConceptualType', () => {
    it('returns correct role for Start node', () => {
      const result = getNodeConceptualType('Start');
      expect(result.role).toBe('input');
      expect(result.label).toBe('Entry Point');
      expect(result.color).toBe('#3b82f6');
    });

    it('returns correct role for LLM node', () => {
      const result = getNodeConceptualType('LLM');
      expect(result.role).toBe('processing');
      expect(result.label).toBe('LLM Call');
      expect(result.color).toBe('#22c55e');
    });

    it('returns correct role for Tool node', () => {
      const result = getNodeConceptualType('Tool');
      expect(result.role).toBe('processing');
      expect(result.label).toBe('Tool Function');
      expect(result.color).toBe('#22c55e');
    });

    it('returns correct role for Router node', () => {
      const result = getNodeConceptualType('Router');
      expect(result.role).toBe('decision');
      expect(result.label).toBe('Decision Point');
      expect(result.color).toBe('#eab308');
    });

    it('returns correct role for Reducer node', () => {
      const result = getNodeConceptualType('Reducer');
      expect(result.role).toBe('state');
      expect(result.label).toBe('State Merger');
      expect(result.color).toBe('#a855f7');
    });

    it('returns correct role for LoopGuard node', () => {
      const result = getNodeConceptualType('LoopGuard');
      expect(result.role).toBe('decision');
      expect(result.label).toBe('Loop Condition');
      expect(result.color).toBe('#eab308');
    });

    it('returns correct role for End node', () => {
      const result = getNodeConceptualType('End');
      expect(result.role).toBe('output');
      expect(result.label).toBe('Terminal');
      expect(result.color).toBe('#ef4444');
    });

    it('returns default LLM role for unknown node type', () => {
      const result = getNodeConceptualType('UnknownType');
      expect(result.role).toBe('processing');
      expect(result.label).toBe('LLM Call');
    });

    it('returns default LLM role for empty string', () => {
      const result = getNodeConceptualType('');
      expect(result.role).toBe('processing');
      expect(result.label).toBe('LLM Call');
    });
  });

  describe('NODE_ROLES', () => {
    it('contains all 7 node types', () => {
      const types = Object.keys(NODE_ROLES);
      expect(types).toHaveLength(7);
      expect(types).toContain('Start');
      expect(types).toContain('LLM');
      expect(types).toContain('Tool');
      expect(types).toContain('Router');
      expect(types).toContain('Reducer');
      expect(types).toContain('LoopGuard');
      expect(types).toContain('End');
    });

    it('each role has required properties', () => {
      Object.entries(NODE_ROLES).forEach(([nodeType, role]) => {
        expect(role).toHaveProperty('role');
        expect(role).toHaveProperty('label');
        expect(role).toHaveProperty('description');
        expect(role).toHaveProperty('color');
        expect(role).toHaveProperty('icon');

        expect(['input', 'processing', 'decision', 'state', 'output']).toContain(role.role);
        expect(role.color).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(typeof role.icon).toBe('string');
      });
    });
  });

  describe('ROLE_COLORS', () => {
    it('contains all conceptual role colors', () => {
      const roles = Object.keys(ROLE_COLORS) as ConceptualRole[];
      expect(roles).toHaveLength(5);
      expect(roles).toContain('input');
      expect(roles).toContain('processing');
      expect(roles).toContain('decision');
      expect(roles).toContain('state');
      expect(roles).toContain('output');
    });

    it('colors match node role colors', () => {
      expect(ROLE_COLORS.input).toBe('#3b82f6');
      expect(ROLE_COLORS.processing).toBe('#22c55e');
      expect(ROLE_COLORS.decision).toBe('#eab308');
      expect(ROLE_COLORS.state).toBe('#a855f7');
      expect(ROLE_COLORS.output).toBe('#ef4444');
    });

    it('all colors are valid hex colors', () => {
      Object.values(ROLE_COLORS).forEach((color) => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe('Role color mapping', () => {
    it('Start node uses input color', () => {
      const role = getNodeConceptualType('Start');
      expect(role.color).toBe(ROLE_COLORS.input);
    });

    it('LLM node uses processing color', () => {
      const role = getNodeConceptualType('LLM');
      expect(role.color).toBe(ROLE_COLORS.processing);
    });

    it('Router node uses decision color', () => {
      const role = getNodeConceptualType('Router');
      expect(role.color).toBe(ROLE_COLORS.decision);
    });

    it('Reducer node uses state color', () => {
      const role = getNodeConceptualType('Reducer');
      expect(role.color).toBe(ROLE_COLORS.state);
    });

    it('End node uses output color', () => {
      const role = getNodeConceptualType('End');
      expect(role.color).toBe(ROLE_COLORS.output);
    });
  });
});
