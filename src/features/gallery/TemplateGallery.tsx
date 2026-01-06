import { useState, useMemo } from 'react';
import { getTemplateMetadata, applyTemplate, getAllTemplates } from '@/services/templateLoader';
import { DifficultyLevel } from '@/models/template';
import { X, Search, Layers } from 'lucide-react';
import { useGraphStore } from '@/store/graphStore';
import { TemplateCard } from './TemplateCard';

export function TemplateGallery() {
  const galleryOpen = useGraphStore((s) => s.galleryOpen);
  const setGalleryOpen = useGraphStore((s) => s.setGalleryOpen);

  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'all'>('all');

  const templates = useMemo(() => {
    let filtered = getTemplateMetadata();

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((t) => t.difficulty === difficultyFilter);
    }

    return filtered;
  }, [searchQuery, difficultyFilter]);

  const handleLoadTemplate = async (id: string) => {
    const templates = getAllTemplates();
    const template = templates.find((t) => t.id === id);
    if (template) {
      await applyTemplate(template);
      setGalleryOpen(false);
    }
  };

  if (!galleryOpen) return null;

  return (
    <div className="template-gallery-overlay" onClick={() => setGalleryOpen(false)}>
      <div className="template-gallery-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gallery-header">
          <div className="gallery-title">
            <Layers size={20} />
            <h2>Template Gallery</h2>
          </div>
          <button className="close-btn" onClick={() => setGalleryOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="gallery-controls">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="difficulty-filters">
            <button
              className={`filter-btn ${difficultyFilter === 'all' ? 'active' : ''}`}
              onClick={() => setDifficultyFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${difficultyFilter === 'beginner' ? 'active' : ''}`}
              onClick={() => setDifficultyFilter('beginner')}
            >
              Beginner
            </button>
            <button
              className={`filter-btn ${difficultyFilter === 'intermediate' ? 'active' : ''}`}
              onClick={() => setDifficultyFilter('intermediate')}
            >
              Intermediate
            </button>
            <button
              className={`filter-btn ${difficultyFilter === 'advanced' ? 'active' : ''}`}
              onClick={() => setDifficultyFilter('advanced')}
            >
              Advanced
            </button>
          </div>
        </div>

        <div className="templates-grid">
          {templates.length === 0 ? (
            <div className="no-templates">
              <p>No templates match your search.</p>
            </div>
          ) : (
            templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onLoad={() => handleLoadTemplate(template.id)}
              />
            ))
          )}
        </div>
      </div>
      <style>{`
        .template-gallery-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fade-in 0.2s ease;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .template-gallery-modal {
          width: 90%;
          max-width: 1100px;
          max-height: 85vh;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          animation: scale-in 0.2s ease;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
        }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }

        .gallery-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .gallery-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .gallery-title svg {
          color: var(--accent-purple);
        }

        .gallery-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .close-btn:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }

        .gallery-controls {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          min-width: 200px;
          transition: all var(--transition-fast);
        }

        .search-box:focus-within {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .search-box svg {
          color: var(--text-muted);
        }

        .search-box input {
          flex: 1;
          border: none;
          background: none;
          outline: none;
          font-size: 14px;
          color: var(--text-primary);
        }

        .search-box input::placeholder {
          color: var(--text-muted);
        }

        .difficulty-filters {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          padding: 10px 16px;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-btn:hover {
          border-color: var(--border-strong);
          color: var(--text-secondary);
        }

        .filter-btn.active {
          background: var(--gradient-primary);
          border-color: transparent;
          color: white;
          box-shadow: var(--shadow-sm);
        }

        .templates-grid {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .no-templates {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
