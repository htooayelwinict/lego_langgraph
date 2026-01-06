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
    <div className="w-screen h-screen overflow-hidden grid grid-cols-[280px_1fr_320px] bg-gray-50">
      <ReactFlowProvider>
        {/* Left Panel - State Schema */}
        <StateSchemaPanel />

        {/* Center - Canvas */}
        <div className="relative flex flex-col">
          {/* Simulation Controls (shown when simulation exists) */}
          {hasSimulation && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
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
        <div className="relative">
          {selectedNodeId && <NodeInspector />}
          {selectedEdgeId && <EdgeInspector />}

          {/* Empty state when nothing selected */}
          {!selectedNodeId && !selectedEdgeId && (
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 flex items-center justify-center z-10">
              <div className="text-center text-gray-400 text-sm p-8">
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
