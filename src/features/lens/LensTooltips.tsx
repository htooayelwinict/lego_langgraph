import { NODE_ROLES } from './lensContent';

export function LensTooltip({ nodeType }: { nodeType: string }) {
  const info = NODE_ROLES[nodeType];

  if (!info) return null;

  return (
    <div className="lens-tooltip">
      <div className="tooltip-header" style={{ color: info.color }}>
        <span className="tooltip-icon">{info.icon}</span>
        <span className="tooltip-title">{info.label}</span>
      </div>
      <p className="tooltip-description">{info.description}</p>
      <div className="tooltip-role">
        <span className="role-badge" style={{ background: info.color }}>
          {info.role}
        </span>
      </div>
      <style>{`
        .lens-tooltip {
          padding: 12px;
          max-width: 250px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .tooltip-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .tooltip-icon {
          font-size: 18px;
        }
        .tooltip-title {
          font-size: 14px;
        }
        .tooltip-description {
          font-size: 13px;
          color: #64748b;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }
        .tooltip-role {
          display: flex;
        }
        .role-badge {
          padding: 4px 10px;
          border-radius: 12px;
          color: white;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}

export function LensLegend() {
  return (
    <div className="lens-legend">
      <h4>Node Roles</h4>
      <div className="legend-items">
        {Object.entries(NODE_ROLES).map(([type, info]) => (
          <div key={type} className="legend-item">
            <span className="legend-icon">{info.icon}</span>
            <span className="legend-label">{info.label}</span>
            <span className="legend-role" style={{ color: info.color }}>
              {info.role}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        .lens-legend {
          padding: 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        .lens-legend h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }
        .legend-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .legend-icon {
          font-size: 16px;
          width: 24px;
          text-align: center;
        }
        .legend-label {
          flex: 1;
          font-size: 13px;
          color: #475569;
        }
        .legend-role {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
