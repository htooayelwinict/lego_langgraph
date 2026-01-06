import { Eye, EyeOff } from 'lucide-react';
import { useGraphStore } from '@/store/graphStore';

export function LensToggle() {
  const lensEnabled = useGraphStore((s) => s.lensEnabled);
  const toggleLens = useGraphStore((s) => s.toggleLens);

  return (
    <button
      onClick={toggleLens}
      className={`lens-toggle ${lensEnabled ? 'active' : ''}`}
      title={lensEnabled ? 'Hide LangGraph Lens' : 'Show LangGraph Lens'}
    >
      {lensEnabled ? <EyeOff size={18} /> : <Eye size={18} />}
      <span className="toggle-label">Lens</span>
      <style>{`
        .lens-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          transition: all 0.15s ease;
        }
        .lens-toggle:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        .lens-toggle.active {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #3b82f6;
        }
        .toggle-label {
          font-size: 12px;
        }
      `}</style>
    </button>
  );
}
