import { describe, it, expect, vi, beforeEach } from 'vitest'
import { importGraphFromFile, importGraphFromString, importGraphFromClipboard } from '@/features/io/importJson'
import type { GraphModel } from '@/models/graph'

// Mock navigator.clipboard
const mockNavigator = {
  clipboard: {
    readText: vi.fn(),
  },
}
vi.stubGlobal('navigator', mockNavigator)

describe('importJson', () => {
  const validGraphJson = JSON.stringify({
    version: 'v1',
    nodes: [
      { id: 'start-1', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
      { id: 'end-1', type: 'End', position: { x: 100, y: 0 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'end-1' },
    ],
    metadata: { name: 'Imported Graph' },
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('importGraphFromString', () => {
    it('imports valid graph', () => {
      const graph = importGraphFromString(validGraphJson)

      expect(graph.version).toBe('v1')
      expect(graph.nodes).toHaveLength(2)
      expect(graph.edges).toHaveLength(1)
    })

    it('imports graph without metadata', () => {
      const json = JSON.stringify({
        version: 'v1',
        nodes: [],
        edges: [],
      })

      const graph = importGraphFromString(json)

      expect(graph.metadata?.name).toBe('Imported Graph')
      expect(graph.metadata?.createdAt).toBeDefined()
    })

    it('throws on invalid JSON', () => {
      expect(() => importGraphFromString('not json')).toThrow()
    })

    it('throws on non-object input', () => {
      expect(() => importGraphFromString('null')).toThrow('not an object')
    })

    it('throws on unsupported version', () => {
      const json = JSON.stringify({ version: 'v2', nodes: [], edges: [] })

      expect(() => importGraphFromString(json)).toThrow('Unsupported graph version')
    })

    it('throws when nodes is not an array', () => {
      const json = JSON.stringify({ version: 'v1', nodes: 'not-array', edges: [] })

      expect(() => importGraphFromString(json)).toThrow('nodes must be an array')
    })

    it('throws when edges is not an array', () => {
      const json = JSON.stringify({ version: 'v1', nodes: [], edges: 'not-array' })

      expect(() => importGraphFromString(json)).toThrow('edges must be an array')
    })

    it('throws on missing nodes (required field)', () => {
      const json = JSON.stringify({ version: 'v1', edges: [] })

      expect(() => importGraphFromString(json)).toThrow('nodes must be an array')
    })

    it('throws on missing edges (required field)', () => {
      const json = JSON.stringify({ version: 'v1', nodes: [] })

      expect(() => importGraphFromString(json)).toThrow('edges must be an array')
    })

    it('throws on null nodes', () => {
      const json = JSON.stringify({ version: 'v1', nodes: null, edges: [] })

      expect(() => importGraphFromString(json)).toThrow('nodes must be an array')
    })
  })

  describe('importGraphFromFile', () => {
    it('imports graph from file', async () => {
      // Create a mock file with text() method
      const mockFile = {
        name: 'graph.json',
        type: 'application/json',
        text: vi.fn().mockResolvedValue(validGraphJson),
      } as unknown as File

      const graph = await importGraphFromFile(mockFile)

      expect(graph.version).toBe('v1')
      expect(graph.nodes).toHaveLength(2)
    })

    it('throws on invalid file content', async () => {
      const mockFile = {
        name: 'graph.json',
        type: 'application/json',
        text: vi.fn().mockResolvedValue('invalid'),
      } as unknown as File

      await expect(importGraphFromFile(mockFile)).rejects.toThrow()
    })
  })

  describe('importGraphFromClipboard', () => {
    it('imports graph from clipboard', async () => {
      mockNavigator.clipboard.readText.mockResolvedValue(validGraphJson)

      const graph = await importGraphFromClipboard()

      expect(graph.version).toBe('v1')
      expect(mockNavigator.clipboard.readText).toHaveBeenCalled()
    })

    it('throws on clipboard read error', async () => {
      mockNavigator.clipboard.readText.mockRejectedValue(new Error('Clipboard error'))

      await expect(importGraphFromClipboard()).rejects.toThrow()
    })

    it('throws on invalid clipboard content', async () => {
      mockNavigator.clipboard.readText.mockResolvedValue('not json')

      await expect(importGraphFromClipboard()).rejects.toThrow()
    })
  })

  describe('validation warnings', () => {
    it('warns on graph without Start node', () => {
      const json = JSON.stringify({
        version: 'v1',
        nodes: [
          { id: 'end-1', type: 'End', position: { x: 0, y: 0 }, data: { label: 'End' } },
        ],
        edges: [],
      })

      const consoleWarnSpy = vi.spyOn(console, 'warn')
      importGraphFromString(json)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Graph validation warnings:',
        expect.arrayContaining([
          expect.objectContaining({ type: 'no_start' }),
        ])
      )
    })

    it('warns on graph without End node', () => {
      const json = JSON.stringify({
        version: 'v1',
        nodes: [
          { id: 'start-1', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
        ],
        edges: [],
      })

      const consoleWarnSpy = vi.spyOn(console, 'warn')
      importGraphFromString(json)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Graph validation warnings:',
        expect.arrayContaining([
          expect.objectContaining({ type: 'no_end' }),
        ])
      )
    })

    it('warns on orphaned edges', () => {
      const json = JSON.stringify({
        version: 'v1',
        nodes: [
          { id: 'start-1', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
          { id: 'end-1', type: 'End', position: { x: 100, y: 0 }, data: { label: 'End' } },
        ],
        edges: [
          { id: 'e1', source: 'missing', target: 'end-1' },
        ],
      })

      const consoleWarnSpy = vi.spyOn(console, 'warn')
      importGraphFromString(json)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Graph validation warnings:',
        expect.arrayContaining([
          expect.objectContaining({ type: 'orphaned_edge' }),
        ])
      )
    })

    it('still imports graph with warnings', () => {
      const json = JSON.stringify({
        version: 'v1',
        nodes: [
          { id: 'llm-1', type: 'LLM', position: { x: 0, y: 0 }, data: { label: 'LLM' } },
        ],
        edges: [],
      })

      const graph = importGraphFromString(json)

      expect(graph.nodes).toHaveLength(1)
      expect(graph.nodes[0].type).toBe('LLM')
    })
  })
})
