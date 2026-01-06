import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportGraphToFile, exportGraphToString, copyGraphToClipboard } from '@/features/io/exportJson'
import type { GraphModel } from '@/models/graph'

// Mock DOM APIs
const mockURL = {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn(),
}
vi.stubGlobal('URL', mockURL)

const mockLinkElement = {
  href: '',
  set download(value: string) { this._download = value },
  get download() { return this._download || '' },
  _download: '',
  click: vi.fn(),
}

const mockDocument = {
  createElement: vi.fn(() => mockLinkElement),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
}
vi.stubGlobal('document', mockDocument)

const mockNavigator = {
  clipboard: {
    writeText: vi.fn(),
  },
}
vi.stubGlobal('navigator', mockNavigator)

describe('exportJson', () => {
  const testGraph: GraphModel = {
    version: 'v1',
    nodes: [
      { id: 'start-1', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
      { id: 'end-1', type: 'End', position: { x: 100, y: 0 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'end-1' },
    ],
    metadata: { name: 'Test Graph' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exportGraphToString', () => {
    it('exports graph to JSON string', () => {
      const json = exportGraphToString(testGraph)
      const parsed = JSON.parse(json)

      expect(parsed.version).toBe('v1')
      expect(parsed.nodes).toHaveLength(2)
      expect(parsed.edges).toHaveLength(1)
    })

    it('produces formatted JSON', () => {
      const json = exportGraphToString(testGraph)
      expect(json).toContain('\n')  // formatted with newlines
      expect(json).toContain('  ')   // formatted with indentation
    })

    it('includes metadata', () => {
      const json = exportGraphToString(testGraph)
      const parsed = JSON.parse(json)

      expect(parsed.metadata?.name).toBe('Test Graph')
    })
  })

  describe('exportGraphToFile', () => {
    it('creates blob with JSON content', () => {
      exportGraphToFile(testGraph)

      expect(mockURL.createObjectURL).toHaveBeenCalled()
      const blobArg = mockURL.createObjectURL.mock.calls[0][0]
      expect(blobArg.type).toBe('application/json')
      expect(blobArg instanceof Blob).toBe(true)
    })

    it('uses graph name for filename', () => {
      exportGraphToFile(testGraph)

      const link = mockDocument.createElement()
      expect(link.download).toBe('Test Graph.json')
    })

    it('uses default name when no metadata', () => {
      const noNameGraph: GraphModel = { version: 'v1', nodes: [], edges: [] }
      exportGraphToFile(noNameGraph)

      const link = mockDocument.createElement()
      expect(link.download).toBe('graph.json')
    })

    it('creates and clicks download link', () => {
      exportGraphToFile(testGraph)

      expect(mockDocument.createElement).toHaveBeenCalledWith('a')
      expect(mockDocument.body.appendChild).toHaveBeenCalled()
      const link = mockDocument.createElement()
      expect(link.click).toHaveBeenCalled()
      expect(mockDocument.body.removeChild).toHaveBeenCalled()
    })

    it('revokes object URL after download', () => {
      exportGraphToFile(testGraph)

      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })
  })

  describe('copyGraphToClipboard', () => {
    it('copies JSON to clipboard', async () => {
      mockNavigator.clipboard.writeText.mockResolvedValue(undefined)

      const result = await copyGraphToClipboard(testGraph)

      expect(result).toBe(true)
      expect(mockNavigator.clipboard.writeText).toHaveBeenCalled()
      const writtenText = mockNavigator.clipboard.writeText.mock.calls[0][0]
      const parsed = JSON.parse(writtenText)
      expect(parsed.version).toBe('v1')
    })

    it('returns false on clipboard error', async () => {
      mockNavigator.clipboard.writeText.mockRejectedValue(new Error('Clipboard error'))

      const result = await copyGraphToClipboard(testGraph)

      expect(result).toBe(false)
    })

    it('formats clipboard content', async () => {
      mockNavigator.clipboard.writeText.mockResolvedValue(undefined)

      await copyGraphToClipboard(testGraph)

      const writtenText = mockNavigator.clipboard.writeText.mock.calls[0][0]
      expect(writtenText).toContain('\n')
    })
  })
})
