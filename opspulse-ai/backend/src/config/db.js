import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase Client if credentials are provided
export let supabaseClient = null;
if (config.supabaseUrl && config.supabaseKey && config.supabaseUrl !== 'https://your-project.supabase.co') {
  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);
    console.log('⚡ Connected to Supabase Cloud Database:', config.supabaseUrl);
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err.message);
  }
}

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dataFilePath = path.join(dbDir, 'db_store.json');

const defaultSuppliers = [
  { id: 'sup-1', name: 'Apex Electronics Logistics', sku: 'SKU-102', contact_email: 'orders@apexelectronics.com', lead_time_days: 3, unit_price: 45.0, rating: 4.8, minimum_order_qty: 50 },
  { id: 'sup-2', name: 'Global Tech Components Ltd', sku: 'SKU-102', contact_email: 'sales@globaltechcomp.com', lead_time_days: 7, unit_price: 41.5, rating: 4.2, minimum_order_qty: 100 },
  { id: 'sup-3', name: 'FastTrack Hardware Inc', sku: 'SKU-104', contact_email: 'supply@fasttrackhw.com', lead_time_days: 2, unit_price: 18.5, rating: 4.9, minimum_order_qty: 25 },
  { id: 'sup-4', name: 'Vanguard Industrial Supply', sku: 'SKU-205', contact_email: 'fulfillment@vanguardind.com', lead_time_days: 5, unit_price: 85.0, rating: 4.6, minimum_order_qty: 10 }
];

const defaultInventory = [
  { id: 'inv-1', sku: 'SKU-102', name: 'Wireless Ergonomic Keyboard', category: 'Peripherals', stock_level: 14, reorder_point: 40, target_stock: 150, unit_cost: 45.0, status: 'CRITICAL', updated_at: new Date().toISOString() },
  { id: 'inv-2', sku: 'SKU-104', name: 'USB-C Fast Charging Hub (7-in-1)', category: 'Accessories', stock_level: 28, reorder_point: 50, target_stock: 200, unit_cost: 18.5, status: 'LOW', updated_at: new Date().toISOString() },
  { id: 'inv-3', sku: 'SKU-205', name: 'Ultra-Wide 34" Monitor Arm', category: 'Furniture', stock_level: 8, reorder_point: 15, target_stock: 60, unit_cost: 85.0, status: 'CRITICAL', updated_at: new Date().toISOString() },
  { id: 'inv-4', sku: 'SKU-309', name: 'Noise-Canceling Bluetooth Headset', category: 'Audio', stock_level: 110, reorder_point: 30, target_stock: 120, unit_cost: 62.0, status: 'HEALTHY', updated_at: new Date().toISOString() },
  { id: 'inv-5', sku: 'SKU-412', name: 'Mechanical RGB Gaming Key switches (100pk)', category: 'Components', stock_level: 95, reorder_point: 25, target_stock: 100, unit_cost: 29.0, status: 'HEALTHY', updated_at: new Date().toISOString() }
];

const defaultPurchaseOrders = [
  { id: 'po-demo-1', po_number: 'PO-2026-8492', sku: 'SKU-102', item_name: 'Wireless Ergonomic Keyboard', supplier_name: 'Apex Electronics Logistics', quantity: 136, total_cost: 6120.00, status: 'GENERATED', created_at: new Date(Date.now() - 3600000).toISOString(), notes: 'Lead time: 3 days. Terms: Net 30' }
];

const initialStore = {
  users: [],
  inventory: defaultInventory,
  suppliers: defaultSuppliers,
  purchase_orders: defaultPurchaseOrders,
  agent_logs: []
};

let store = { ...initialStore };

function ensureDefaults() {
  if (!store.inventory || store.inventory.length === 0) store.inventory = [...defaultInventory];
  if (!store.suppliers || store.suppliers.length === 0) store.suppliers = [...defaultSuppliers];
  if (!store.purchase_orders || store.purchase_orders.length === 0) store.purchase_orders = [...defaultPurchaseOrders];
}

function loadStore() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      store = { ...initialStore, ...JSON.parse(data) };
    }
  } catch (err) {
    store = { ...initialStore };
  }
  ensureDefaults();
}

function saveStore() {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write local database store:', err.message);
  }
}

loadStore();

export const memoryStore = store;

/**
 * Unified database driver supporting Supabase Cloud PostgreSQL and local persistence
 */
