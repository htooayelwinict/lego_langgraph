import { describe, it, expect } from 'vitest'
import {
  createEmptyStateSchema,
  validateField,
  validateStateSchema,
  createInitialState,
  type StateSchema,
  type StateField,
} from '@/models/state'

describe('state models', () => {
  describe('createEmptyStateSchema', () => {
    it('creates schema with v1 version', () => {
      const schema = createEmptyStateSchema()
      expect(schema.version).toBe('v1')
    })

    it('includes default fields', () => {
      const schema = createEmptyStateSchema()
      expect(schema.fields).toHaveLength(2)
      expect(schema.fields[0].key).toBe('messages')
      expect(schema.fields[1].key).toBe('input')
    })

    it('messages field is array type', () => {
      const schema = createEmptyStateSchema()
      const messages = schema.fields[0]
      expect(messages.type).toBe('array')
      expect(messages.required).toBe(true)
      expect(messages.default).toEqual([])
    })

    it('input field is string type', () => {
      const schema = createEmptyStateSchema()
      const input = schema.fields[1]
      expect(input.type).toBe('string')
      expect(input.required).toBe(true)
      expect(input.default).toBe('')
    })
  })

  describe('validateField', () => {
    it('valid field has no errors', () => {
      const field: StateField = {
        key: 'valid_field',
        type: 'string',
        required: false,
        default: '',
      }
      const errors = validateField(field, new Set())
      expect(errors).toEqual([])
    })

    it('rejects invalid key starting with number', () => {
      const field: StateField = {
        key: '123invalid',
        type: 'string',
      }
      const errors = validateField(field, new Set())
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('Invalid identifier')
    })

    it('rejects duplicate keys', () => {
      const field: StateField = {
        key: 'duplicate',
        type: 'string',
      }
      const existingKeys = new Set(['duplicate'])
      const errors = validateField(field, existingKeys)
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('Duplicate')
    })

    it('requires default for required fields', () => {
      const field: StateField = {
        key: 'required_field',
        type: 'string',
        required: true,
      }
      const errors = validateField(field, new Set())
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('must have a default')
    })

    it('requires enum values for enum type', () => {
      const field: StateField = {
        key: 'enum_field',
        type: 'enum',
        default: 'a',
      }
      const errors = validateField(field, new Set())
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('at least one value')
    })

    it('validates string default type', () => {
      const field: StateField = {
        key: 'bad_string',
        type: 'string',
        default: 123,
      }
      const errors = validateField(field, new Set())
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('must be a string')
    })

    it('validates number default type', () => {
      const field: StateField = {
        key: 'bad_number',
        type: 'number',
        default: 'not a number',
      }
      const errors = validateField(field, new Set())
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('must be a number')
    })

    it('validates boolean default type', () => {
      const field: StateField = {
        key: 'bad_boolean',
        type: 'boolean',
        default: 'true',
      }
      const errors = validateField(field, new Set())
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('must be a boolean')
    })

    it('validates array default type', () => {
      const field: StateField = {
        key: 'bad_array',
        type: 'array',
        default: 'not an array',
      }
      const errors = validateField(field, new Set())
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('must be an array')
    })

    it('validates object default type', () => {
      const field: StateField = {
        key: 'bad_object',
        type: 'object',
        default: [],
      }
      const errors = validateField(field, new Set())
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('must be an object')
    })

    it('validates enum default is in enum values', () => {
      const field: StateField = {
        key: 'bad_enum',
        type: 'enum',
        default: 'c',
        enumValues: ['a', 'b'],
      }
      const errors = validateField(field, new Set())
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('one of the enum values')
    })

    it('allows null as valid object', () => {
      const field: StateField = {
        key: 'object_field',
        type: 'object',
        default: { foo: 'bar' },
      }
      const errors = validateField(field, new Set())
      expect(errors).toHaveLength(0)
    })
  })

  describe('validateStateSchema', () => {
    it('valid schema has no errors', () => {
      const schema: StateSchema = {
        version: 'v1',
        fields: [
          { key: 'field1', type: 'string', default: '' },
          { key: 'field2', type: 'number', default: 0 },
        ],
      }
      const errors = validateStateSchema(schema)
      expect(errors).toEqual([])
    })

    it('detects duplicate field keys', () => {
      const schema: StateSchema = {
        version: 'v1',
        fields: [
          { key: 'dup', type: 'string', default: '' },
          { key: 'dup', type: 'number', default: 0 },
        ],
      }
      const errors = validateStateSchema(schema)
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('Duplicate')
    })
  })

  describe('createInitialState', () => {
    it('creates state from schema defaults', () => {
      const schema: StateSchema = {
        version: 'v1',
        fields: [
          { key: 'name', type: 'string', default: 'test' },
          { key: 'count', type: 'number', default: 42 },
        ],
      }
      const state = createInitialState(schema)
      expect(state.name).toBe('test')
      expect(state.count).toBe(42)
    })

    it('uses type defaults when no default specified', () => {
      const schema: StateSchema = {
        version: 'v1',
        fields: [
          { key: 'str', type: 'string' },
          { key: 'num', type: 'number' },
          { key: 'bool', type: 'boolean' },
          { key: 'arr', type: 'array' },
          { key: 'obj', type: 'object' },
        ],
      }
      const state = createInitialState(schema)
      expect(state.str).toBe('')
      expect(state.num).toBe(0)
      expect(state.bool).toBe(false)
      expect(state.arr).toEqual([])
      expect(state.obj).toEqual({})
    })

    it('uses first enum value when no default', () => {
      const schema: StateSchema = {
        version: 'v1',
        fields: [
          { key: 'choice', type: 'enum', enumValues: ['a', 'b', 'c'] },
        ],
      }
      const state = createInitialState(schema)
      expect(state.choice).toBe('a')
    })

    it('handles empty enum values', () => {
      const schema: StateSchema = {
        version: 'v1',
        fields: [
          { key: 'choice', type: 'enum' },
        ],
      }
      const state = createInitialState(schema)
      expect(state.choice).toBe('')
    })
  })
})
