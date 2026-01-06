import { useEffect, useState, useMemo } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';

interface Step {
  title: string;
  content: React.ReactNode;
}

const getSteps = (): Step[] => [
  {
    title: 'Welcome to LangGraph Visual Modeler',
    content: (
      <>
        <p>
          Design, simulate, and understand LangGraph workflows through an interactive canvas.
          No backend execution required—everything runs in your browser.
        </p>
        <div className="feature-list">
          <div className="feature-item">
            <Sparkles size={16} />
            <span>7 node types for building any graph</span>
          </div>
          <div className="feature-item">
            <Sparkles size={16} />
            <span>Step-by-step simulation with explanations</span>
          </div>
          <div className="feature-item">
            <Sparkles size={16} />
            <span>LangGraph Lens for conceptual understanding</span>
          </div>
        </div>
      </>
    ),
  },
  {
    title: 'Build Your Graph',
    content: (
      <>
        <p>
          Drag nodes from the palette onto the canvas, then connect them to create workflows.
        </p>
        <ul>
          <li><strong>Start/End:</strong> Define workflow boundaries</li>
          <li><strong>LLM:</strong> Call language models</li>
          <li><strong>Tool:</strong> Execute functions</li>
          <li><strong>Router:</strong> Conditional branching</li>
          <li><strong>Reducer:</strong> Merge state updates</li>
          <li><strong>LoopGuard:</strong> Control loops</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Simulate & Understand',
    content: (
      <>
        <p>
          Run deterministic simulations to see exactly how your graph behaves. Each step shows:
        </p>
        <ul>
          <li>Which edges fired and why</li>
          <li>State changes at each step</li>
          <li>Active nodes highlighted</li>
        </ul>
        <p>
          Use the <strong>LangGraph Lens</strong> to see conceptual roles for each node.
        </p>
      </>
    ),
  },
  {
    title: 'Start Building',
    content: (
      <>
        <p>
          You're ready to start! Try loading a template from the gallery or create a graph from scratch.
        </p>
        <p className="hint">
          Press <kbd>T</kbd> to open the template gallery anytime.
        </p>
      </>
    ),
  },
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  const steps = useMemo(() => getSteps(), []);

  useEffect(() => {
    const seen = localStorage.getItem('onboarding-seen');
    if (!seen) {
      setIsOpen(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('onboarding-seen', 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding-seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const currentStep = steps[step];
  if (!currentStep) return null;

  return (
    <div className="onboarding-overlay" onClick={handleSkip}>
      <div className="onboarding-modal" onClick={(e) => e.stopPropagation()}>
        <button className="onboarding-close" onClick={handleSkip}>
          <X size={20} />
        </button>

        <div className="onboarding-content">
          <div className="onboarding-progress">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`progress-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
              />
            ))}
          </div>

          <h2>{currentStep.title}</h2>
          {currentStep.content}

          <div className="onboarding-actions">
            {step > 0 && (
              <button className="btn-secondary" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button className="btn-primary" onClick={() => setStep(step + 1)}>
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button className="btn-primary" onClick={handleComplete}>
                Get Started <Sparkles size={16} />
              </button>
            )}
          </div>
        </div>
        <style>{`
          .onboarding-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
          }
          .onboarding-modal {
            width: 90%;
            max-width: 500px;
            background: white;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          }
          .onboarding-close {
            position: absolute;
            top: 16px;
            right: 16px;
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 4px;
          }
          .onboarding-close:hover {
            color: #475569;
          }
          .onboarding-progress {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
          }
          .progress-dot {
            flex: 1;
            height: 4px;
            background: #e2e8f0;
            border-radius: 2px;
            transition: all 0.3s ease;
          }
          .progress-dot.active {
            background: #3b82f6;
          }
          .progress-dot.completed {
            background: #22c55e;
          }
          .onboarding-content h2 {
            margin: 0 0 16px 0;
            font-size: 22px;
            font-weight: 600;
            color: #1e293b;
          }
          .onboarding-content p {
            color: #64748b;
            line-height: 1.6;
            margin-bottom: 16px;
          }
          .onboarding-content ul {
            color: #64748b;
            margin: 0 0 16px 20px;
            line-height: 1.8;
          }
          .onboarding-content li {
            margin-bottom: 8px;
          }
          .feature-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin: 20px 0;
          }
          .feature-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #475569;
            font-size: 14px;
          }
          .feature-item svg:first-child {
            color: #3b82f6;
          }
          .hint {
            background: #f1f5f9;
            padding: 12px;
            border-radius: 8px;
            font-size: 13px;
          }
          .hint kbd {
            background: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            border: 1px solid #e2e8f0;
          }
          .onboarding-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
          }
          .btn-primary, .btn-secondary {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            border: none;
            transition: all 0.15s;
          }
          .btn-primary {
            background: #3b82f6;
            color: white;
          }
          .btn-primary:hover {
            background: #2563eb;
          }
          .btn-secondary {
            background: #f1f5f9;
            color: #475569;
          }
          .btn-secondary:hover {
            background: #e2e8f0;
          }
        `}</style>
      </div>
    </div>
  );
}
