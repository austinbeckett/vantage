import type {
  DashboardStats,
  ActivityItem,
  UpcomingDate,
  FilterOptions
} from '../types/dashboard'

export const sampleStats: DashboardStats = {
  totalWatchlists: 6,
  activeAlerts: 5,
  newMatchesThisWeek: 4,
  totalProductsTracked: 847,
  recentDpdUpdates: 23,
  recentNocUpdates: 8,
  recentGsurUpdates: 3,
  activityTrend: [12, 8, 15, 23, 18, 11, 14]
}

export const sampleActivityFeed: ActivityItem[] = [
  {
    id: 'act-001',
    drugProductId: 'dp-001',
    drugProductName: 'Cefazolin for Injection USP',
    din: '02456789',
    manufacturer: 'Apotex Inc.',
    eventType: 'status_change',
    eventDescription: 'Product status changed to Marketed',
    database: 'DPD',
    timestamp: '2024-12-22T14:32:00Z',
    isRead: false,
    isNew: true,
    triggeredWatchlist: {
      id: 'wl-001',
      name: 'Cefazolin IV Products'
    }
  },
  {
    id: 'act-002',
    drugProductId: 'dp-011',
    drugProductName: 'Morphine Sulfate Injection 10mg/mL',
    din: '02512345',
    manufacturer: 'Teva Canada Limited',
    eventType: 'noc_issued',
    eventDescription: 'Notice of Compliance issued',
    database: 'NOC',
    timestamp: '2024-12-22T11:15:00Z',
    isRead: false,
    isNew: true,
    triggeredWatchlist: {
      id: 'wl-002',
      name: 'Teva Canada Portfolio'
    }
  },
  {
    id: 'act-003',
    drugProductId: 'dp-015',
    drugProductName: 'Levothyroxine Sodium Tablets 50mcg',
    din: '02398765',
    manufacturer: 'Sandoz Canada Inc.',
    eventType: 'new_submission',
    eventDescription: 'New drug submission received',
    database: 'NOC',
    timestamp: '2024-12-22T09:45:00Z',
    isRead: false,
    isNew: true,
    triggeredWatchlist: {
      id: 'wl-003',
      name: 'Oral Tablets Market'
    }
  },
  {
    id: 'act-004',
    drugProductId: 'dp-008',
    drugProductName: 'Atorvastatin Calcium Tablets 20mg',
    din: '02445566',
    manufacturer: 'Apotex Inc.',
    eventType: 'status_change',
    eventDescription: 'Product status updated to Marketed',
    database: 'DPD',
    timestamp: '2024-12-22T08:20:00Z',
    isRead: true,
    isNew: false,
    triggeredWatchlist: {
      id: 'wl-005',
      name: 'Apotex Generic Pipeline'
    }
  },
  {
    id: 'act-005',
    drugProductId: 'dp-022',
    drugProductName: 'Omeprazole Delayed-Release Capsules 20mg',
    din: '02334455',
    manufacturer: 'Pharmascience Inc.',
    eventType: 'safety_update',
    eventDescription: 'Generic Substitution Update Report filed',
    database: 'GSUR',
    timestamp: '2024-12-21T16:30:00Z',
    isRead: true,
    isNew: false,
    triggeredWatchlist: null
  },
  {
    id: 'act-006',
    drugProductId: 'dp-003',
    drugProductName: 'Metformin Hydrochloride Tablets 500mg',
    din: '02223344',
    manufacturer: 'Teva Canada Limited',
    eventType: 'label_change',
    eventDescription: 'Product monograph updated',
    database: 'DPD',
    timestamp: '2024-12-21T14:10:00Z',
    isRead: true,
    isNew: false,
    triggeredWatchlist: {
      id: 'wl-006',
      name: 'Metformin Products'
    }
  },
  {
    id: 'act-007',
    drugProductId: 'dp-019',
    drugProductName: 'Amlodipine Besylate Tablets 5mg',
    din: '02556677',
    manufacturer: 'Mylan Pharmaceuticals',
    eventType: 'noc_issued',
    eventDescription: 'Notice of Compliance issued',
    database: 'NOC',
    timestamp: '2024-12-21T10:00:00Z',
    isRead: true,
    isNew: false,
    triggeredWatchlist: {
      id: 'wl-003',
      name: 'Oral Tablets Market'
    }
  },
  {
    id: 'act-008',
    drugProductId: 'dp-025',
    drugProductName: 'Fentanyl Transdermal System 25mcg/hr',
    din: '02667788',
    manufacturer: 'Teva Canada Limited',
    eventType: 'status_change',
    eventDescription: 'Product record updated',
    database: 'DPD',
    timestamp: '2024-12-20T15:45:00Z',
    isRead: true,
    isNew: false,
    triggeredWatchlist: {
      id: 'wl-004',
      name: 'Opioid Analgesics'
    }
  },
  {
    id: 'act-009',
    drugProductId: 'dp-030',
    drugProductName: 'Ciprofloxacin Tablets 500mg',
    din: '02778899',
    manufacturer: 'Apotex Inc.',
    eventType: 'new_submission',
    eventDescription: 'Supplemental new drug submission',
    database: 'NOC',
    timestamp: '2024-12-20T11:20:00Z',
    isRead: true,
    isNew: false,
    triggeredWatchlist: {
      id: 'wl-005',
      name: 'Apotex Generic Pipeline'
    }
  },
  {
    id: 'act-010',
    drugProductId: 'dp-012',
    drugProductName: 'Lidocaine Injection 1%',
    din: '02889900',
    manufacturer: 'Sandoz Canada Inc.',
    eventType: 'safety_update',
    eventDescription: 'Safety signal assessment completed',
    database: 'GSUR',
    timestamp: '2024-12-19T09:30:00Z',
    isRead: true,
    isNew: false,
    triggeredWatchlist: null
  }
]

