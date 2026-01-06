import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGraphStore, persistGraphStore, loadPersistedGraph } from '@/store/graphStore'
import type { GraphModel } from '@/models/graph'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

describe('graphStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useGraphStore.getState().clearGraph()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has empty nodes and edges', () => {
      const state = useGraphStore.getState()
      expect(state.nodes).toEqual([])
      expect(state.edges).toEqual([])
    })

    it('has default metadata', () => {
      const state = useGraphStore.getState()
      expect(state.metadata?.name).toBe('Untitled Graph')
      expect(state.metadata?.createdAt).toBeDefined()
    })

    it('has no selection', () => {
      const state = useGraphStore.getState()
      expect(state.selectedNodeId).toBeNull()
      expect(state.selectedEdgeId).toBeNull()
    })
  })

  describe('addNode', () => {
    it('adds node with generated ID', () => {
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 })
      const state = useGraphStore.getState()
      expect(state.nodes).toHaveLength(1)
      expect(state.nodes[0].data.type).toBe('Start')
      expect(state.nodes[0].id).toContain('node-start-')
    })

    it('sets default label', () => {
      useGraphStore.getState().addNode('LLM', { x: 100, y: 100 })
      const state = useGraphStore.getState()
      expect(state.nodes[0].data.label).toBe('LLM Node')
    })

    it('adds multiple nodes', () => {
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 })
      useGraphStore.getState().addNode('End', { x: 100, y: 0 })
      const state = useGraphStore.getState()
      expect(state.nodes).toHaveLength(2)
    })
  })

  describe('updateNode', () => {
    it('updates node data', () => {
      useGraphStore.getState().addNode('LLM', { x: 0, y: 0 })
      const nodeId = useGraphStore.getState().nodes[0].id

      useGraphStore.getState().updateNode(nodeId, { label: 'Updated Label' })
      const state = useGraphStore.getState()
      expect(state.nodes[0].data.label).toBe('Updated Label')
    })

    it('replaces config (does not merge)', () => {
      useGraphStore.getState().addNode('Tool', { x: 0, y: 0 })
      const nodeId = useGraphStore.getState().nodes[0].id

      useGraphStore.getState().updateNode(nodeId, { config: { toolName: 'search' } })
      useGraphStore.getState().updateNode(nodeId, { config: { timeout: 5000 } })

      const state = useGraphStore.getState()
      expect(state.nodes[0].data.config).toEqual({ timeout: 5000 })
    })
  })

  describe('deleteNode', () => {
    it('removes node', () => {
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 })
      const nodeId = useGraphStore.getState().nodes[0].id

      useGraphStore.getState().deleteNode(nodeId)
      const state = useGraphStore.getState()
      expect(state.nodes).toHaveLength(0)
    })

    it('removes connected edges', () => {
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 })
      useGraphStore.getState().addNode('End', { x: 100, y: 0 })
      const sourceId = useGraphStore.getState().nodes[0].id
      const targetId = useGraphStore.getState().nodes[1].id

      useGraphStore.getState().onConnect({ source: sourceId, target: targetId })
      expect(useGraphStore.getState().edges).toHaveLength(1)

      useGraphStore.getState().deleteNode(sourceId)
      expect(useGraphStore.getState().edges).toHaveLength(0)
    })

    it('clears selection if deleting selected node', () => {
      useGraphStore.getState().addNode('LLM', { x: 0, y: 0 })
      const nodeId = useGraphStore.getState().nodes[0].id
      useGraphStore.getState().setSelectedNode(nodeId)

      useGraphStore.getState().deleteNode(nodeId)
      expect(useGraphStore.getState().selectedNodeId).toBeNull()
    })
  })

  describe('updateEdge', () => {
    it('updates edge data', () => {
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 })
      useGraphStore.getState().addNode('End', { x: 100, y: 0 })
      const sourceId = useGraphStore.getState().nodes[0].id
      const targetId = useGraphStore.getState().nodes[1].id

      useGraphStore.getState().onConnect({ source: sourceId, target: targetId })
      const edgeId = useGraphStore.getState().edges[0].id

      useGraphStore.getState().updateEdge(edgeId, { label: 'test edge', condition: 'x > 0' })
      const state = useGraphStore.getState()
      expect(state.edges[0].data?.label).toBe('test edge')
      expect(state.edges[0].data?.condition).toBe('x > 0')
    })
  })

  describe('deleteEdge', () => {
    it('removes edge', () => {
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 })
      useGraphStore.getState().addNode('End', { x: 100, y: 0 })
      const sourceId = useGraphStore.getState().nodes[0].id
      const targetId = useGraphStore.getState().nodes[1].id

      useGraphStore.getState().onConnect({ source: sourceId, target: targetId })
      const edgeId = useGraphStore.getState().edges[0].id

      useGraphStore.getState().deleteEdge(edgeId)
      expect(useGraphStore.getState().edges).toHaveLength(0)
    })
  })

  describe('selection', () => {
    it('sets selected node', () => {
      useGraphStore.getState().addNode('LLM', { x: 0, y: 0 })
      const nodeId = useGraphStore.getState().nodes[0].id

      useGraphStore.getState().setSelectedNode(nodeId)
      expect(useGraphStore.getState().selectedNodeId).toBe(nodeId)
      expect(useGraphStore.getState().selectedEdgeId).toBeNull()
    })

    it('sets selected edge', () => {
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 })
      useGraphStore.getState().addNode('End', { x: 100, y: 0 })
      const sourceId = useGraphStore.getState().nodes[0].id
      const targetId = useGraphStore.getState().nodes[1].id

      useGraphStore.getState().onConnect({ source: sourceId, target: targetId })
      const edgeId = useGraphStore.getState().edges[0].id

      useGraphStore.getState().setSelectedEdge(edgeId)
      expect(useGraphStore.getState().selectedEdgeId).toBe(edgeId)
      expect(useGraphStore.getState().selectedNodeId).toBeNull()
    })

    it('clears selection when null', () => {
      useGraphStore.getState().addNode('LLM', { x: 0, y: 0 })
      const nodeId = useGraphStore.getState().nodes[0].id
      useGraphStore.getState().setSelectedNode(nodeId)

      useGraphStore.getState().setSelectedNode(null)
      expect(useGraphStore.getState().selectedNodeId).toBeNull()
    })
  })

  describe('loadGraph & exportGraph', () => {
    const testGraph: GraphModel = {
      version: 'v1',
      nodes: [
        { id: 'start-1', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
        { id: 'end-1', type: 'End', position: { x: 100, y: 0 }, data: { label: 'End' } },
      ],
      edges: [
        { id: 'e1', source: 'start-1', target: 'end-1' },
      ],
      metadata: { name: 'Test Graph', createdAt: '2024-01-01T00:00:00Z' },
    }

    it('loads graph from model', () => {
      useGraphStore.getState().loadGraph(testGraph)
      const state = useGraphStore.getState()

      expect(state.nodes).toHaveLength(2)
      expect(state.edges).toHaveLength(1)
      expect(state.metadata?.name).toBe('Test Graph')
    })

    it('exports graph to model', () => {
      useGraphStore.getState().loadGraph(testGraph)
      const exported = useGraphStore.getState().exportGraph()

      expect(exported.version).toBe('v1')
      expect(exported.nodes).toHaveLength(2)
      expect(exported.edges).toHaveLength(1)
      expect(exported.metadata?.name).toBe('Test Graph')
    })

    it('round-trips graph correctly', () => {
      useGraphStore.getState().loadGraph(testGraph)
      const exported = useGraphStore.getState().exportGraph()

      useGraphStore.getState().clearGraph()
      expect(useGraphStore.getState().nodes).toHaveLength(0)

      useGraphStore.getState().loadGraph(exported)
      expect(useGraphStore.getState().nodes).toHaveLength(2)
    })
  })

  describe('clearGraph', () => {
    it('resets to initial state', () => {
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 })
      useGraphStore.getState().addNode('End', { x: 100, y: 0 })
      useGraphStore.getState().setSelectedNode(useGraphStore.getState().nodes[0].id)

      useGraphStore.getState().clearGraph()
      const state = useGraphStore.getState()

      expect(state.nodes).toEqual([])
      expect(state.edges).toEqual([])
      expect(state.selectedNodeId).toBeNull()
      expect(state.metadata?.name).toBe('Untitled Graph')
    })
  })

  describe('updateMetadata', () => {
    it('updates metadata fields', () => {
      useGraphStore.getState().updateMetadata({ name: 'New Name', description: 'Test' })
      const state = useGraphStore.getState()

      expect(state.metadata?.name).toBe('New Name')
      expect(state.metadata?.description).toBe('Test')
    })

    it('updates updatedAt timestamp', () => {
      vi.useFakeTimers()
      const originalTime = useGraphStore.getState().metadata?.updatedAt
      vi.advanceTimersByTime(1)
      useGraphStore.getState().updateMetadata({ name: 'Test' })

      const newTime = useGraphStore.getState().metadata?.updatedAt
      vi.useRealTimers()

      expect(newTime).not.toBe(originalTime)
    })
  })

  describe('localStorage persistence', () => {
    it('persists graph to localStorage', () => {
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 })
      persistGraphStore()

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'langgraph-graph',
        expect.stringContaining('node-start-')
      )
    })

    it('loads graph from localStorage', () => {
      const savedData = {
        nodes: [{ id: 'start-1', type: 'custom', position: { x: 0, y: 0 }, data: { type: 'Start', label: 'Start' } }],
        edges: [],
        metadata: { name: 'Loaded Graph' },
      }
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedData))

      const result = loadPersistedGraph()
      expect(result).toBe(true)
      expect(useGraphStore.getState().nodes).toHaveLength(1)
    })

    it('returns false when no saved data', () => {
      localStorageMock.getItem.mockReturnValueOnce(null)
      const result = loadPersistedGraph()
      expect(result).toBe(false)
    })
  })
})
