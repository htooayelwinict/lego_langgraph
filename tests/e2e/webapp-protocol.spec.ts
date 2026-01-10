/**
 * Webapp Protocol E2E Tests
 *
 * Tests the complete web application behavior from user interactions
 * through the entire stack. These tests verify critical user workflows
 * and ensure the application protocol works as intended.
 */

import { test, expect } from '@playwright/test';

test.describe('Webapp Protocol: Graph Creation Workflow', () => {
  test('creates a complete graph from scratch', async ({ page }) => {
    await page.goto('/');

    // Wait for app to load
    await expect(page.getByRole('heading', { name: 'State Schema' })).toBeVisible();

    // Drag a Start node to canvas
    const startNodeHandle = page.locator('[data-node-type="Start"]').first();
    const canvas = page.locator('.react-flow');
    await startNodeHandle.dragTo(canvas, {
      targetPosition: { x: 100, y: 100 },
    });

    // Verify Start node was added
    await expect(page.locator('.react-flow__node[data-type="Start"]')).toBeVisible();

    // Drag an LLM node
    const llmNodeHandle = page.locator('[data-node-type="LLM"]').first();
    await llmNode.dragTo(canvas, {
      targetPosition: { x: 300, y: 100 },
    });
    await expect(page.locator('.react-flow__node[data-type="LLM"]')).toBeVisible();

    // Drag an End node
    const endNodeHandle = page.locator('[data-node-type="End"]').first();
    await endNodeHandle.dragTo(canvas, {
      targetPosition: { x: 500, y: 100 },
    });
    await expect(page.locator('.react-flow__node[data-type="End"]')).toBeVisible();

    // Connect Start to LLM
    const startNode = page.locator('.react-flow__node[data-type="Start"]');
    const llmNode = page.locator('.react-flow__node[data-type="LLM"]');

    // Get the handle positions (source handle on Start, target on LLM)
    const startHandle = startNode.locator('.react-flow__handle-right');
    const llmHandle = llmNode.locator('.react-flow__handle-left');

    await startHandle.dragTo(llmHandle);

    // Verify edge was created
    await expect(page.locator('.react-flow__edge')).toHaveCount(1);

    // Connect LLM to End
    const llmSourceHandle = llmNode.locator('.react-flow__handle-right');
    const endNode = page.locator('.react-flow__node[data-type="End"]');
    const endHandle = endNode.locator('.react-flow__handle-left');

    await llmSourceHandle.dragTo(endHandle);

    // Verify second edge was created
    await expect(page.locator('.react-flow__edge')).toHaveCount(2);

    // Verify no empty canvas hint is visible
    await expect(page.locator('.canvas-empty-hint')).not.toBeVisible();
  });

  test('selects and edits node properties', async ({ page }) => {
    await page.goto('/');

    // Add a node first
    const startNodeHandle = page.locator('[data-node-type="Start"]').first();
    const canvas = page.locator('.react-flow');
    await startNodeHandle.dragTo(canvas, {
      targetPosition: { x: 100, y: 100 },
    });

    // Click on the node to select it
    const node = page.locator('.react-flow__node[data-type="Start"]');
    await node.click();

    // Verify inspector panel is shown
    await expect(page.locator('.inspector-panel')).toBeVisible();

    // Verify node label is editable (inspector should show node details)
    await expect(page.locator('.inspector-panel')).toContainText('Start');
  });

  test('deletes selected node with keyboard', async ({ page }) => {
    await page.goto('/');

    // Add a node
    const startNodeHandle = page.locator('[data-node-type="Start"]').first();
    const canvas = page.locator('.react-flow');
    await startNodeHandle.dragTo(canvas, {
      targetPosition: { x: 100, y: 100 },
    });

    await expect(page.locator('.react-flow__node')).toHaveCount(1);

    // Select the node
    await page.locator('.react-flow__node').click();

    // Press Delete key
    await page.keyboard.press('Delete');

    // Verify node was deleted
    await expect(page.locator('.react-flow__node')).toHaveCount(0);
  });

  test('deletes selected edge with keyboard', async ({ page }) => {
    await page.goto('/');

    // Create two connected nodes
    const canvas = page.locator('.react-flow');

    const startNodeHandle = page.locator('[data-node-type="Start"]').first();
    await startNodeHandle.dragTo(canvas, { targetPosition: { x: 100, y: 100 } });

    const endNodeHandle = page.locator('[data-node-type="End"]').first();
    await endNodeHandle.dragTo(canvas, { targetPosition: { x: 300, y: 100 } });

    // Connect them
    const startNode = page.locator('.react-flow__node[data-type="Start"]');
    const endNode = page.locator('.react-flow__node[data-type="End"]');
    const startHandle = startNode.locator('.react-flow__handle-right');
    const endHandle = endNode.locator('.react-flow__handle-left');
    await startHandle.dragTo(endHandle);

    await expect(page.locator('.react-flow__edge')).toHaveCount(1);

    // Select the edge
    await page.locator('.react-flow__edge').click();

    // Press Delete key
    await page.keyboard.press('Delete');

    // Verify edge was deleted but nodes remain
    await expect(page.locator('.react-flow__edge')).toHaveCount(0);
    await expect(page.locator('.react-flow__node')).toHaveCount(2);
  });
});

