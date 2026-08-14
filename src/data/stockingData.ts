import type { StockingAssetTag, StockingRecord, UnitOfMeasure } from '@/types';

// Deterministic sample data — see note in alterationData.ts.

const ITEMS: { desc: string; cw: StockingAssetTag; uom: UnitOfMeasure; unit: number; cost: number; ear: number }[] = [
  { desc: 'Air Brake Hose Coupling', cw: 'Wagon', uom: 'Nos', unit: 25, cost: 340, ear: 2 },
  { desc: 'CBC Coupler Knuckle', cw: 'Wagon', uom: 'Nos', unit: 12, cost: 8250, ear: 1 },
  { desc: 'Roller Bearing Assembly', cw: 'Wagon', uom: 'Set', unit: 40, cost: 4120, ear: 4 },
  { desc: 'Bio-Toilet Control Panel', cw: 'Coach', uom: 'Nos', unit: 8, cost: 15600, ear: 1 },
  { desc: 'LED Interior Light Fitting', cw: 'Coach', uom: 'Nos', unit: 150, cost: 480, ear: 6 },
  { desc: 'Window Safety Glass Pane', cw: 'Coach', uom: 'Nos', unit: 60, cost: 2150, ear: 2 },
  { desc: 'Buffer Casting', cw: 'Wagon', uom: 'Nos', unit: 20, cost: 6400, ear: 2 },
  { desc: 'Brake Cylinder', cw: 'Wagon', uom: 'Nos', unit: 30, cost: 3850, ear: 1 },
  { desc: 'Battery Charger Unit', cw: 'Coach', uom: 'Nos', unit: 10, cost: 21500, ear: 1 },
  { desc: 'FRP Flooring Sheet', cw: 'Coach', uom: 'Sq. Metres', unit: 45, cost: 1275, ear: 3 },
  { desc: 'Door Locking Mechanism', cw: 'Coach', uom: 'Nos', unit: 55, cost: 960, ear: 2 },
  { desc: 'Axle Box Housing', cw: 'Wagon', uom: 'Nos', unit: 18, cost: 9800, ear: 2 },
  { desc: 'CCTV Camera Module', cw: 'Coach', uom: 'Nos', unit: 32, cost: 5400, ear: 1 },
  { desc: 'USB Charging Socket', cw: 'Coach', uom: 'Nos', unit: 200, cost: 210, ear: 4 },
  { desc: 'Underframe Reinforcement Plate', cw: 'Wagon', uom: 'Kg', unit: 15, cost: 7300, ear: 3 },
];

const OFFICERS = ['Stores Depot', 'CDO/Workshop', 'Sr. DME/Stores', 'Design Office', 'Inspection Wing', '—'];

const QFORMS = ['Q-101', 'Q-102', 'Q-103', 'Q-104', 'Q-105'];
const YW_CODES = ['YW-24A', 'YW-24B', 'YW-25A', 'YW-25B', 'YW-26A'];

function isoDate(daysAgo: number): string {
  const d = new Date('2026-08-13T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function buildStocking(count: number): StockingRecord[] {
  return Array.from({ length: count }, (_, i) => {
    const item = ITEMS[i % ITEMS.length];
    const daysAgo = 5 + ((i * 11) % 400);
    const year = new Date(isoDate(daysAgo)).getUTCFullYear();
    const unit = item.unit + (i % 4) * 5;
    const cost = item.cost;
    const pending = i % 3 === 0 ? OFFICERS[i % OFFICERS.length] : '—';

    return {
      id: `stk-${i + 1}`,
      sNo: i + 1,
      dateReceived: isoDate(daysAgo),
      year,
      cw: item.cw,
      yw: YW_CODES[i % YW_CODES.length],
      qForm: QFORMS[i % QFORMS.length],
      itemDescription: item.desc,
      plNo: `PL-${2000 + i * 3}`,
      ear: item.ear,
      unit,
      unitOfMeasure: item.uom,
      costPerItem: cost,
      totalValue: unit * cost,
      pendingWith: pending,
      remarks: pending === '—' ? 'Stock verified and shelved.' : 'Awaiting inspection clearance.',
    } satisfies StockingRecord;
  });
}

export const stockingRecords: StockingRecord[] = buildStocking(46);
