import { create } from 'zustand';

type ModalType = 'state-field-editor' | null;

interface UiState {
  // Panel visibility
  showStatePanel: boolean;
  showInspector: boolean;

  // Modal state
  activeModal: ModalType;
  editingFieldKey: string | null;

  // Actions
  toggleStatePanel: () => void;
  toggleInspector: () => void;
  openModal: (type: ModalType, fieldKey?: string) => void;
  closeModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  // Initial state - both panels open by default
  showStatePanel: true,
  showInspector: true,
  activeModal: null,
  editingFieldKey: null,

  toggleStatePanel: () => set((state) => ({ showStatePanel: !state.showStatePanel })),

  toggleInspector: () => set((state) => ({ showInspector: !state.showInspector })),

  openModal: (type, fieldKey?: string) =>
    set({
      activeModal: type,
      editingFieldKey: fieldKey ?? null,
    }),

  closeModal: () =>
    set({
      activeModal: null,
      editingFieldKey: null,
    }),
}));
