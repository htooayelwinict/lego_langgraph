# Phase 4: Lens Overlay + Templates

**Status:** ✅ Completed
**Completed:** 2026-01-06

## Objective

Add LangGraph Lens conceptual overlay and template gallery.

## Prerequisites

- Phases 1-3 completed
- Canvas and simulation working

## Tasks

### 4.1 LangGraph Lens

Toggle overlay showing conceptual model.

**Implementation:**
```typescript
// src/features/lens/LensOverlay.tsx
export function LensOverlay() {
  const { nodes, lensEnabled } = useGraphStore();

  if (!lensEnabled) return null;

  return (
    <svg className="lens-overlay">
      {nodes.map(node => (
        <LensAnnotation
          key={node.id}
          node={node}
          type={getNodeConceptualType(node)}
        />
      ))}
    </svg>
  );
}
```

**Features:**
- Toggle button in toolbar
- Overlay on top of canvas
- Color-coded by role:
  - Blue: Input/Entry (Start)
  - Green: Processing (LLM, Tool)
  - Yellow: Decision (Router, LoopGuard)
  - Purple: State Management (Reducer)
  - Red: Output/Terminal (End)
- Conceptual labels with tooltips

**Files:**
- `src/features/lens/LensOverlay.tsx`
- `src/features/lens/LensToggle.tsx`
- `src/features/lens/LensAnnotation.tsx`

### 4.2 Lens Explanations

Tooltips explaining LangGraph concepts.

**Implementation:**
- Tooltip on lens overlay elements
- Explain node roles in plain language
- Show examples of typical usage
- Link to docs (future)

**Content Examples:**
- Router: "Decides which path to take based on state"
- Reducer: "Merges multiple state updates into one"
- LoopGuard: "Checks if loop should continue"

**Files:**
- `src/features/lens/LensTooltips.tsx`
- `src/features/lens/lensContent.ts`

### 4.3 Template Gallery UI

Gallery for browsing and loading templates.

**Implementation:**
```typescript
// src/features/gallery/TemplateGallery.tsx
export function TemplateGallery() {
  const templates = useTemplates();

  return (
    <div className="template-gallery">
      <div className="template-grid">
        {templates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onLoad={() => loadTemplate(template)}
          />
        ))}
      </div>
    </div>
  );
}
```

**Features:**
- Grid/card layout
- Template preview image
- Name, description, difficulty badge
- "Use Template" button
- Filter by difficulty/type

**Files:**
- `src/features/gallery/TemplateGallery.tsx`
- `src/features/gallery/TemplateCard.tsx`
- `src/features/gallery/TemplateModal.tsx`

### 4.4 Canonical Templates

Create 5 canonical LangGraph templates.

**Templates to Create:**

1. **ReAct Agent**
   - Start → LLM → Tool → LoopGuard → LLM
   - LoopGuard continues until done
   - Classic reasoning + acting loop

2. **Router**
   - Start → Router → (LLM A, LLM B, LLM C) → End
   - Router selects based on input type
   - Demonstrates conditional branching

3. **Sequential Chain**
   - Start → LLM 1 → LLM 2 → LLM 3 → End
   - Linear state transformation
   - Simple data flow

4. **Tool Loop**
   - Start → LLM → Tool → LoopGuard → Tool
   - Repeated tool calls
   - Shows iteration pattern

5. **Map-Reduce**
   - Start → Router → (LLM A, LLM B, LLM C) → Reducer → End
   - Parallel execution concept
   - State aggregation

**Files:**
- `src/assets/templates/react-agent.json`
- `src/assets/templates/router.json`
- `src/assets/templates/sequential-chain.json`
- `src/assets/templates/tool-loop.json`
- `src/assets/templates/map-reduce.json`

**Template Schema:**
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  graph: GraphModel;
  stateSchema: StateSchema;
  preview?: string; // base64 image or path
}
```

### 4.5 Template System

Utilities for loading and managing templates.

**Implementation:**
```typescript
// src/services/templateLoader.ts
export async function loadTemplate(id: string): Promise<Template> {
  const response = await fetch(`/src/assets/templates/${id}.json`);
  const template = await response.json();
  validateTemplate(template);
  return template;
}

export function validateTemplate(template: unknown): Template {
  // Validate structure matches schema
  // Check graph and stateSchema are valid
  return template as Template;
}
```

**Features:**
- Load from JSON files
- Validate template structure
- Apply to current canvas
- "Save as Template" (future)

**Files:**
- `src/services/templateLoader.ts`
- `src/store/templateStore.ts`

### 4.6 Polish & Onboarding

Improve UX for new users.

**Implementation:**
- Welcome modal on first visit
- Explanation of core concepts
- "Get Started" button that loads a template
- Keyboard shortcuts:
  - `Ctrl/Cmd + Z`: Undo
  - `Ctrl/Cmd + Y`: Redo
  - `Delete`: Delete selected
  - `Ctrl/Cmd + S`: Export
- Toast notifications for actions
- Loading states during operations

**Files:**
- `src/app/OnboardingModal.tsx`
- `src/app/KeyboardShortcuts.tsx`
- `src/components/Toast.tsx`
- `src/components/LoadingSpinner.tsx`

## Deliverables

- [x] LangGraph Lens toggle and overlay
- [x] Conceptual annotations with tooltips
- [x] Template gallery with 5 templates
- [x] Template loading system
- [x] Onboarding modal
- [x] Keyboard shortcuts
- [x] Toast notifications

## Verification

```bash
npm run dev

# Manual test:
# 1. Click Lens toggle → verify overlay appears
# 2. Hover over lens annotations → verify tooltips
# 3. Open template gallery
# 4. Load ReAct template → verify graph loads
# 5. Run simulation on loaded template
# 6. Test keyboard shortcuts (Ctrl+Z, Delete)
# 7. Trigger toast (export graph)
```

## Notes

- Lens overlay should be subtle (don't obscure graph)
- Templates should be well-documented inline
- Onboarding should be skippable
- Store "seen onboarding" flag in localStorage

## Rollback Strategy

If lens/templates are complex:
- Start with 2 templates instead of 5
- Make lens overlay text-only (no graphics)
- Skip onboarding (add help link instead)
- Keep templates as read-only (no save-as)
