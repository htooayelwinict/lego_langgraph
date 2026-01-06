import { TemplateMetadata } from '@/models/template';
import { Book, Rocket, Zap } from 'lucide-react';

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
  beginner: '#22c55e',
  intermediate: '#eab308',
  advanced: '#ef4444',
};

export function TemplateCard({ template, onLoad }: TemplateCardProps) {
  const Icon = DIFFICULTY_ICONS[template.difficulty];
  const color = DIFFICULTY_COLORS[template.difficulty];

  return (
    <div className="template-card">
      <div className="template-preview" style={{ background: `${color}10` }}>
        {template.preview ? (
          <img src={template.preview} alt={template.name} />
        ) : (
          <div className="preview-placeholder" style={{ color }}>
            <Icon size={32} />
          </div>
        )}
      </div>
      <div className="template-content">
        <div className="template-header">
          <h3 className="template-name">{template.name}</h3>
          <span className="difficulty-badge" style={{ background: color }}>
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
        Use Template
      </button>
      <style>{`
        .template-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          background: white;
          transition: all 0.2s ease;
        }
        .template-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        .template-preview {
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
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
          width: 100%;
          height: 100%;
        }
        .template-content {
          padding: 16px;
        }
        .template-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 8px;
        }
        .template-name {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }
        .difficulty-badge {
          padding: 4px 8px;
          border-radius: 12px;
          color: white;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .template-description {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: #64748b;
          line-height: 1.4;
        }
        .template-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }
        .tag {
          padding: 4px 8px;
          background: #f1f5f9;
          border-radius: 6px;
          font-size: 11px;
          color: #64748b;
        }
        .load-template-btn {
          width: 100%;
          padding: 10px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }
        .load-template-btn:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}
