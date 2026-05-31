// IMPORTANT: Keep all dates in the past and mileage values increasing chronologically.
// Dates must not be in the future. Mileage at each record must be >= the previous record's
// mileage. This data is displayed on a public demo page and future dates or inconsistent
// mileage immediately undermine credibility.

export const demoVehicle = {
  year: '2022',
  make: 'Toyota',
  model: 'Camry',
  trim: 'XSE',
  engine: '2.5L 4-cyl · Gasoline',
  transmission: 'Automatic',
  bodyClass: 'sedan',
  mileage: 38000,
  // Fictional but structurally valid VIN for demo purposes.
  // Real shared pages display the owner's actual VIN.
  vin: '4T1BF1FK8NU123456',
}

export const demoRecords = [
  {
    id: 'r1',
    title: 'Oil Change & Multi-Point Inspection',
    shop: 'Jiffy Lube',
    date: '2023-03-18',
    category: 'Maintenance',
    mileage: 14200,
    cost: 79.99,
  },
  {
    id: 'r2',
    title: 'Tire Rotation & Brake Inspection',
    shop: 'Costco Tire Center',
    date: '2023-06-10',
    category: 'Maintenance',
    mileage: 16100,
    cost: 35.00,
  },
  {
    id: 'r3',
    title: 'Windshield Chip Repair',
    shop: 'Safelite AutoGlass',
    date: '2023-09-05',
    category: 'Insurance',
    mileage: 18400,
    cost: 0,
  },
  {
    id: 'r4',
    title: 'Air Filter & Cabin Filter Replacement',
    shop: 'Toyota Dealership',
    date: '2023-12-02',
    category: 'Maintenance',
    mileage: 20300,
    cost: 89.95,
  },
  {
    id: 'r5',
    title: 'Dashcam & Hardwire Kit Installation',
    shop: 'Best Buy Auto',
    date: '2024-02-17',
    category: 'Upgrade',
    mileage: 21500,
    cost: 249.99,
  },
  {
    id: 'r6',
    title: 'Brake Pad Replacement (front)',
    shop: 'Midas',
    date: '2024-05-11',
    category: 'Repair',
    mileage: 23800,
    cost: 189.00,
  },
  {
    id: 'r7',
    title: 'Oil Change',
    shop: 'Jiffy Lube',
    date: '2024-08-03',
    category: 'Maintenance',
    mileage: 26000,
    cost: 64.99,
  },
  {
    id: 'r8',
    title: 'Battery Replacement',
    shop: 'AutoZone',
    date: '2024-11-22',
    category: 'Repair',
    mileage: 28500,
    cost: 149.99,
  },
  {
    id: 'r9',
    title: 'Tire Rotation & Wheel Balancing',
    shop: 'Discount Tire',
    date: '2025-01-18',
    category: 'Maintenance',
    mileage: 29700,
    cost: 49.00,
  },
  {
    id: 'r10',
    title: 'Oil Change & Full Inspection',
    shop: 'Toyota Dealership',
    date: '2025-04-12',
    category: 'Maintenance',
    mileage: 31200,
    cost: 129.95,
  },
  {
    id: 'r11',
    title: 'Wiper Blade Replacement',
    shop: 'Toyota Dealership',
    date: '2025-04-12',
    category: 'Maintenance',
    mileage: 31200,
    cost: 29.95,
  },
  {
    id: 'r12',
    title: 'Synthetic Oil Change',
    shop: 'Jiffy Lube',
    date: '2025-10-12',
    category: 'Maintenance',
    mileage: 38000,
    cost: 84.99,
  },
]

// urgency: 'green' | 'yellow' | 'red'
export const demoMaintenance = [
  { id: 'm1', service: 'Oil Change',         dueIn: '~2,000 mi', urgency: 'yellow' },
  { id: 'm2', service: 'Tire Rotation',       dueIn: '~4,000 mi', urgency: 'green'  },
  { id: 'm3', service: 'Cabin Air Filter',    dueIn: '~7,000 mi', urgency: 'green'  },
  { id: 'm4', service: 'Brake Inspection',    dueIn: '~12,000 mi', urgency: 'green'  },
  { id: 'm5', service: 'Transmission Fluid',  dueIn: '~22,000 mi', urgency: 'green'  },
  { id: 'm6', service: 'Coolant Flush',       dueIn: '~32,000 mi', urgency: 'green'  },
]
