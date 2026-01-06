import { useEffect, useState, useMemo } from 'react';
import { X, Sparkles, ArrowRight, Zap, Layers, Eye } from 'lucide-react';

interface Step {
  title: string;
  content: React.ReactNode;
  icon: React.ReactNode;
}

const getSteps = (): Step[] => [
  {
    title: 'Welcome to LangGraph Visual Modeler',
    icon: <Zap size={24} />,
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
    icon: <Layers size={24} />,
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
    icon: <Eye size={24} />,
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
    icon: <Sparkles size={24} />,
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

          <div className="step-icon">{currentStep.icon}</div>
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
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fade-in 0.3s ease;
          }

          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .onboarding-modal {
            position: relative;
            width: 90%;
            max-width: 520px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-xl);
            padding: 40px;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
            animation: scale-in 0.3s ease;
          }

          @keyframes scale-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }

          .onboarding-close {
            position: absolute;
            top: 16px;
            right: 16px;
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 8px;
            border-radius: var(--radius-sm);
            transition: all var(--transition-fast);
          }

          .onboarding-close:hover {
            color: var(--text-primary);
            background: var(--bg-elevated);
          }

          .onboarding-progress {
            display: flex;
            gap: 8px;
            margin-bottom: 32px;
          }

          .progress-dot {
            flex: 1;
            height: 4px;
            background: var(--bg-elevated);
            border-radius: var(--radius-full);
            transition: all 0.3s ease;
          }

          .progress-dot.active {
            background: var(--gradient-primary);
            box-shadow: 0 0 12px var(--accent-blue);
          }

          .progress-dot.completed {
            background: var(--accent-emerald);
          }

          .step-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            background: var(--gradient-primary);
            border-radius: var(--radius-lg);
            color: white;
            margin-bottom: 20px;
            box-shadow: var(--shadow-glow-blue);
          }

          .onboarding-content h2 {
            margin: 0 0 16px 0;
            font-size: 24px;
            font-weight: 600;
            color: var(--text-primary);
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .onboarding-content p {
            color: var(--text-secondary);
            line-height: 1.7;
            margin-bottom: 16px;
          }

          .onboarding-content ul {
            color: var(--text-secondary);
            margin: 0 0 16px 20px;
            line-height: 1.9;
          }

          .onboarding-content li {
            margin-bottom: 6px;
          }

          .onboarding-content li strong {
            color: var(--text-primary);
          }

          .feature-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin: 24px 0;
          }

          .feature-item {
            display: flex;
            align-items: center;
            gap: 12px;
            color: var(--text-secondary);
            font-size: 14px;
            padding: 12px;
            background: var(--bg-primary);
            border-radius: var(--radius-md);
            border: 1px solid var(--border-subtle);
          }

          .feature-item svg:first-child {
            color: var(--accent-amber);
          }

          .hint {
            background: var(--bg-primary);
            padding: 14px;
            border-radius: var(--radius-md);
            border: 1px solid var(--border-subtle);
            font-size: 13px;
          }

          .hint kbd {
            background: var(--bg-elevated);
            padding: 3px 8px;
            border-radius: var(--radius-sm);
            font-family: var(--font-mono);
            font-size: 12px;
            border: 1px solid var(--border-default);
          }

          .onboarding-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 32px;
          }

          .btn-primary, .btn-secondary {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border-radius: var(--radius-md);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            border: none;
            transition: all var(--transition-fast);
          }

          .btn-primary {
            background: var(--gradient-primary);
            color: white;
            box-shadow: var(--shadow-sm);
          }

          .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: var(--shadow-md), var(--shadow-glow-blue);
          }

          .btn-secondary {
            background: var(--bg-elevated);
            color: var(--text-secondary);
            border: 1px solid var(--border-default);
          }

          .btn-secondary:hover {
            background: var(--bg-glass-light);
            color: var(--text-primary);
          }
        `}</style>
      </div>
    </div>
  );
}
