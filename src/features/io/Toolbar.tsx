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
    <div
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 10,
        display: 'flex',
        gap: '8px',
        background: 'white',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <ToolbarButton icon={<Copy size={18} />} label="Copy" onClick={handleCopy} />
      <ToolbarButton icon={<Download size={18} />} label="Export" onClick={handleExport} />
      <ToolbarButton icon={<Upload size={18} />} label="Import" onClick={handleImportClick} />
      <ToolbarButton icon={<FolderOpen size={18} />} label="Templates" onClick={toggleGallery} />
      <LensToggle />
      <ToolbarButton icon={<Trash2 size={18} />} label="Clear" onClick={handleClear} danger />
    </div>
  );
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function ToolbarButton({ icon, label, onClick, danger = false }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        background: danger ? '#fee2e2' : '#f8fafc',
        border: `1px solid ${danger ? '#ef4444' : '#e2e8f0'}`,
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      color: danger ? '#dc2626' : '#475569',
      transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? '#fecaca' : '#e2e8f0';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = danger ? '#fee2e2' : '#f8fafc';
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
