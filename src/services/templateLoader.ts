import { Template, TemplateMetadata } from '@/models/template';
import { GraphModel } from '@/models/graph';
import { StateSchema } from '@/models/state';

const TEMPLATE_FILES = import.meta.glob('../assets/templates/*.json', { eager: true });

const templatesCache = new Map<string, Template>();

export function getAllTemplates(): Template[] {
  if (templatesCache.size > 0) {
    return Array.from(templatesCache.values());
  }

  const templates: Template[] = [];

  for (const path in TEMPLATE_FILES) {
    try {
      const module = TEMPLATE_FILES[path] as { default: unknown };
      const template = validateTemplate(module.default);
      templatesCache.set(template.id, template);
      templates.push(template);
    } catch (error) {
      console.error(`Failed to load template from ${path}:`, error);
    }
  }

  return templates;
}

export function getTemplateMetadata(): TemplateMetadata[] {
  return getAllTemplates().map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    difficulty: t.difficulty,
    tags: t.tags,
    preview: t.preview,
  }));
}

export function getTemplateById(id: string): Template | undefined {
  const templates = getAllTemplates();
  return templates.find((t) => t.id === id);
}

export function validateTemplate(data: unknown): Template {
  if (!data || typeof data !== 'object') {
    throw new Error('Template must be an object');
  }

  const obj = data as Record<string, unknown>;

  if (!obj.id || typeof obj.id !== 'string') {
    throw new Error('Template must have an id string');
  }
  if (!obj.name || typeof obj.name !== 'string') {
    throw new Error('Template must have a name string');
  }
  if (!obj.description || typeof obj.description !== 'string') {
    throw new Error('Template must have a description string');
  }
  if (!obj.difficulty || !['beginner', 'intermediate', 'advanced'].includes(obj.difficulty as string)) {
    throw new Error('Template must have a valid difficulty level');
  }
  if (!Array.isArray(obj.tags)) {
    throw new Error('Template must have a tags array');
  }
  if (!obj.graph || typeof obj.graph !== 'object') {
    throw new Error('Template must have a graph object');
  }
  if (!obj.stateSchema || typeof obj.stateSchema !== 'object') {
    throw new Error('Template must have a stateSchema object');
  }

  const graph = obj.graph as GraphModel;
  if (graph.version !== 'v1') {
    throw new Error('Graph version must be v1');
  }
  if (!Array.isArray(graph.nodes)) {
    throw new Error('Graph must have a nodes array');
  }
  if (!Array.isArray(graph.edges)) {
    throw new Error('Graph must have an edges array');
  }

  const stateSchema = obj.stateSchema as StateSchema;
  if (stateSchema.version !== 'v1') {
    throw new Error('StateSchema version must be v1');
  }
  if (!Array.isArray(stateSchema.fields)) {
    throw new Error('StateSchema must have a fields array');
  }

  return data as Template;
}

export async function applyTemplate(template: Template): Promise<void> {
  const { useGraphStore } = await import('@/store/graphStore');
  useGraphStore.getState().loadGraph(template.graph);
}