export const sampleUpcomingDates: UpcomingDate[] = [
  {
    id: 'date-001',
    title: 'NOC Review Deadline',
    description: 'Cefazolin for Injection - Priority review decision',
    date: '2024-12-28',
    type: 'deadline'
  },
  {
    id: 'date-002',
    title: 'GSUR Submission Window',
    description: 'Q4 2024 Generic Substitution Update Reports due',
    date: '2025-01-15',
    type: 'submission'
  },
  {
    id: 'date-003',
    title: 'DPD Quarterly Update',
    description: 'Health Canada DPD database refresh',
    date: '2025-01-01',
    type: 'system'
  }
]

export const sampleFilterOptions: FilterOptions = {
  databases: [
    { id: 'dpd', name: 'DPD', fullName: 'Drug Product Database' },
    { id: 'noc', name: 'NOC', fullName: 'Notice of Compliance' },
    { id: 'gsur', name: 'GSUR', fullName: 'Generic Substitution Update Reports' }
  ],
  eventTypes: [
    { id: 'status_change', name: 'Status Change' },
    { id: 'noc_issued', name: 'NOC Issued' },
    { id: 'new_submission', name: 'New Submission' },
    { id: 'safety_update', name: 'Safety Update' },
    { id: 'label_change', name: 'Label Change' }
  ],
  watchlists: [
    { id: 'wl-001', name: 'Cefazolin IV Products' },
    { id: 'wl-002', name: 'Teva Canada Portfolio' },
    { id: 'wl-003', name: 'Oral Tablets Market' },
    { id: 'wl-004', name: 'Opioid Analgesics' },
    { id: 'wl-005', name: 'Apotex Generic Pipeline' },
    { id: 'wl-006', name: 'Metformin Products' }
  ],
  manufacturers: [
    { id: 'mfr-001', name: 'Apotex Inc.' },
    { id: 'mfr-002', name: 'Teva Canada Limited' },
    { id: 'mfr-003', name: 'Sandoz Canada Inc.' },
    { id: 'mfr-004', name: 'Pharmascience Inc.' },
    { id: 'mfr-005', name: 'Mylan Pharmaceuticals' }
  ]
}
