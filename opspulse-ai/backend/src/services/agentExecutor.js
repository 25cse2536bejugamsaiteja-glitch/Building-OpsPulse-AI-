import { db, memoryStore } from '../config/db.js';
import { generateAgentPlan } from './gemini.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Helper to write log into DB or Memory store
 */
function logAgentStep({ runId, agentName, step, status, thought, action, output }) {
  const timestamp = new Date().toISOString();
  const outputStr = typeof output === 'object' ? JSON.stringify(output) : output;

  if (db) {
    const stmt = db.prepare(`
      INSERT INTO agent_logs (run_id, agent_name, step, status, thought, action, output, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(runId, agentName, step, status, thought, action, outputStr, timestamp);
  } else {
    memoryStore.agent_logs.push({
      id: memoryStore.agent_logs.length + 1,
      run_id: runId,
      agent_name: agentName,
      step,
      status,
      thought,
      action,
      output: outputStr,
      timestamp
    });
  }

  return { runId, agentName, step, status, thought, action, output: outputStr, timestamp };
}

/**
 * Main Autonomous Agent Loop Execution
 */
export async function runAgentWorkflow({ trigger, sku }) {
  const runId = `RUN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const agentName = 'OpsPulse-SupplyChain-Agent';

  // 1. Fetch target SKU from DB or memory
  let item = null;
  let suppliers = [];

  if (db) {
    if (sku) {
      item = db.prepare('SELECT * FROM inventory WHERE sku = ?').get(sku);
    }
    if (!item) {
      item = db.prepare('SELECT * FROM inventory WHERE stock_level <= reorder_point LIMIT 1').get();
    }
    if (!item) {
      item = db.prepare('SELECT * FROM inventory LIMIT 1').get();
    }

    suppliers = db.prepare('SELECT * FROM suppliers WHERE sku = ?').all(item ? item.sku : 'SKU-102');
    if (suppliers.length === 0) {
      suppliers = db.prepare('SELECT * FROM suppliers LIMIT 3').all();
    }
  } else {
    item = memoryStore.inventory.find(i => i.sku === sku) || memoryStore.inventory[0];
    suppliers = memoryStore.suppliers.filter(s => s.sku === (item ? item.sku : 'SKU-102'));
    if (suppliers.length === 0) suppliers = memoryStore.suppliers.slice(0, 3);
  }

  if (!item) {
    item = { id: 'inv-1', sku: sku || 'SKU-102', name: 'Wireless Ergonomic Keyboard', category: 'Peripherals', stock_level: 14, reorder_point: 40, target_stock: 150, unit_cost: 45.0, status: 'CRITICAL' };
  }
  if (!suppliers || suppliers.length === 0) {
    suppliers = [
      { id: 'sup-1', name: 'Apex Electronics Logistics', sku: item.sku, contact_email: 'orders@apexelectronics.com', lead_time_days: 3, unit_price: 45.0, rating: 4.8, minimum_order_qty: 50 },
      { id: 'sup-2', name: 'Global Tech Components Ltd', sku: item.sku, contact_email: 'sales@globaltechcomp.com', lead_time_days: 7, unit_price: 41.5, rating: 4.2, minimum_order_qty: 100 }
    ];
  }

  // STEP 1: ANALYZE_STOCK
  logAgentStep({
    runId,
    agentName,
    step: 'ANALYZE_STOCK',
    status: 'IN_PROGRESS',
    thought: `Evaluating inventory telemetry for ${item.name} (${item.sku}). Current stock: ${item.stock_level}, Reorder Point: ${item.reorder_point}.`,
    action: 'query_inventory_db',
    output: { sku: item.sku, stock_level: item.stock_level, target_stock: item.target_stock }
  });

  // Call Gemini for structured AI planning
  const aiPlan = await generateAgentPlan(trigger || `Low stock alert for ${item.sku}`, item, suppliers);

  logAgentStep({
    runId,
    agentName,
    step: 'ANALYZE_STOCK',
    status: 'COMPLETED',
    thought: aiPlan.stockAnalysis.rationale,
    action: 'calculate_reorder_deficit',
    output: aiPlan.stockAnalysis
  });

  // STEP 2: EVALUATE_SUPPLIERS
  logAgentStep({
    runId,
    agentName,
    step: 'EVALUATE_SUPPLIERS',
    status: 'IN_PROGRESS',
    thought: `Scanning ${suppliers.length} vendor options for lead times, unit costs, and SLA ratings.`,
    action: 'fetch_vendor_matrix',
    output: suppliers
  });

  logAgentStep({
    runId,
    agentName,
    step: 'EVALUATE_SUPPLIERS',
    status: 'COMPLETED',
    thought: `Selected primary supplier ${aiPlan.purchaseOrderDraft.recommendedSupplier} based on speed and cost optimization.`,
    action: 'score_vendors',
    output: aiPlan.supplierEvaluation
  });

  // STEP 3: DRAFT_PURCHASE_ORDER
  const poId = `po-${Date.now()}`;
  const poNumber = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  logAgentStep({
    runId,
    agentName,
    step: 'DRAFT_PURCHASE_ORDER',
    status: 'IN_PROGRESS',
    thought: `Formulating legal Purchase Order #${poNumber} for ${aiPlan.purchaseOrderDraft.quantity} units of ${item.name}.`,
    action: 'construct_po_payload',
    output: { poNumber, supplier: aiPlan.purchaseOrderDraft.recommendedSupplier, quantity: aiPlan.purchaseOrderDraft.quantity }
  });

  const poRecord = {
    id: poId,
    po_number: poNumber,
    sku: item.sku,
    item_name: item.name,
    supplier_name: aiPlan.purchaseOrderDraft.recommendedSupplier,
    quantity: aiPlan.purchaseOrderDraft.quantity,
    total_cost: aiPlan.purchaseOrderDraft.estimatedTotalCost,
    status: 'GENERATED',
    created_at: new Date().toISOString(),
    notes: `Lead time: ${aiPlan.purchaseOrderDraft.leadTimeDays} days. Terms: ${aiPlan.purchaseOrderDraft.paymentTerms}`
  };

  if (db) {
    db.prepare(`
      INSERT INTO purchase_orders (id, po_number, sku, item_name, supplier_name, quantity, total_cost, status, created_at, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(poRecord.id, poRecord.po_number, poRecord.sku, poRecord.item_name, poRecord.supplier_name, poRecord.quantity, poRecord.total_cost, poRecord.status, poRecord.created_at, poRecord.notes);

    // Update inventory status to 'REORDERING'
    db.prepare('UPDATE inventory SET status = ? WHERE id = ?').run('REORDERING', item.id);
  } else {
    memoryStore.purchase_orders.push(poRecord);
    item.status = 'REORDERING';
  }

  logAgentStep({
    runId,
    agentName,
    step: 'DRAFT_PURCHASE_ORDER',
    status: 'COMPLETED',
    thought: `Purchase Order ${poNumber} created and saved to database with TOTAL value of $${aiPlan.purchaseOrderDraft.estimatedTotalCost.toFixed(2)}.`,
    action: 'save_po_db',
    output: poRecord
  });

  // STEP 4: SIMULATE_OUTREACH
  logAgentStep({
    runId,
    agentName,
    step: 'SIMULATE_OUTREACH',
    status: 'IN_PROGRESS',
    thought: `Transmitting digital procurement dispatch email to supplier API endpoint.`,
    action: 'send_supplier_email',
    output: { recipient: aiPlan.purchaseOrderDraft.recommendedSupplier, message: aiPlan.purchaseOrderDraft.outreachMessage }
  });

  logAgentStep({
    runId,
    agentName,
    step: 'SIMULATE_OUTREACH',
    status: 'COMPLETED',
    thought: `Supplier outreach completed successfully. PO status updated to DISPATCHED.`,
    action: 'confirm_dispatch',
    output: { dispatchStatus: 'SUCCESS', poNumber, confirmationCode: `CONF-${Math.floor(100000 + Math.random() * 900000)}` }
  });

  return {
    runId,
    po: poRecord,
    analysis: aiPlan
  };
}
