import { memo } from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';
import { useSimulationStore } from '@/store/simulationStore';

export const ConditionEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
  }: EdgeProps) => {
    const { activeEdgeIds } = useSimulationStore();
    const isActive = activeEdgeIds.includes(id);

    const [edgePath] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    return (
      <>
        {/* Glow effect for active edges */}
        {isActive && (
          <BaseEdge
            id={`${id}-glow`}
            path={edgePath}
            style={{
              stroke: '#22c55e',
              strokeWidth: 6,
              opacity: 0.3,
            }}
          />
        )}

        <BaseEdge
          id={id}
          path={edgePath}
          style={{
            stroke: isActive
              ? '#22c55e'
              : selected
              ? '#3b82f6'
              : '#94a3b8',
            strokeWidth: isActive ? 3 : selected ? 3 : 2,
            strokeDasharray: isActive ? '5 5' : undefined,
            animation: isActive ? 'dash 300ms linear infinite' : undefined,
          }}
        />

      {/* Edge label */}
      {data?.label && (
        <foreignObject
          x={(sourceX + targetX) / 2 - 40}
          y={(sourceY + targetY) / 2 - 10}
          width={80}
          height={20}
          className="edge-label-foreign"
        >
          <div
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {data.label}
          </div>
        </foreignObject>
      )}

      {/* Condition badge */}
      {data?.condition && (
        <foreignObject
          x={(sourceX + targetX) / 2 - 30}
          y={(sourceY + targetY) / 2 + 15}
          width={60}
          height={20}
        >
          <div
            style={{
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '10px',
              textAlign: 'center',
              color: '#92400e',
            }}
          >
            {data.condition}
          </div>
        </foreignObject>
      )}
    </>
  );
});

ConditionEdge.displayName = 'ConditionEdge';
