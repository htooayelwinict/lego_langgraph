import { useGraphStore } from '@/store/graphStore';
import { useReactFlow } from 'reactflow';
import { LensAnnotation } from './LensAnnotation';

export function LensOverlay() {
  const nodes = useGraphStore((s) => s.nodes);
  const lensEnabled = useGraphStore((s) => s.lensEnabled);
  const viewport = useReactFlow().getViewport();

  if (!lensEnabled || nodes.length === 0) return null;

  return (
    <svg
      className="lens-overlay-svg"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
        overflow: 'visible',
      }}
    >
      {nodes.map((node) => (
        <LensAnnotation
          key={node.id}
          node={node}
          viewport={viewport}
        />
      ))}
    </svg>
  );
}
