import { TemplateMetadata } from '@/models/template';
import { Book, Rocket, Zap, ArrowRight } from 'lucide-react';

interface TemplateCardProps {
  template: TemplateMetadata;
  onLoad: () => void;
}

const DIFFICULTY_ICONS = {
  beginner: Book,
  intermediate: Zap,
  advanced: Rocket,
};

const DIFFICULTY_COLORS = {
  beginner: { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399', solid: '#10b981' },
  intermediate: { bg: 'rgba(245, 158, 11, 0.2)', text: '#fbbf24', solid: '#f59e0b' },
  advanced: { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171', solid: '#ef4444' },
};

export function TemplateCard({ template, onLoad }: TemplateCardProps) {
  const Icon = DIFFICULTY_ICONS[template.difficulty];
  const colors = DIFFICULTY_COLORS[template.difficulty];

  return (
    <div className="template-card">
      <div className="template-preview" style={{ '--preview-color': colors.solid } as React.CSSProperties}>
        {template.preview ? (
          <img src={template.preview} alt={template.name} />
        ) : (
          <div className="preview-placeholder">
            <Icon size={36} />
          </div>
        )}
      </div>
      <div className="template-content">
        <div className="template-header">
          <h3 className="template-name">{template.name}</h3>
          <span
            className="difficulty-badge"
            style={{
              background: colors.bg,
              color: colors.text
            }}
          >
            {template.difficulty}
          </span>
        </div>
        <p className="template-description">{template.description}</p>
        <div className="template-tags">
          {template.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <button className="load-template-btn" onClick={onLoad}>
        <span>Use Template</span>
        <ArrowRight size={14} />
      </button>
      <style>{`
        .template-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all var(--transition-normal);
        }

        .template-card:hover {
          border-color: var(--accent-blue);
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4), var(--shadow-glow-blue);
        }

        .template-preview {
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          border-bottom: 1px solid var(--border-subtle);
        }

        .template-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: var(--radius-lg);
          background: var(--bg-glass);
          color: var(--preview-color);
        }

        .template-content {
          padding: var(--space-4);
        }

        .template-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-2);
          margin-bottom: var(--space-2);
        }

        .template-name {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .difficulty-badge {
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }

        .template-description {
          margin: 0 0 var(--space-3) 0;
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .template-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag {
          padding: 4px 10px;
          background: var(--bg-elevated);
          border-radius: var(--radius-full);
          font-size: 11px;
          color: var(--text-muted);
        }

        .load-template-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: 14px;
          background: var(--gradient-primary);
          color: white;
          border: none;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .load-template-btn:hover {
          filter: brightness(1.1);
        }

        .load-template-btn svg {
          transition: transform var(--transition-fast);
        }

        .load-template-btn:hover svg {
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}
