import { useEffect } from 'react';
import { useGraphStore } from '@/store/graphStore';
import { showToast } from '@/components/Toast';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
}

const SHORTCUTS: ShortcutConfig[] = [
  {
    key: 'z',
    ctrl: true,
    description: 'Undo (not yet implemented)',
    action: () => showToast('Undo coming soon!', 'info'),
  },
  {
    key: 'y',
    ctrl: true,
    description: 'Redo (not yet implemented)',
    action: () => showToast('Redo coming soon!', 'info'),
  },
  {
    key: 's',
    ctrl: true,
    description: 'Export graph',
    action: () => {
      const { exportGraph } = useGraphStore.getState();
      const graph = exportGraph();
      const blob = new Blob([JSON.stringify(graph, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${graph.metadata?.name || 'graph'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Graph exported!', 'success');
    },
  },
  {
    key: 't',
    description: 'Toggle template gallery',
    action: () => {
      const { toggleGallery } = useGraphStore.getState();
      toggleGallery();
    },
  },
  {
    key: 'l',
    description: 'Toggle LangGraph Lens',
    action: () => {
      const { toggleLens } = useGraphStore.getState();
      toggleLens();
    },
  },
  {
    key: 'Delete',
    description: 'Delete selected node/edge',
    action: () => {
      const { selectedNodeId, selectedEdgeId, deleteNode, deleteEdge } = useGraphStore.getState();
      if (selectedNodeId) {
        deleteNode(selectedNodeId);
        showToast('Node deleted', 'success');
      } else if (selectedEdgeId) {
        deleteEdge(selectedEdgeId);
        showToast('Edge deleted', 'success');
      }
    },
  },
  {
    key: '?',
    shift: true,
    description: 'Show shortcuts help',
    action: () => {
      const helpText = SHORTCUTS.map(s => {
        const mods = [];
        if (s.ctrl) mods.push('Ctrl');
        if (s.meta) mods.push('Cmd');
        if (s.shift) mods.push('Shift');
        return `${mods.join('+')} ${mods.length > 0 ? '+ ' : ''}${s.key}: ${s.description}`;
      }).join('\n');
      alert(helpText);
    },
  },
];

export function KeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      for (const shortcut of SHORTCUTS) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

        if (keyMatch && ctrlMatch && shiftMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
}

export function ShortcutsHelp() {
  return (
    <div className="shortcuts-help">
      <h3>Keyboard Shortcuts</h3>
      <ul>
        {SHORTCUTS.map((shortcut) => {
          const mods = [];
          if (shortcut.ctrl) mods.push('Ctrl/Cmd');
          if (shortcut.shift) mods.push('Shift');
          return (
            <li key={shortcut.description}>
              <kbd>
                {mods.length > 0 ? mods.join(' + ') + ' + ' : ''}
                {shortcut.key}
              </kbd>
              <span>{shortcut.description}</span>
            </li>
          );
        })}
      </ul>
      <style>{`
        .shortcuts-help {
          padding: 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        .shortcuts-help h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }
        .shortcuts-help ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .shortcuts-help li {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          font-size: 13px;
          color: #64748b;
        }
        .shortcuts-help kbd {
          padding: 4px 8px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-family: monospace;
          font-size: 11px;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