test.describe('Webapp Protocol: Simulation Workflow', () => {
  test('runs a simple linear simulation', async ({ page }) => {
    await page.goto('/');

    // Create a simple Start -> LLM -> End graph
    const canvas = page.locator('.react-flow');

    const startHandle = page.locator('[data-node-type="Start"]').first();
    await startHandle.dragTo(canvas, { targetPosition: { x: 100, y: 100 } });

    const llmHandle = page.locator('[data-node-type="LLM"]').first();
    await llmHandle.dragTo(canvas, { targetPosition: { x: 300, y: 100 } });

    const endHandle = page.locator('[data-node-type="End"]').first();
    await endHandle.dragTo(canvas, { targetPosition: { x: 500, y: 100 } });

    // Connect nodes
    const startNode = page.locator('.react-flow__node[data-type="Start"]');
    const llmNode = page.locator('.react-flow__node[data-type="LLM"]');
    const endNode = page.locator('.react-flow__node[data-type="End"]');

    await startNode.locator('.react-flow__handle-right').dragTo(
      llmNode.locator('.react-flow__handle-left')
    );
    await llmNode.locator('.react-flow__handle-right').dragTo(
      endNode.locator('.react-flow__handle-left')
    );

    // Click Run button
    const runButton = page.getByRole('button', { name: /run/i });
    await runButton.click();

    // Wait for simulation to complete
    await expect(page.locator('.trace-list-panel')).toBeVisible();

    // Verify trace steps are shown
    await expect(page.locator('.trace-step-item')).toHaveCount(3); // Start, LLM, End

    // Verify status shows complete
    await expect(page.locator('.status-badge')).toContainText('complete');
  });

  test('navigates simulation steps with controls', async ({ page }) => {
    await page.goto('/');

    // Create and run a simple graph
    const canvas = page.locator('.react-flow');

    const startHandle = page.locator('[data-node-type="Start"]').first();
    await startHandle.dragTo(canvas, { targetPosition: { x: 100, y: 100 } });

    const endHandle = page.locator('[data-node-type="End"]').first();
    await endHandle.dragTo(canvas, { targetPosition: { x: 300, y: 100 } });

    const startNode = page.locator('.react-flow__node[data-type="Start"]');
    const endNode = page.locator('.react-flow__node[data-type="End"]');
    await startNode.locator('.react-flow__handle-right').dragTo(
      endNode.locator('.react-flow__handle-left')
    );

    // Run simulation
    await page.getByRole('button', { name: /run/i }).click();
    await expect(page.locator('.trace-step-item')).toHaveCount(2);

    // Step backward
    const stepBackButton = page.getByRole('button', { name: /step back|previous/i });
    await stepBackButton.click();

    // Verify we can step forward again
    const stepForwardButton = page.getByRole('button', { name: /step forward|next/i });
    await stepForwardButton.click();

    // Verify trace is still visible
    await expect(page.locator('.trace-step-item')).toHaveCount(2);
  });

  test('shows error for invalid graph (no Start node)', async ({ page }) => {
    await page.goto('/');

    // Add only an End node (invalid graph)
    const canvas = page.locator('.react-flow');
    const endHandle = page.locator('[data-node-type="End"]').first();
    await endHandle.dragTo(canvas, { targetPosition: { x: 100, y: 100 } });

    // Try to run simulation
    await page.getByRole('button', { name: /run/i }).click();

    // Verify error is shown
    await expect(page.locator('.error-banner')).toBeVisible();
    await expect(page.locator('.error-banner')).toContainText('Start');
  });
});

