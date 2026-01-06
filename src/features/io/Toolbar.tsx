import { useRef, useCallback } from 'react';
import { Download, Upload, Copy, Trash2, FolderOpen } from 'lucide-react';
import { useGraphStore } from '@/store/graphStore';
import { exportGraphToFile, copyGraphToClipboard } from './exportJson';
import { importGraphFromFile } from './importJson';
import { LensToggle } from '@/features/lens';

export function Toolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { exportGraph, clearGraph, loadGraph, toggleGallery } = useGraphStore();

  const handleExport = useCallback(() => {
    const graph = exportGraph();
    exportGraphToFile(graph);
  }, [exportGraph]);

  const handleCopy = useCallback(async () => {
    const graph = exportGraph();
    const success = await copyGraphToClipboard(graph);
    if (success) {
      alert('Graph copied to clipboard!');
    } else {
      alert('Failed to copy to clipboard');
    }
  }, [exportGraph]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const graph = await importGraphFromFile(file);
        loadGraph(graph);
        alert('Graph imported successfully!');
      } catch (error) {
        alert(`Failed to import graph: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [loadGraph]
  );

  const handleClear = useCallback(() => {
    if (confirm('Are you sure you want to clear the graph?')) {
      clearGraph();
    }
  }, [clearGraph]);

  return (
    <div className="toolbar-container">
      <style>{`
        .toolbar-container {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          z-index: 10;
          display: flex;
          gap: var(--space-2);
          padding: var(--space-2);
          background: var(--bg-glass);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }

        .toolbar-btn:hover {
          background: var(--bg-glass-light);
          color: var(--text-primary);
          border-color: var(--border-default);
        }

        .toolbar-btn:hover svg {
          transform: scale(1.1);
        }

        .toolbar-btn svg {
          width: 16px;
          height: 16px;
          transition: transform var(--transition-fast);
        }

        .toolbar-btn.danger {
          color: var(--accent-red-light);
        }

        .toolbar-btn.danger:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .toolbar-divider {
          width: 1px;
          margin: var(--space-2) var(--space-1);
          background: var(--border-default);
        }
      `}</style>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <button className="toolbar-btn" onClick={handleCopy} title="Copy to clipboard">
        <Copy />
        <span>Copy</span>
      </button>
      <button className="toolbar-btn" onClick={handleExport} title="Export as JSON">
        <Download />
        <span>Export</span>
      </button>
      <button className="toolbar-btn" onClick={handleImportClick} title="Import JSON">
        <Upload />
        <span>Import</span>
      </button>

      <div className="toolbar-divider" />

      <button className="toolbar-btn" onClick={toggleGallery} title="Template Gallery">
        <FolderOpen />
        <span>Templates</span>
      </button>

      <LensToggle />

      <div className="toolbar-divider" />

      <button className="toolbar-btn danger" onClick={handleClear} title="Clear graph">
        <Trash2 />
        <span>Clear</span>
      </button>
    </div>
  );
}
