import express from 'express';
import { db, memoryStore, seedInitialData } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get inventory items
router.get('/inventory', authenticateToken, (req, res) => {
  try {
    let items = [];
    if (db) {
      items = db.prepare('SELECT * FROM inventory ORDER BY stock_level ASC').all();
    } else {
      items = [...memoryStore.inventory].sort((a, b) => a.stock_level - b.stock_level);
    }
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get low stock alerts specifically
router.get('/inventory/low-stock', authenticateToken, (req, res) => {
  try {
    let items = [];
    if (db) {
      items = db.prepare('SELECT * FROM inventory WHERE stock_level <= reorder_point ORDER BY stock_level ASC').all();
    } else {
      items = memoryStore.inventory.filter(i => i.stock_level <= i.reorder_point);
    }
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get suppliers
router.get('/suppliers', authenticateToken, (req, res) => {
  try {
    let suppliers = [];
    if (db) {
      suppliers = db.prepare('SELECT * FROM suppliers').all();
    } else {
      suppliers = memoryStore.suppliers;
    }
    res.json({ success: true, suppliers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get purchase orders
router.get('/purchase-orders', authenticateToken, (req, res) => {
  try {
    let purchaseOrders = [];
    if (db) {
      purchaseOrders = db.prepare('SELECT * FROM purchase_orders ORDER BY created_at DESC').all();
    } else {
      purchaseOrders = [...memoryStore.purchase_orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    res.json({ success: true, purchaseOrders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fulfill/Receive stock for a reordered SKU
router.post('/inventory/fulfill', authenticateToken, (req, res) => {
  try {
    const { sku, id } = req.body;
    let item = null;

    if (db) {
      if (sku) item = db.prepare('SELECT * FROM inventory WHERE sku = ?').get(sku);
      if (!item && id) item = db.prepare('SELECT * FROM inventory WHERE id = ?').get(id);
    } else {
      item = memoryStore.inventory.find(i => (sku && i.sku === sku) || (id && i.id === id));
    }

    if (!item) {
      return res.status(404).json({ success: false, error: 'Inventory item not found' });
    }

    const newStock = item.target_stock || (item.stock_level + 100);
    const newStatus = 'HEALTHY';

    if (db) {
      db.prepare('UPDATE inventory SET stock_level = ?, status = ? WHERE sku = ?').run(newStock, newStatus, item.sku);
      // Update PO status to DELIVERED
      const latestPo = db.prepare('SELECT * FROM purchase_orders WHERE sku = ? ORDER BY created_at DESC LIMIT 1').get(item.sku);
      if (latestPo) {
        db.prepare('UPDATE purchase_orders SET status = ? WHERE id = ?').run('DELIVERED', latestPo.id);
      }
    } else {
      item.stock_level = newStock;
      item.status = newStatus;
      const latestPo = [...memoryStore.purchase_orders].reverse().find(po => po.sku === item.sku);
      if (latestPo) {
        latestPo.status = 'DELIVERED';
      }
    }

    res.json({
      success: true,
      message: `Shipment received for ${item.name} (${item.sku}). Stock replenished to ${newStock} units.`,
      item: { ...item, stock_level: newStock, status: newStatus }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset demo data
router.post('/inventory/reset', authenticateToken, (req, res) => {
  try {
    if (db) {
      db.prepare('DELETE FROM inventory').run();
      db.prepare('DELETE FROM suppliers').run();
      db.prepare('DELETE FROM purchase_orders').run();
      db.prepare('DELETE FROM agent_logs').run();
    } else {
      memoryStore.inventory = [];
      memoryStore.suppliers = [];
      memoryStore.purchase_orders = [];
      memoryStore.agent_logs = [];
    }
    seedInitialData();
    res.json({ success: true, message: 'Demo data re-seeded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