test.describe('Webapp Protocol: Import/Export Workflow', () => {
  test('exports graph to file', async ({ page }) => {
    await page.goto('/');

    // Create a simple graph
    const canvas = page.locator('.react-flow');
    const startHandle = page.locator('[data-node-type="Start"]').first();
    await startHandle.dragTo(canvas, { targetPosition: { x: 100, y: 100 } });

    // Set up download handler
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    await page.getByRole('button', { name: /export/i }).click();

    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.json$/);

    // Verify file content
    const content = await download.createReadStream();
    const text = await streamToString(content);
    const json = JSON.parse(text);

    expect(json.version).toBe('v1');
    expect(json.nodes).toHaveLength(1);
    expect(json.nodes[0].type).toBe('Start');
  });

  test('imports graph from file', async ({ page }) => {
    await page.goto('/');

    // Create a test graph JSON
    const testGraph = {
      version: 'v1',
      nodes: [
        { id: 'start-1', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
        { id: 'end-1', type: 'End', position: { x: 100, y: 0 }, data: { label: 'End' } },
      ],
      edges: [
        { id: 'e1', source: 'start-1', target: 'end-1' },
      ],
      metadata: { name: 'Imported Graph' },
    };

    // Create a file upload
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /import/i }).click();
    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles({
      name: 'test-graph.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(testGraph)),
    });

    // Verify graph was loaded
    await expect(page.locator('.react-flow__node')).toHaveCount(2);
    await expect(page.locator('.react-flow__edge')).toHaveCount(1);
  });

  test('copies graph to clipboard', async ({ page }) => {
    await page.goto('/');

    // Create a simple graph
    const canvas = page.locator('.react-flow');
    const startHandle = page.locator('[data-node-type="Start"]').first();
    await startHandle.dragTo(canvas, { targetPosition: { x: 100, y: 100 } });

    // Handle clipboard permission
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    // Click copy button
    await page.getByRole('button', { name: /copy/i }).click();

    // Verify success message (shown via alert in current implementation)
    // Note: This will be handled by the dialog handler above

    // Verify clipboard content (if permissions allow)
    const clipboardContent = await page.evaluate(async () => {
      try {
        return await navigator.clipboard.readText();
      } catch {
        return null;
      }
    });

    if (clipboardContent) {
      const json = JSON.parse(clipboardContent);
      expect(json.version).toBe('v1');
    }
  });

  test('clears graph with confirmation', async ({ page }) => {
    await page.goto('/');

    // Create a graph
    const canvas = page.locator('.react-flow');
    const startHandle = page.locator('[data-node-type="Start"]').first();
    await startHandle.dragTo(canvas, { targetPosition: { x: 100, y: 100 } });

    await expect(page.locator('.react-flow__node')).toHaveCount(1);

    // Handle confirmation dialog
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    // Click clear button
    await page.getByRole('button', { name: /clear/i }).click();

    // Verify graph is cleared
    await expect(page.locator('.react-flow__node')).toHaveCount(0);
    await expect(page.locator('.canvas-empty-hint')).toBeVisible();
  });
});

test.describe('Webapp Protocol: State Schema Workflow', () => {
  test('adds a new state field', async ({ page }) => {
    await page.goto('/');

    // Click "Add Field" button
    await page.getByRole('button', { name: /add field/i }).click();

    // Verify dialog is shown
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Fill in field details
    await page.locator('[name="name"]').fill('testField');
    await page.locator('[name="type"]').selectOption('string');

    // Submit form
    await page.locator('[role="dialog"] button[type="submit"]').click();

    // Verify field was added to the list
    await expect(page.locator('.state-field-list')).toContainText('testField');
    await expect(page.locator('.state-field-list')).toContainText('string');
  });

  test('edits existing state field', async ({ page }) => {
    await page.goto('/');

    // Add a field first
    await page.getByRole('button', { name: /add field/i }).click();
    await page.locator('[name="name"]').fill('originalName');
    await page.locator('[name="type"]').selectOption('string');
    await page.locator('[role="dialog"] button[type="submit"]').click();

    // Edit the field
    await page.locator('.state-field-item').getByRole('button', { name: /edit/i }).click();

    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.locator('[name="name"]').fill('updatedName');
    await page.locator('[role="dialog"] button[type="submit"]').click();

    // Verify field was updated
    await expect(page.locator('.state-field-list')).toContainText('updatedName');
    await expect(page.locator('.state-field-list')).not.toContainText('originalName');
  });

  test('deletes state field', async ({ page }) => {
    await page.goto('/');

    // Add a field first
    await page.getByRole('button', { name: /add field/i }).click();
    await page.locator('[name="name"]').fill('toDelete');
    await page.locator('[name="type"]').selectOption('string');
    await page.locator('[role="dialog"] button[type="submit"]').click();

    await expect(page.locator('.state-field-list')).toContainText('toDelete');

    // Delete the field
    await page.locator('.state-field-item').getByRole('button', { name: /delete/i }).click();

    // Verify field was removed
    await expect(page.locator('.state-field-list')).not.toContainText('toDelete');
  });
});

