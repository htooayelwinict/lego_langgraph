import { ReactFlowProvider } from 'reactflow';
import { CanvasView, NodeInspector, EdgeInspector } from '@/features/canvas';
import { StateSchemaPanel, StateFieldEditor } from '@/features/state';
import { Toolbar } from '@/features/io/Toolbar';
import { StepControls, ErrorBanner } from '@/features/sim';
import { LensOverlay } from '@/features/lens';
import { TemplateGallery } from '@/features/gallery';
import { OnboardingModal } from './OnboardingModal';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { ToastContainer } from '@/components/Toast';
import { useGraphStore } from '@/store/graphStore';
import { useSimulationStore } from '@/store/simulationStore';

function App() {
  const { selectedNodeId, selectedEdgeId } = useGraphStore();
  const { trace } = useSimulationStore();
  const hasSimulation = trace.steps.length > 0;

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
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
        }

        .right-panel {
          position: relative;
          overflow: hidden;
        }

        .right-panel-empty {
          width: 100%;
          height: 100%;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .right-panel-empty-content {
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
          padding: 32px;
        }
      `}</style>

      <ReactFlowProvider>
        {/* Left Panel - State Schema */}
        <StateSchemaPanel />

        {/* Center - Canvas */}
        <div className="center-panel">
          {/* Simulation Controls (shown when simulation exists) */}
          {hasSimulation && (
            <div className="sim-controls-wrapper">
              <StepControls />
            </div>
          )}

          {/* Error Banner */}
          <ErrorBanner />

          <CanvasView />
          <LensOverlay />
          <Toolbar />
        </div>

        {/* Right Panel - Inspector */}
        <div className="right-panel">
          {selectedNodeId && <NodeInspector />}
          {selectedEdgeId && <EdgeInspector />}

          {/* Empty state when nothing selected */}
          {!selectedNodeId && !selectedEdgeId && (
            <div className="right-panel-empty">
              <div className="right-panel-empty-content">
                <p>Select a node or edge to view its properties</p>
              </div>
            </div>
          )}
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
