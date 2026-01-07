import { ReactFlowProvider } from 'reactflow';
import { CanvasView, NodeInspector, EdgeInspector } from '@/features/canvas';
import { StateSchemaPanel, StateFieldEditor } from '@/features/state';
import { Toolbar } from '@/features/io/Toolbar';
import { StepControls, ErrorBanner, TraceListPanel } from '@/features/sim';
import { LensOverlay } from '@/features/lens';
import { TemplateGallery } from '@/features/gallery';
import { OnboardingModal } from './OnboardingModal';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { ToastContainer } from '@/components/Toast';
import { useGraphStore } from '@/store/graphStore';
import { useState, useRef, useLayoutEffect, useCallback } from 'react';

function App() {
  const { selectedNodeId, selectedEdgeId } = useGraphStore();

  // Draggable state
  const [controlsPosition, setControlsPosition] = useState({ x: 0, y: 16 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    dragging: false,
    offsetX: 0,
    offsetY: 0,
    width: 0,
    height: 0,
  });

  // Center the toolbar on first render
  useLayoutEffect(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const centerX = window.innerWidth / 2 - rect.width / 2;
      setControlsPosition({ x: centerX, y: 16 });
    }
  }, []);

  // Pointer handlers for dragging
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only allow drag from the handle
    const handle = (e.target as HTMLElement).closest('[data-drag-handle]');
    if (!handle) return;

    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragState.current = {
      dragging: true,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };

    wrapperRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging) return;

    const maxX = window.innerWidth - dragState.current.width;
    const maxY = window.innerHeight - dragState.current.height;

    let newX = e.clientX - dragState.current.offsetX;
    let newY = e.clientY - dragState.current.offsetY;

    // Clamp to viewport
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    requestAnimationFrame(() => {
      setControlsPosition({ x: newX, y: newY });
    });
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current.dragging = false;
    wrapperRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  const handlePointerCancel = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current.dragging = false;
    wrapperRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  return (
    <div className="app-layout">
      <style>{`
        .app-layout {
          display: grid;
          grid-template-columns: 280px 1fr 320px;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background-color: var(--bg-primary);
        }

        .center-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }

        .sim-controls-wrapper {
          position: fixed;
          z-index: 50;
          touch-action: none;
        }

        .right-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .trace-list-wrapper {
          flex: 1;
          overflow: hidden;
          border-top: 1px solid var(--border-subtle);
        }
      `}</style>

      <ReactFlowProvider>
        {/* Left Panel - State Schema */}
        <StateSchemaPanel />

        {/* Center - Canvas */}
        <div className="center-panel">
          {/* Simulation Controls (always visible) */}
          <div
            ref={wrapperRef}
            className="sim-controls-wrapper"
            style={{
              left: `${controlsPosition.x}px`,
              top: `${controlsPosition.y}px`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            <StepControls />
          </div>

          {/* Error Banner */}
          <ErrorBanner />

          <CanvasView />
          <LensOverlay />
          <Toolbar />
        </div>

        {/* Right Panel - Inspector + Trace List */}
        <div className="right-panel">
          {/* Top: Inspector (conditional) */}
          {selectedNodeId && <NodeInspector />}
          {selectedEdgeId && <EdgeInspector />}

          {/* Bottom: Trace List (always visible) */}
          <div className="trace-list-wrapper">
            <TraceListPanel />
          </div>
        </div>

        {/* Modals */}
        <StateFieldEditor />
        <TemplateGallery />
        <OnboardingModal />
      </ReactFlowProvider>

      {/* Global components outside provider */}
      <KeyboardShortcuts />
      <ToastContainer />
    </div>
  );
}

export default App;