export const db = {
  prepare(query) {
    const q = query.trim().toUpperCase();

    return {
      get(...args) {
        loadStore();
        if (q.includes('FROM USERS WHERE EMAIL =')) {
          return store.users.find(u => u.email === args[0]);
        }
        if (q.includes('FROM INVENTORY WHERE SKU =')) {
          return store.inventory.find(i => i.sku === args[0]);
        }
        if (q.includes('FROM INVENTORY WHERE STOCK_LEVEL <= REORDER_POINT')) {
          return store.inventory.find(i => i.stock_level <= i.reorder_point);
        }
        if (q.includes('FROM INVENTORY LIMIT 1')) {
          return store.inventory[0];
        }
        if (q.includes('COUNT(*) AS COUNT FROM INVENTORY')) {
          return { count: store.inventory.length };
        }
        if (q.includes('COUNT(*) AS COUNT FROM SUPPLIERS')) {
          return { count: store.suppliers.length };
        }
        if (q.includes('FROM AGENT_LOGS ORDER BY ID DESC LIMIT 1')) {
          return store.agent_logs[store.agent_logs.length - 1] || null;
        }
        return null;
      },

      all(...args) {
        loadStore();
        if (q.includes('FROM INVENTORY')) {
          if (q.includes('WHERE STOCK_LEVEL <= REORDER_POINT')) {
            return store.inventory.filter(i => i.stock_level <= i.reorder_point);
          }
          return [...store.inventory].sort((a, b) => a.stock_level - b.stock_level);
        }
        if (q.includes('FROM SUPPLIERS')) {
          if (q.includes('WHERE SKU =')) {
            return store.suppliers.filter(s => s.sku === args[0]);
          }
          return store.suppliers;
        }
        if (q.includes('FROM PURCHASE_ORDERS')) {
          return [...store.purchase_orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        if (q.includes('FROM AGENT_LOGS')) {
          if (q.includes('WHERE RUN_ID =')) {
            return store.agent_logs.filter(l => l.run_id === args[0]);
          }
          return [...store.agent_logs].slice(-50).reverse();
        }
        return [];
      },

      run(...args) {
        loadStore();
        if (q.includes('INSERT INTO USERS')) {
          const newUser = { id: args[0], email: args[1], password_hash: args[2], name: args[3], role: args[4], created_at: args[5] };
          store.users.push(newUser);
          if (supabaseClient) {
            supabaseClient.from('users').insert(newUser).then(({ error }) => { if (error) console.warn('Supabase insert users warning:', error.message); });
          }
        } else if (q.includes('INSERT INTO INVENTORY')) {
          const item = { id: args[0], sku: args[1], name: args[2], category: args[3], stock_level: args[4], reorder_point: args[5], target_stock: args[6], unit_cost: args[7], status: args[8], updated_at: args[9] };
          store.inventory.push(item);
          if (supabaseClient) {
            supabaseClient.from('inventory').insert(item).then(({ error }) => { if (error) console.warn('Supabase insert inventory warning:', error.message); });
          }
        } else if (q.includes('INSERT INTO SUPPLIERS')) {
          const sup = { id: args[0], name: args[1], sku: args[2], contact_email: args[3], lead_time_days: args[4], unit_price: args[5], rating: args[6], minimum_order_qty: args[7] };
          store.suppliers.push(sup);
          if (supabaseClient) {
            supabaseClient.from('suppliers').insert(sup).then(({ error }) => { if (error) console.warn('Supabase insert suppliers warning:', error.message); });
          }
        } else if (q.includes('INSERT INTO PURCHASE_ORDERS')) {
          const po = { id: args[0], po_number: args[1], sku: args[2], item_name: args[3], supplier_name: args[4], quantity: args[5], total_cost: args[6], status: args[7], created_at: args[8], notes: args[9] };
          store.purchase_orders.push(po);
          if (supabaseClient) {
            supabaseClient.from('purchase_orders').insert(po).then(({ error }) => { if (error) console.warn('Supabase insert purchase_orders warning:', error.message); });
          }
        } else if (q.includes('INSERT INTO AGENT_LOGS')) {
          const log = { run_id: args[0], agent_name: args[1], step: args[2], status: args[3], thought: args[4], action: args[5], output: args[6], timestamp: args[7] };
          store.agent_logs.push({ id: store.agent_logs.length + 1, ...log });
          if (supabaseClient) {
            supabaseClient.from('agent_logs').insert(log).then(({ error }) => { if (error) console.warn('Supabase insert agent_logs warning:', error.message); });
          }
        } else if (q.includes('UPDATE INVENTORY SET STATUS =')) {
          const item = store.inventory.find(i => i.id === args[1] || i.sku === args[1]);
          if (item) item.status = args[0];
          if (supabaseClient) {
            supabaseClient.from('inventory').update({ status: args[0] }).or(`id.eq.${args[1]},sku.eq.${args[1]}`).then(({ error }) => { if (error) console.warn('Supabase update inventory warning:', error.message); });
          }
        } else if (q.includes('UPDATE INVENTORY SET STOCK_LEVEL =')) {
          const item = store.inventory.find(i => i.id === args[2] || i.sku === args[2] || i.id === args[1] || i.sku === args[1]);
          if (item) {
            item.stock_level = Number(args[0]);
            item.status = args[1];
          }
          if (supabaseClient) {
            supabaseClient.from('inventory').update({ stock_level: Number(args[0]), status: args[1] }).or(`id.eq.${args[2]},sku.eq.${args[2]}`).then(({ error }) => { if (error) console.warn('Supabase update inventory stock warning:', error.message); });
          }
        } else if (q.includes('DELETE FROM INVENTORY')) {
          store.inventory = [];
        } else if (q.includes('DELETE FROM SUPPLIERS')) {
          store.suppliers = [];
        } else if (q.includes('DELETE FROM PURCHASE_ORDERS')) {
          store.purchase_orders = [];
        } else if (q.includes('DELETE FROM AGENT_LOGS')) {
          store.agent_logs = [];
        }
        saveStore();
        return { changes: 1 };
      }
    };
  }
};

// Seed initial demo data
export function seedInitialData() {
  loadStore();

  const defaultSuppliers = [
    { id: 'sup-1', name: 'Apex Electronics Logistics', sku: 'SKU-102', contact_email: 'orders@apexelectronics.com', lead_time_days: 3, unit_price: 45.0, rating: 4.8, minimum_order_qty: 50 },
    { id: 'sup-2', name: 'Global Tech Components Ltd', sku: 'SKU-102', contact_email: 'sales@globaltechcomp.com', lead_time_days: 7, unit_price: 41.5, rating: 4.2, minimum_order_qty: 100 },
    { id: 'sup-3', name: 'FastTrack Hardware Inc', sku: 'SKU-104', contact_email: 'supply@fasttrackhw.com', lead_time_days: 2, unit_price: 18.5, rating: 4.9, minimum_order_qty: 25 },
    { id: 'sup-4', name: 'Vanguard Industrial Supply', sku: 'SKU-205', contact_email: 'fulfillment@vanguardind.com', lead_time_days: 5, unit_price: 85.0, rating: 4.6, minimum_order_qty: 10 }
  ];

  const defaultInventory = [
    { id: 'inv-1', sku: 'SKU-102', name: 'Wireless Ergonomic Keyboard', category: 'Peripherals', stock_level: 14, reorder_point: 40, target_stock: 150, unit_cost: 45.0, status: 'CRITICAL', updated_at: new Date().toISOString() },
    { id: 'inv-2', sku: 'SKU-104', name: 'USB-C Fast Charging Hub (7-in-1)', category: 'Accessories', stock_level: 28, reorder_point: 50, target_stock: 200, unit_cost: 18.5, status: 'LOW', updated_at: new Date().toISOString() },
    { id: 'inv-3', sku: 'SKU-205', name: 'Ultra-Wide 34" Monitor Arm', category: 'Furniture', stock_level: 8, reorder_point: 15, target_stock: 60, unit_cost: 85.0, status: 'CRITICAL', updated_at: new Date().toISOString() },
    { id: 'inv-4', sku: 'SKU-309', name: 'Noise-Canceling Bluetooth Headset', category: 'Audio', stock_level: 110, reorder_point: 30, target_stock: 120, unit_cost: 62.0, status: 'HEALTHY', updated_at: new Date().toISOString() },
    { id: 'inv-5', sku: 'SKU-412', name: 'Mechanical RGB Gaming Key switches (100pk)', category: 'Components', stock_level: 95, reorder_point: 25, target_stock: 100, unit_cost: 29.0, status: 'HEALTHY', updated_at: new Date().toISOString() }
  ];

  if (store.inventory.length === 0) store.inventory = defaultInventory;
  if (store.suppliers.length === 0) store.suppliers = defaultSuppliers;
  saveStore();
}
