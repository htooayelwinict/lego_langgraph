import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStateStore, persistStateStore, loadPersistedState } from '@/store/stateStore'
import type { StateSchema, StateField } from '@/models/state'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

describe('stateStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useStateStore.getState().setSchema({
      version: 'v1',
      fields: [
        { key: 'messages', type: 'array', required: true, default: [] },
        { key: 'input', type: 'string', required: true, default: '' },
      ],
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has default schema', () => {
      const state = useStateStore.getState()
      expect(state.schema.version).toBe('v1')
      expect(state.schema.fields).toHaveLength(2)
    })

    it('has no errors initially', () => {
      const state = useStateStore.getState()
      expect(state.errors).toEqual([])
    })
  })

  describe('setSchema', () => {
    it('updates schema', () => {
      const newSchema: StateSchema = {
        version: 'v1',
        fields: [
          { key: 'test', type: 'string', default: '' },
        ],
      }
      useStateStore.getState().setSchema(newSchema)
      expect(useStateStore.getState().schema).toEqual(newSchema)
    })

    it('sets errors for invalid schema', () => {
      const invalidSchema: StateSchema = {
        version: 'v1',
        fields: [
          { key: '123invalid', type: 'string', default: '' },
        ],
      }
      useStateStore.getState().setSchema(invalidSchema)
      const errors = useStateStore.getState().errors
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('123invalid')
    })

    it('clears errors for valid schema', () => {
      // Set invalid schema first
      useStateStore.getState().setSchema({
        version: 'v1',
        fields: [{ key: 'dup', type: 'string', default: '' }],
      })
      useStateStore.getState().addField({ key: 'dup', type: 'string', default: '' })
      expect(useStateStore.getState().errors.length).toBeGreaterThan(0)

      // Set valid schema
      const validSchema: StateSchema = {
        version: 'v1',
        fields: [{ key: 'valid', type: 'string', default: '' }],
      }
      useStateStore.getState().setSchema(validSchema)
      expect(useStateStore.getState().errors).toEqual([])
    })
  })

  describe('addField', () => {
    it('adds field to schema', () => {
      const field: StateField = { key: 'count', type: 'number', default: 0 }
      useStateStore.getState().addField(field)

      const schema = useStateStore.getState().schema
      expect(schema.fields).toHaveLength(3)
      expect(schema.fields[2]).toEqual(field)
    })

    it('validates new field', () => {
      const invalidField: StateField = { key: '123bad', type: 'string', default: '' }
      useStateStore.getState().addField(invalidField)

      const errors = useStateStore.getState().errors
      expect(errors.length).toBeGreaterThan(0)
    })

    it('detects duplicate keys', () => {
      useStateStore.getState().addField({ key: 'messages', type: 'string', default: '' })
      const errors = useStateStore.getState().errors
      expect(errors.some(e => e.includes('Duplicate'))).toBe(true)
    })
  })

  describe('updateField', () => {
    it('updates existing field', () => {
      useStateStore.getState().updateField('messages', { required: false })
      const schema = useStateStore.getState().schema
      expect(schema.fields[0].required).toBe(false)
    })

    it('preserves other field properties', () => {
      useStateStore.getState().updateField('input', { required: false })
      const schema = useStateStore.getState().schema
      expect(schema.fields[1].key).toBe('input')
      expect(schema.fields[1].type).toBe('string')
    })

    it('validates after update', () => {
      useStateStore.getState().updateField('messages', { required: true, default: undefined })
      const errors = useStateStore.getState().errors
      expect(errors.some(e => e.includes('must have a default'))).toBe(true)
    })
  })

  describe('deleteField', () => {
    it('removes field from schema', () => {
      const initialLength = useStateStore.getState().schema.fields.length
      useStateStore.getState().deleteField('input')

      const schema = useStateStore.getState().schema
      expect(schema.fields).toHaveLength(initialLength - 1)
      expect(schema.fields.find(f => f.key === 'input')).toBeUndefined()
    })

    it('handles non-existent key', () => {
      const initialLength = useStateStore.getState().schema.fields.length
      useStateStore.getState().deleteField('nonexistent')

      expect(useStateStore.getState().schema.fields).toHaveLength(initialLength)
    })
  })

  describe('clearErrors', () => {
    it('clears error array', () => {
      // Add invalid field to create errors
      useStateStore.getState().addField({ key: '123bad', type: 'string', default: '' })
      expect(useStateStore.getState().errors.length).toBeGreaterThan(0)

      useStateStore.getState().clearErrors()
      expect(useStateStore.getState().errors).toEqual([])
    })
  })

  describe('getInitialState', () => {
    it('creates initial state from schema', () => {
      const state = useStateStore.getState().getInitialState()
      expect(state).toEqual({
        messages: [],
        input: '',
      })
    })

    it('includes custom fields', () => {
      useStateStore.getState().addField({ key: 'counter', type: 'number', default: 42 })
      const state = useStateStore.getState().getInitialState()
      expect(state.counter).toBe(42)
    })

    it('uses type defaults when no default specified', () => {
      useStateStore.getState().setSchema({
        version: 'v1',
        fields: [{ key: 'flag', type: 'boolean' }],
      })
      const state = useStateStore.getState().getInitialState()
      expect(state.flag).toBe(false)
    })
  })

  describe('localStorage persistence', () => {
    it('persists schema to localStorage', () => {
      persistStateStore()

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'langgraph-state-schema',
        expect.stringContaining('"version":"v1"')
      )
    })

    it('loads schema from localStorage', () => {
      const savedSchema = {
        version: 'v1',
        fields: [{ key: 'loaded', type: 'string', default: 'test' }],
      }
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedSchema))

      const result = loadPersistedState()
      expect(result).toBe(true)
      expect(useStateStore.getState().schema.fields).toHaveLength(1)
      expect(useStateStore.getState().schema.fields[0].key).toBe('loaded')
    })

    it('returns false when no saved data', () => {
      localStorageMock.getItem.mockReturnValueOnce(null)
      const result = loadPersistedState()
      expect(result).toBe(false)
    })

    it('handles invalid JSON gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json')
      const result = loadPersistedState()
      expect(result).toBe(false)
    })
  })
})
