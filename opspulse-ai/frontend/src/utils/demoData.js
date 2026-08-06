export const DEFAULT_DEMO_INVENTORY = [
  {
    id: 'inv-1',
    sku: 'SKU-102',
    name: 'Wireless Ergonomic Keyboard',
    category: 'Peripherals',
    stock_level: 14,
    reorder_point: 40,
    target_stock: 150,
    unit_cost: 45.0,
    status: 'CRITICAL',
    updated_at: new Date().toISOString()
  },
  {
    id: 'inv-2',
    sku: 'SKU-104',
    name: 'USB-C Fast Charging Hub (7-in-1)',
    category: 'Accessories',
    stock_level: 28,
    reorder_point: 50,
    target_stock: 200,
    unit_cost: 18.5,
    status: 'LOW',
    updated_at: new Date().toISOString()
  },
  {
    id: 'inv-3',
    sku: 'SKU-205',
    name: 'Ultra-Wide 34" Monitor Arm',
    category: 'Furniture',
    stock_level: 8,
    reorder_point: 15,
    target_stock: 60,
    unit_cost: 85.0,
    status: 'CRITICAL',
    updated_at: new Date().toISOString()
  },
  {
    id: 'inv-4',
    sku: 'SKU-309',
    name: 'Noise-Canceling Bluetooth Headset',
    category: 'Audio',
    stock_level: 110,
    reorder_point: 30,
    target_stock: 120,
    unit_cost: 62.0,
    status: 'HEALTHY',
    updated_at: new Date().toISOString()
  },
  {
    id: 'inv-5',
    sku: 'SKU-412',
    name: 'Mechanical RGB Gaming Key switches (100pk)',
    category: 'Components',
    stock_level: 95,
    reorder_point: 25,
    target_stock: 100,
    unit_cost: 29.0,
    status: 'HEALTHY',
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_DEMO_SUPPLIERS = [
  {
    id: 'sup-1',
    name: 'Apex Electronics Logistics',
    sku: 'SKU-102',
    contact_email: 'orders@apexelectronics.com',
    lead_time_days: 3,
    unit_price: 45.0,
    rating: 4.8,
    minimum_order_qty: 50
  },
  {
    id: 'sup-2',
    name: 'Global Tech Components Ltd',
    sku: 'SKU-102',
    contact_email: 'sales@globaltechcomp.com',
    lead_time_days: 7,
    unit_price: 41.5,
    rating: 4.2,
    minimum_order_qty: 100
  },
  {
    id: 'sup-3',
    name: 'FastTrack Hardware Inc',
    sku: 'SKU-104',
    contact_email: 'supply@fasttrackhw.com',
    lead_time_days: 2,
    unit_price: 18.5,
    rating: 4.9,
    minimum_order_qty: 25
  },
  {
    id: 'sup-4',
    name: 'Vanguard Industrial Supply',
    sku: 'SKU-205',
    contact_email: 'fulfillment@vanguardind.com',
    lead_time_days: 5,
    unit_price: 85.0,
    rating: 4.6,
    minimum_order_qty: 10
  }
];

export const DEFAULT_DEMO_POS = [
  {
    id: 'po-demo-1',
    po_number: 'PO-2026-8492',
    sku: 'SKU-102',
    item_name: 'Wireless Ergonomic Keyboard',
    supplier_name: 'Apex Electronics Logistics',
    quantity: 136,
    total_cost: 6120.00,
    status: 'GENERATED',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    notes: 'Lead time: 3 days. Terms: Net 30'
  },
  {
    id: 'po-demo-2',
    po_number: 'PO-2026-3104',
    sku: 'SKU-104',
    item_name: 'USB-C Fast Charging Hub (7-in-1)',
    supplier_name: 'FastTrack Hardware Inc',
    quantity: 172,
    total_cost: 3182.00,
    status: 'GENERATED',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    notes: 'Lead time: 2 days. Terms: Net 30'
  }
];
