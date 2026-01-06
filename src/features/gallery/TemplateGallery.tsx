import { useState, useMemo } from 'react';
import { getTemplateMetadata, applyTemplate, getAllTemplates } from '@/services/templateLoader';
import { DifficultyLevel } from '@/models/template';
import { X, Search } from 'lucide-react';
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
          <h2>Template Gallery</h2>
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
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .template-gallery-modal {
          width: 90%;
          max-width: 1000px;
          max-height: 85vh;
          background: white;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
        }
        .gallery-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
        }
        .gallery-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
        }
        .close-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.15s;
        }
        .close-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .gallery-controls {
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          min-width: 200px;
        }
        .search-box input {
          flex: 1;
          border: none;
          background: none;
          outline: none;
          font-size: 14px;
        }
        .difficulty-filters {
          display: flex;
          gap: 8px;
        }
        .filter-btn {
          padding: 8px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s;
        }
        .filter-btn:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }
        .filter-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }
        .templates-grid {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .no-templates {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
