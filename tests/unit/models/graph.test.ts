import { describe, it, expect } from 'vitest'
import {
  createEmptyGraph,
  generateNodeId,
  generateEdgeId,
  validateGraph,
  type GraphModel,
  type GraphNode,
  type GraphEdge,
  type NodeType,
} from '@/models/graph'

describe('graph models', () => {
  describe('createEmptyGraph', () => {
    it('creates empty graph with v1 version', () => {
      const graph = createEmptyGraph()
      expect(graph.version).toBe('v1')
      expect(graph.nodes).toEqual([])
      expect(graph.edges).toEqual([])
    })

    it('sets default name', () => {
      const graph = createEmptyGraph()
      expect(graph.metadata?.name).toBe('Untitled Graph')
    })

    it('sets custom name', () => {
      const graph = createEmptyGraph('My Graph')
      expect(graph.metadata?.name).toBe('My Graph')
    })

    it('sets timestamps', () => {
      const graph = createEmptyGraph()
      expect(graph.metadata?.createdAt).toBeDefined()
      expect(graph.metadata?.updatedAt).toBeDefined()
    })
  })

  describe('generateNodeId', () => {
    it('generates unique IDs for each node type', () => {
      const types: NodeType[] = ['Start', 'LLM', 'Tool', 'Router', 'Reducer', 'LoopGuard', 'End']
      const ids = types.map(t => generateNodeId(t))

      expect(ids).toHaveLength(types.length)
      expect(new Set(ids).size).toBe(types.length)
    })

    it('includes node type in ID', () => {
      const id = generateNodeId('LLM')
      expect(id).toContain('node-llm-')
    })

    it('generates different IDs for same type', () => {
      const id1 = generateNodeId('Start')
      const id2 = generateNodeId('Start')
      expect(id1).not.toBe(id2)
    })
  })

  describe('generateEdgeId', () => {
    it('includes source and target in ID', () => {
      const id = generateEdgeId('node-abc', 'node-def')
      expect(id).toContain('edge-node-abc-node-def-')
    })

    it('generates different IDs when time passes', () => {
      vi.useFakeTimers()
      const id1 = generateEdgeId('node-1', 'node-2')
      vi.advanceTimersByTime(1)
      const id2 = generateEdgeId('node-1', 'node-2')
      vi.useRealTimers()

      expect(id1).not.toBe(id2)
    })
  })

  describe('validateGraph', () => {
    const createValidGraph = (): GraphModel => ({
      version: 'v1',
      nodes: [
        { id: 'start-1', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
        { id: 'llm-1', type: 'LLM', position: { x: 100, y: 0 }, data: { label: 'LLM' } },
        { id: 'end-1', type: 'End', position: { x: 200, y: 0 }, data: { label: 'End' } },
      ],
      edges: [
        { id: 'e1', source: 'start-1', target: 'llm-1' },
        { id: 'e2', source: 'llm-1', target: 'end-1' },
      ],
    })

    it('valid graph has no errors', () => {
      const graph = createValidGraph()
      const errors = validateGraph(graph)
      expect(errors).toEqual([])
    })

    it('detects missing Start node', () => {
      const graph: GraphModel = {
        version: 'v1',
        nodes: [
          { id: 'llm-1', type: 'LLM', position: { x: 0, y: 0 }, data: { label: 'LLM' } },
          { id: 'end-1', type: 'End', position: { x: 100, y: 0 }, data: { label: 'End' } },
        ],
        edges: [],
      }
      const errors = validateGraph(graph)
      expect(errors).toHaveLength(1)
      expect(errors[0].type).toBe('no_start')
    })

    it('detects missing End node', () => {
      const graph: GraphModel = {
        version: 'v1',
        nodes: [
          { id: 'start-1', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
          { id: 'llm-1', type: 'LLM', position: { x: 100, y: 0 }, data: { label: 'LLM' } },
        ],
        edges: [],
      }
      const errors = validateGraph(graph)
      expect(errors).toHaveLength(1)
      expect(errors[0].type).toBe('no_end')
    })

    it('detects duplicate node IDs', () => {
      const graph: GraphModel = {
        version: 'v1',
        nodes: [
          { id: 'dup-1', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start 1' } },
          { id: 'dup-1', type: 'End', position: { x: 100, y: 0 }, data: { label: 'End' } },
        ],
        edges: [],
      }
      const errors = validateGraph(graph)
      expect(errors).toHaveLength(1)
      expect(errors[0].type).toBe('duplicate_id')
    })

    it('detects orphaned edge (source not found)', () => {
      const graph: GraphModel = {
        version: 'v1',
        nodes: [
          { id: 'end-1', type: 'End', position: { x: 0, y: 0 }, data: { label: 'End' } },
        ],
        edges: [
          { id: 'e1', source: 'missing-node', target: 'end-1' },
        ],
      }
      const errors = validateGraph(graph)
      expect(errors.some(e => e.type === 'orphaned_edge' && e.message.includes('source'))).toBe(true)
    })

    it('detects orphaned edge (target not found)', () => {
      const graph: GraphModel = {
        version: 'v1',
        nodes: [
          { id: 'start-1', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
        ],
        edges: [
          { id: 'e1', source: 'start-1', target: 'missing-node' },
        ],
      }
      const errors = validateGraph(graph)
      expect(errors.some(e => e.type === 'orphaned_edge' && e.message.includes('target'))).toBe(true)
    })

    it('detects multiple errors', () => {
      const graph: GraphModel = {
        version: 'v1',
        nodes: [],
        edges: [
          { id: 'e1', source: 'missing-1', target: 'missing-2' },
        ],
      }
      const errors = validateGraph(graph)
      expect(errors.length).toBeGreaterThanOrEqual(3) // no_start, no_end, orphaned edges
    })
  })
})
