import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useStateStore } from '@/store/stateStore';
import { useUiStore } from '@/store/uiStore';
import { Plus, Settings } from 'lucide-react';
import { StateFieldItem } from './StateFieldItem';
import { FieldType } from '@/models/state';

const FIELD_TYPE_COLORS: Record<FieldType, string> = {
  string: 'bg-blue-100 text-blue-700',
  number: 'bg-green-100 text-green-700',
  boolean: 'bg-purple-100 text-purple-700',
  array: 'bg-orange-100 text-orange-700',
  object: 'bg-gray-100 text-gray-700',
  enum: 'bg-pink-100 text-pink-700',
};

export function StateSchemaPanel() {
  const { schema, errors } = useStateStore();
  const { showStatePanel, toggleStatePanel, openModal } = useUiStore();

  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: schema.fields.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 6,
  });

  if (!showStatePanel) {
    return (
      <button
        onClick={toggleStatePanel}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-r-lg p-2 shadow-md hover:bg-gray-50"
        title="Show State Panel"
      >
        <Settings className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="absolute left-0 top-0 bottom-0 w-80 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">State Schema</h2>
        </div>
        <button
          onClick={toggleStatePanel}
          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
          title="Hide panel"
        >
          <Settings className="w-4 h-4 rotate-90" />
        </button>
      </div>

      {/* Error Banner */}
      {errors.length > 0 && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800 mb-2">Validation Errors</p>
          <ul className="text-xs text-red-700 space-y-1">
            {errors.map((error, i) => (
              <li key={i}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Field List */}
      <div ref={parentRef} className="flex-1 overflow-y-auto p-4">
        {schema.fields.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            No fields defined yet. Add your first state field.
          </div>
        ) : (
          <div className="relative w-full" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const field = schema.fields[virtualRow.index];
              if (!field) return null;
              return (
                <div
                  key={field.key}
                  className="absolute left-0 top-0 w-full pb-2"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <StateFieldItem
                    field={field}
                    typeColor={FIELD_TYPE_COLORS[field.type]}
                    onEdit={() => openModal('state-field-editor', field.key)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Field Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => openModal('state-field-editor')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Field
        </button>
      </div>
    </div>
  );
}
