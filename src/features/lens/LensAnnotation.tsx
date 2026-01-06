import { memo } from 'react';
import { Node } from 'reactflow';
import { getNodeConceptualType } from './lensContent';

interface LensAnnotationProps {
  node: Node;
  viewport: { x: number; y: number; zoom: number };
}

export const LensAnnotation = memo<LensAnnotationProps>(({ node, viewport }) => {
  const info = getNodeConceptualType(node.data.type);

  const x = node.position.x * viewport.zoom + viewport.x;
  const y = node.position.y * viewport.zoom + viewport.y;

  return (
    <g
      className="lens-annotation"
      transform={`translate(${x}, ${y})`}
      style={{ pointerEvents: 'none' }}
    >
      <rect
        x={-10}
        y={-10}
        width={200}
        height={80}
        fill={info.color}
        fillOpacity={0.1}
        stroke={info.color}
        strokeOpacity={0.5}
        strokeWidth={2}
        rx={8}
      />
      <text
        x={90}
        y={15}
        textAnchor="middle"
        fill={info.color}
        fontSize={14}
        fontWeight={600}
      >
        {info.label}
      </text>
      <text
        x={90}
        y={38}
        textAnchor="middle"
        fill={info.color}
        fontSize={11}
        opacity={0.8}
      >
        {info.icon} {info.role}
      </text>
      <style>{`
        .lens-annotation {
          transition: opacity 0.2s ease;
        }
      `}</style>
    </g>
  );
});

LensAnnotation.displayName = 'LensAnnotation';