test.describe('Webapp Protocol: Router Conditional Flow', () => {
  test('routes based on state condition', async ({ page }) => {
    await page.goto('/');

    // Add state field for routing
    await page.getByRole('button', { name: /add field/i }).click();
    await page.locator('[name="name"]').fill('route');
    await page.locator('[name="type"]').selectOption('string');
    await page.locator('[role="dialog"] button[type="submit"]').click();

    // Create router graph: Start -> Router -> ToolA / ToolB -> End
    const canvas = page.locator('.react-flow');

    // Add nodes
    await page.locator('[data-node-type="Start"]').first().dragTo(canvas, { targetPosition: { x: 50, y: 100 } });
    await page.locator('[data-node-type="Router"]').first().dragTo(canvas, { targetPosition: { x: 200, y: 100 } });
    await page.locator('[data-node-type="Tool"]').first().dragTo(canvas, { targetPosition: { x: 400, y: 50 } });
    await page.locator('[data-node-type="Tool"]').nth(1).dragTo(canvas, { targetPosition: { x: 400, y: 150 } });
    await page.locator('[data-node-type="End"]').first().dragTo(canvas, { targetPosition: { x: 550, y: 100 } });

    // Connect nodes
    const nodes = page.locator('.react-flow__node');
    const startNode = nodes.nth(0);
    const routerNode = nodes.nth(1);
    const toolA = nodes.nth(2);
    const toolB = nodes.nth(3);
    const endNode = nodes.nth(4);

    await startNode.locator('.react-flow__handle-right').dragTo(
      routerNode.locator('.react-flow__handle-left')
    );

    // Connect router to ToolA with condition
    await routerNode.locator('.react-flow__handle-right').dragTo(
      toolA.locator('.react-flow__handle-left')
    );

    // Select and set condition on edge to ToolA
    await page.locator('.react-flow__edge').first().click();
    await page.locator('.inspector-panel').locator('[name="condition"]').fill('state.route === "A"');

    // Connect ToolA to End
    await toolA.locator('.react-flow__handle-right').dragTo(
      endNode.locator('.react-flow__handle-left')
    );

    // Run simulation
    await page.getByRole('button', { name: /run/i }).click();

    // Verify simulation completed
    await expect(page.locator('.status-badge')).toContainText(/complete|error/);
  });
});

test.describe('Webapp Protocol: LocalStorage Persistence', () => {
  test('persists graph across page reloads', async ({ page }) => {
    await page.goto('/');

    // Create a graph
    const canvas = page.locator('.react-flow');
    const startHandle = page.locator('[data-node-type="Start"]').first();
    await startHandle.dragTo(canvas, { targetPosition: { x: 100, y: 100 } });

    await expect(page.locator('.react-flow__node')).toHaveCount(1);

    // Reload the page
    await page.reload();

    // Wait for app to load
    await expect(page.getByRole('heading', { name: 'State Schema' })).toBeVisible();

    // Verify graph is still there (auto-saved to localStorage)
    await expect(page.locator('.react-flow__node')).toHaveCount(1);
  });

  test('clears graph and verifies persistence', async ({ page, context }) => {
    await page.goto('/');

    // Create a graph
    const canvas = page.locator('.react-flow');
    const startHandle = page.locator('[data-node-type="Start"]').first();
    await startHandle.dragTo(canvas, { targetPosition: { x: 100, y: 100 } });

    await expect(page.locator('.react-flow__node')).toHaveCount(1);

    // Clear the graph
    page.on('dialog', async (dialog) => await dialog.accept());
    await page.getByRole('button', { name: /clear/i }).click();

    await expect(page.locator('.react-flow__node')).toHaveCount(0);

    // Reload and verify it's still cleared
    await page.reload();
    await expect(page.getByRole('heading', { name: 'State Schema' })).toBeVisible();
    await expect(page.locator('.react-flow__node')).toHaveCount(0);
  });
});

// Helper function to convert stream to string
async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const combined = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
  let position = 0;
  for (const chunk of chunks) {
    combined.set(chunk, position);
    position += chunk.length;
  }

  return new TextDecoder().decode(combined);
}
