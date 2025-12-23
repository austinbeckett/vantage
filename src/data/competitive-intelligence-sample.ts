import type {
  DashboardMetrics,
  ActivityEvent,
  MarketShareItem,
  Competitor,
  PipelineItem,
  StageMetric,
  TrendData,
  SavedView,
  TimeRangeOption
} from '../types/competitive-intelligence'

export const sampleDashboardMetrics: DashboardMetrics = {
  totalCompetitors: 47,
  competitorsTracked: 6,
  recentSubmissions: 23,
  recentApprovals: 18,
  pendingReviews: 34,
  marketedProducts: 1247,
  avgApprovalTime: 14.2,
  myCompanyRank: 3
}

export const sampleActivityFeed: ActivityEvent[] = [
  {
    id: 'act-001',
    type: 'approval',
    manufacturer: 'Apotex Inc.',
    productName: 'Apo-Rosuvastatin',
    activeIngredient: 'Rosuvastatin Calcium',
    therapeuticArea: 'Cardiovascular',
    description: 'NOC granted for 5mg, 10mg, 20mg tablet strengths',
    date: '2024-01-18',
    previousStatus: 'Under Review',
    newStatus: 'Approved'
  },
  {
    id: 'act-002',
    type: 'submission',
    manufacturer: 'Teva Canada Limited',
    productName: 'Teva-Empagliflozin',
    activeIngredient: 'Empagliflozin',
    therapeuticArea: 'Antidiabetic',
    description: 'New generic submission for SGLT2 inhibitor',
    date: '2024-01-17',
    previousStatus: null,
    newStatus: 'Submitted'
  },
  {
    id: 'act-003',
    type: 'approval',
    manufacturer: 'Sandoz Canada Inc.',
    productName: 'Sandoz Adalimumab',
    activeIngredient: 'Adalimumab',
    therapeuticArea: 'Immunology',
    description: 'Biosimilar approved for rheumatoid arthritis indication',
    date: '2024-01-16',
    previousStatus: 'Under Review',
    newStatus: 'Approved'
  },
  {
    id: 'act-004',
    type: 'discontinuation',
    manufacturer: 'Pharmascience Inc.',
    productName: 'pms-Ranitidine',
    activeIngredient: 'Ranitidine HCl',
    therapeuticArea: 'Gastrointestinal',
    description: 'Product discontinued due to NDMA concerns',
    date: '2024-01-15',
    previousStatus: 'Marketed',
    newStatus: 'Discontinued'
  },
  {
    id: 'act-005',
    type: 'submission',
    manufacturer: 'Apotex Inc.',
    productName: 'Apo-Sacubitril/Valsartan',
    activeIngredient: 'Sacubitril/Valsartan',
    therapeuticArea: 'Cardiovascular',
    description: 'Generic submission for heart failure combination therapy',
    date: '2024-01-14',
    previousStatus: null,
    newStatus: 'Submitted'
  },
  {
    id: 'act-006',
    type: 'approval',
    manufacturer: 'Teva Canada Limited',
    productName: 'Teva-Apixaban',
    activeIngredient: 'Apixaban',
    therapeuticArea: 'Cardiovascular',
    description: 'Generic anticoagulant approved in all strengths',
    date: '2024-01-12',
    previousStatus: 'Under Review',
    newStatus: 'Approved'
  },
  {
    id: 'act-007',
    type: 'submission',
    manufacturer: 'Mint Pharmaceuticals Inc.',
    productName: 'Mint-Sitagliptin',
    activeIngredient: 'Sitagliptin',
    therapeuticArea: 'Antidiabetic',
    description: 'DPP-4 inhibitor generic submission',
    date: '2024-01-10',
    previousStatus: null,
    newStatus: 'Submitted'
  },
  {
    id: 'act-008',
    type: 'status_change',
    manufacturer: 'Sandoz Canada Inc.',
    productName: 'Sandoz Bortezomib',
    activeIngredient: 'Bortezomib',
    therapeuticArea: 'Oncology',
    description: 'Transitioned from approved to actively marketed',
    date: '2024-01-08',
    previousStatus: 'Approved',
    newStatus: 'Marketed'
  }
]

export const sampleMarketShareByTherapeuticArea: MarketShareItem[] = [
  { name: 'Cardiovascular', value: 312, percentage: 25.0 },
  { name: 'Central Nervous System', value: 224, percentage: 18.0 },
  { name: 'Antidiabetic', value: 187, percentage: 15.0 },
  { name: 'Anti-infective', value: 162, percentage: 13.0 },
  { name: 'Gastrointestinal', value: 137, percentage: 11.0 },
  { name: 'Oncology', value: 112, percentage: 9.0 },
  { name: 'Immunology', value: 63, percentage: 5.0 },
  { name: 'Other', value: 50, percentage: 4.0 }
]

export const sampleMarketShareByManufacturer: MarketShareItem[] = [
  { name: 'Apotex Inc.', value: 287, percentage: 23.0 },
  { name: 'Teva Canada Limited', value: 249, percentage: 20.0 },
  { name: 'Sandoz Canada Inc.', value: 199, percentage: 16.0 },
  { name: 'Pharmascience Inc.', value: 174, percentage: 14.0 },
  { name: 'Mint Pharmaceuticals Inc.', value: 137, percentage: 11.0 },
  { name: 'Sanis Health Inc.', value: 112, percentage: 9.0 },
  { name: 'Other', value: 89, percentage: 7.0 }
]

export const sampleCompetitors: Competitor[] = [
  {
    id: 'comp-001',
    name: 'Apotex Inc.',
    headquarters: 'Toronto, ON',
    totalProducts: 287,
    marketedProducts: 243,
    pendingApprovals: 28,
    recentApprovals: 12,
    recentSubmissions: 8,
    marketShare: 23.0,
    avgApprovalTime: 13.8,
    portfolioByTherapeuticArea: [
      { area: 'Cardiovascular', count: 72 },
      { area: 'Central Nervous System', count: 58 },
      { area: 'Anti-infective', count: 45 },
      { area: 'Gastrointestinal', count: 38 },
      { area: 'Antidiabetic', count: 34 },
      { area: 'Other', count: 40 }
    ],
    recentActivity: [
      { date: '2024-01-18', type: 'approval', product: 'Apo-Rosuvastatin' },
      { date: '2024-01-14', type: 'submission', product: 'Apo-Sacubitril/Valsartan' },
      { date: '2024-01-05', type: 'approval', product: 'Apo-Liraglutide' }
    ],
    timeline: [
      { date: '2024-01', approvals: 3, submissions: 2 },
      { date: '2023-12', approvals: 2, submissions: 4 },
      { date: '2023-11', approvals: 4, submissions: 3 },
      { date: '2023-10', approvals: 2, submissions: 2 }
    ]
  },
  {
    id: 'comp-002',
    name: 'Teva Canada Limited',
    headquarters: 'Toronto, ON',
    totalProducts: 249,
    marketedProducts: 212,
    pendingApprovals: 22,
    recentApprovals: 9,
    recentSubmissions: 6,
    marketShare: 20.0,
    avgApprovalTime: 14.5,
    portfolioByTherapeuticArea: [
      { area: 'Central Nervous System', count: 62 },
      { area: 'Cardiovascular', count: 48 },
      { area: 'Antidiabetic', count: 35 },
      { area: 'Anti-infective', count: 32 },
      { area: 'Gastrointestinal', count: 28 },
      { area: 'Other', count: 44 }
    ],
    recentActivity: [
      { date: '2024-01-17', type: 'submission', product: 'Teva-Empagliflozin' },
      { date: '2024-01-12', type: 'approval', product: 'Teva-Apixaban' },
      { date: '2024-01-03', type: 'approval', product: 'Teva-Semaglutide' }
    ],
    timeline: [
      { date: '2024-01', approvals: 2, submissions: 3 },
      { date: '2023-12', approvals: 3, submissions: 2 },
      { date: '2023-11', approvals: 2, submissions: 4 },
      { date: '2023-10', approvals: 3, submissions: 1 }
    ]
  },
  {
    id: 'comp-003',
    name: 'Sandoz Canada Inc.',
    headquarters: 'Boucherville, QC',
    totalProducts: 199,
    marketedProducts: 168,
    pendingApprovals: 19,
    recentApprovals: 7,
    recentSubmissions: 5,
    marketShare: 16.0,
    avgApprovalTime: 15.2,
    portfolioByTherapeuticArea: [
      { area: 'Cardiovascular', count: 42 },
      { area: 'Anti-infective', count: 38 },
      { area: 'Central Nervous System', count: 35 },
      { area: 'Immunology', count: 28 },
      { area: 'Oncology', count: 22 },
      { area: 'Other', count: 34 }
    ],
    recentActivity: [
      { date: '2024-01-16', type: 'approval', product: 'Sandoz Adalimumab' },
      { date: '2024-01-08', type: 'status_change', product: 'Sandoz Bortezomib' },
      { date: '2023-12-28', type: 'submission', product: 'Sandoz Ustekinumab' }
    ],
    timeline: [
      { date: '2024-01', approvals: 2, submissions: 1 },
      { date: '2023-12', approvals: 1, submissions: 3 },
      { date: '2023-11', approvals: 3, submissions: 2 },
      { date: '2023-10', approvals: 1, submissions: 2 }
    ]
  },
  {
    id: 'comp-004',
    name: 'Pharmascience Inc.',
    headquarters: 'Montreal, QC',
    totalProducts: 174,
    marketedProducts: 148,
    pendingApprovals: 16,
    recentApprovals: 5,
    recentSubmissions: 4,
    marketShare: 14.0,
    avgApprovalTime: 14.8,
    portfolioByTherapeuticArea: [
      { area: 'Cardiovascular', count: 38 },
      { area: 'Central Nervous System', count: 34 },
      { area: 'Gastrointestinal', count: 28 },
      { area: 'Anti-infective', count: 25 },
      { area: 'Antidiabetic', count: 22 },
      { area: 'Other', count: 27 }
    ],
    recentActivity: [
      { date: '2024-01-15', type: 'discontinuation', product: 'pms-Ranitidine' },
      { date: '2024-01-06', type: 'approval', product: 'pms-Dapagliflozin' },
      { date: '2023-12-20', type: 'submission', product: 'pms-Ozanimod' }
    ],
    timeline: [
      { date: '2024-01', approvals: 1, submissions: 2 },
      { date: '2023-12', approvals: 2, submissions: 1 },
      { date: '2023-11', approvals: 1, submissions: 3 },
      { date: '2023-10', approvals: 2, submissions: 1 }
    ]
  },
  {
    id: 'comp-005',
    name: 'Mint Pharmaceuticals Inc.',
    headquarters: 'Mississauga, ON',
    totalProducts: 137,
    marketedProducts: 115,
    pendingApprovals: 14,
    recentApprovals: 4,
    recentSubmissions: 3,
    marketShare: 11.0,
    avgApprovalTime: 13.5,
    portfolioByTherapeuticArea: [
      { area: 'Cardiovascular', count: 32 },
      { area: 'Antidiabetic', count: 28 },
      { area: 'Central Nervous System', count: 24 },
      { area: 'Anti-infective', count: 18 },
      { area: 'Gastrointestinal', count: 15 },
      { area: 'Other', count: 20 }
    ],
    recentActivity: [
      { date: '2024-01-10', type: 'submission', product: 'Mint-Sitagliptin' },
      { date: '2024-01-02', type: 'approval', product: 'Mint-Canagliflozin' },
      { date: '2023-12-18', type: 'approval', product: 'Mint-Vortioxetine' }
    ],
    timeline: [
      { date: '2024-01', approvals: 1, submissions: 2 },
      { date: '2023-12', approvals: 2, submissions: 1 },
      { date: '2023-11', approvals: 1, submissions: 2 },
      { date: '2023-10', approvals: 1, submissions: 1 }
    ]
  },
  {
    id: 'comp-006',
    name: 'Sanis Health Inc.',
    headquarters: 'Brampton, ON',
    totalProducts: 112,
    marketedProducts: 94,
    pendingApprovals: 11,
    recentApprovals: 3,
    recentSubmissions: 2,
    marketShare: 9.0,
    avgApprovalTime: 14.0,
    portfolioByTherapeuticArea: [
      { area: 'Cardiovascular', count: 26 },
      { area: 'Central Nervous System', count: 22 },
      { area: 'Anti-infective', count: 18 },
      { area: 'Antidiabetic', count: 16 },
      { area: 'Gastrointestinal', count: 14 },
      { area: 'Other', count: 16 }
    ],
    recentActivity: [
      { date: '2024-01-09', type: 'approval', product: 'Sanis-Rivaroxaban' },
      { date: '2023-12-22', type: 'submission', product: 'Sanis-Dulaglutide' },
      { date: '2023-12-15', type: 'approval', product: 'Sanis-Escitalopram' }
    ],
    timeline: [
      { date: '2024-01', approvals: 1, submissions: 1 },
      { date: '2023-12', approvals: 1, submissions: 2 },
      { date: '2023-11', approvals: 1, submissions: 1 },
      { date: '2023-10', approvals: 1, submissions: 1 }
    ]
  }
]

export const samplePipelineItems: PipelineItem[] = [
  {
    id: 'pipe-001',
    productName: 'Apo-Sacubitril/Valsartan',
    activeIngredient: 'Sacubitril/Valsartan',
    manufacturer: 'Apotex Inc.',
    therapeuticArea: 'Cardiovascular',
    stage: 'submitted',
    submissionDate: '2024-01-14',
    daysInStage: 4,
    predictedApprovalDate: '2024-07-15',
    confidence: 82
  },
  {
    id: 'pipe-002',
    productName: 'Teva-Empagliflozin',
    activeIngredient: 'Empagliflozin',
    manufacturer: 'Teva Canada Limited',
    therapeuticArea: 'Antidiabetic',
    stage: 'submitted',
    submissionDate: '2024-01-17',
    daysInStage: 1,
    predictedApprovalDate: '2024-08-20',
    confidence: 78
  },
  {
    id: 'pipe-003',
    productName: 'Mint-Sitagliptin',
    activeIngredient: 'Sitagliptin',
    manufacturer: 'Mint Pharmaceuticals Inc.',
    therapeuticArea: 'Antidiabetic',
    stage: 'submitted',
    submissionDate: '2024-01-10',
    daysInStage: 8,
    predictedApprovalDate: '2024-06-25',
    confidence: 85
  },
  {
    id: 'pipe-004',
    productName: 'Sandoz Ustekinumab',
    activeIngredient: 'Ustekinumab',
    manufacturer: 'Sandoz Canada Inc.',
    therapeuticArea: 'Immunology',
    stage: 'under_review',
    submissionDate: '2023-08-15',
    daysInStage: 156,
    predictedApprovalDate: '2024-03-10',
    confidence: 91
  },
  {
    id: 'pipe-005',
    productName: 'pms-Ozanimod',
    activeIngredient: 'Ozanimod',
    manufacturer: 'Pharmascience Inc.',
    therapeuticArea: 'Immunology',
    stage: 'under_review',
    submissionDate: '2023-09-20',
    daysInStage: 120,
    predictedApprovalDate: '2024-04-15',
    confidence: 88
  },
  {
    id: 'pipe-006',
    productName: 'Sanis-Dulaglutide',
    activeIngredient: 'Dulaglutide',
    manufacturer: 'Sanis Health Inc.',
    therapeuticArea: 'Antidiabetic',
    stage: 'under_review',
    submissionDate: '2023-10-05',
    daysInStage: 105,
    predictedApprovalDate: '2024-05-01',
    confidence: 86
  },
  {
    id: 'pipe-007',
    productName: 'Apo-Tofacitinib',
    activeIngredient: 'Tofacitinib',
    manufacturer: 'Apotex Inc.',
    therapeuticArea: 'Immunology',
    stage: 'under_review',
    submissionDate: '2023-07-12',
    daysInStage: 190,
    predictedApprovalDate: '2024-02-28',
    confidence: 94
  },
  {
    id: 'pipe-008',
    productName: 'Teva-Semaglutide Oral',
    activeIngredient: 'Semaglutide',
    manufacturer: 'Teva Canada Limited',
    therapeuticArea: 'Antidiabetic',
    stage: 'noc_granted',
    submissionDate: '2023-03-10',
    daysInStage: 45,
    predictedApprovalDate: null,
    confidence: null
  },
  {
    id: 'pipe-009',
    productName: 'Sandoz Adalimumab',
    activeIngredient: 'Adalimumab',
    manufacturer: 'Sandoz Canada Inc.',
    therapeuticArea: 'Immunology',
    stage: 'noc_granted',
    submissionDate: '2023-02-18',
    daysInStage: 2,
    predictedApprovalDate: null,
    confidence: null
  },
  {
    id: 'pipe-010',
    productName: 'Apo-Rosuvastatin',
    activeIngredient: 'Rosuvastatin Calcium',
    manufacturer: 'Apotex Inc.',
    therapeuticArea: 'Cardiovascular',
    stage: 'noc_granted',
    submissionDate: '2023-04-22',
    daysInStage: 0,
    predictedApprovalDate: null,
    confidence: null
  },
  {
    id: 'pipe-011',
    productName: 'Mint-Canagliflozin',
    activeIngredient: 'Canagliflozin',
    manufacturer: 'Mint Pharmaceuticals Inc.',
    therapeuticArea: 'Antidiabetic',
    stage: 'marketed',
    submissionDate: '2023-01-15',
    daysInStage: 16,
    predictedApprovalDate: null,
    confidence: null
  },
  {
    id: 'pipe-012',
    productName: 'Teva-Apixaban',
    activeIngredient: 'Apixaban',
    manufacturer: 'Teva Canada Limited',
    therapeuticArea: 'Cardiovascular',
    stage: 'marketed',
    submissionDate: '2023-02-28',
    daysInStage: 6,
    predictedApprovalDate: null,
    confidence: null
  },
  {
    id: 'pipe-013',
    productName: 'Sandoz Bortezomib',
    activeIngredient: 'Bortezomib',
    manufacturer: 'Sandoz Canada Inc.',
    therapeuticArea: 'Oncology',
    stage: 'marketed',
    submissionDate: '2022-11-10',
    daysInStage: 10,
    predictedApprovalDate: null,
    confidence: null
  },
  {
    id: 'pipe-014',
    productName: 'pms-Dapagliflozin',
    activeIngredient: 'Dapagliflozin',
    manufacturer: 'Pharmascience Inc.',
    therapeuticArea: 'Antidiabetic',
    stage: 'marketed',
    submissionDate: '2023-03-05',
    daysInStage: 12,
    predictedApprovalDate: null,
    confidence: null
  },
  {
    id: 'pipe-015',
    productName: 'Sanis-Rivaroxaban',
    activeIngredient: 'Rivaroxaban',
    manufacturer: 'Sanis Health Inc.',
    therapeuticArea: 'Cardiovascular',
    stage: 'marketed',
    submissionDate: '2023-04-18',
    daysInStage: 9,
    predictedApprovalDate: null,
    confidence: null
  }
]

export const sampleStageMetrics: StageMetric[] = [
  { stage: 'submitted', label: 'Submitted', avgDays: 45, count: 3 },
  { stage: 'under_review', label: 'Under Review', avgDays: 142, count: 4 },
  { stage: 'noc_granted', label: 'NOC Granted', avgDays: 28, count: 3 },
  { stage: 'marketed', label: 'Marketed', avgDays: null, count: 5 }
]

export const sampleTrendData: TrendData = {
  approvalsByMonth: [
    { month: '2022-01', count: 8 },
    { month: '2022-02', count: 12 },
    { month: '2022-03', count: 10 },
    { month: '2022-04', count: 14 },
    { month: '2022-05', count: 9 },
    { month: '2022-06', count: 11 },
    { month: '2022-07', count: 13 },
    { month: '2022-08', count: 8 },
    { month: '2022-09', count: 10 },
    { month: '2022-10', count: 12 },
    { month: '2022-11', count: 15 },
    { month: '2022-12', count: 11 },
    { month: '2023-01', count: 14 },
    { month: '2023-02', count: 10 },
    { month: '2023-03', count: 16 },
    { month: '2023-04', count: 12 },
    { month: '2023-05', count: 11 },
    { month: '2023-06', count: 13 },
    { month: '2023-07', count: 9 },
    { month: '2023-08', count: 14 },
    { month: '2023-09', count: 12 },
    { month: '2023-10', count: 15 },
    { month: '2023-11', count: 13 },
    { month: '2023-12', count: 11 },
    { month: '2024-01', count: 18 }
  ],
  submissionsByMonth: [
    { month: '2022-01', count: 15 },
    { month: '2022-02', count: 18 },
    { month: '2022-03', count: 14 },
    { month: '2022-04', count: 20 },
    { month: '2022-05', count: 16 },
    { month: '2022-06', count: 19 },
    { month: '2022-07', count: 17 },
    { month: '2022-08', count: 13 },
    { month: '2022-09', count: 18 },
    { month: '2022-10', count: 21 },
    { month: '2022-11', count: 19 },
    { month: '2022-12', count: 15 },
    { month: '2023-01', count: 22 },
    { month: '2023-02', count: 17 },
    { month: '2023-03', count: 24 },
    { month: '2023-04', count: 19 },
    { month: '2023-05', count: 16 },
    { month: '2023-06', count: 21 },
    { month: '2023-07', count: 18 },
    { month: '2023-08', count: 20 },
    { month: '2023-09', count: 17 },
    { month: '2023-10', count: 22 },
    { month: '2023-11', count: 19 },
    { month: '2023-12', count: 16 },
    { month: '2024-01', count: 23 }
  ],
  approvalsByTherapeuticArea: [
    { area: 'Cardiovascular', '2022': 38, '2023': 42, '2024': 5 },
    { area: 'Antidiabetic', '2022': 28, '2023': 35, '2024': 4 },
    { area: 'Central Nervous System', '2022': 32, '2023': 30, '2024': 3 },
    { area: 'Anti-infective', '2022': 24, '2023': 28, '2024': 2 },
    { area: 'Immunology', '2022': 12, '2023': 18, '2024': 2 },
    { area: 'Oncology', '2022': 8, '2023': 14, '2024': 1 },
    { area: 'Gastrointestinal', '2022': 18, '2023': 16, '2024': 1 }
  ]
}

export const sampleSavedViews: SavedView[] = [
  {
    id: 'view-001',
    name: 'Cardiovascular Competitors',
    description: 'All competitors with cardiovascular products',
    filters: {
      therapeuticArea: 'Cardiovascular',
      timeRange: '1yr'
    },
    createdAt: '2024-01-05',
    lastAccessed: '2024-01-18'
  },
  {
    id: 'view-002',
    name: 'Top 3 Pipeline Watch',
    description: 'Pipeline status for Apotex, Teva, and Sandoz',
    filters: {
      competitors: ['Apotex Inc.', 'Teva Canada Limited', 'Sandoz Canada Inc.'],
      view: 'pipeline'
    },
    createdAt: '2023-12-10',
    lastAccessed: '2024-01-17'
  },
  {
    id: 'view-003',
    name: 'Diabetes Market Trends',
    description: 'Antidiabetic approval trends over 3 years',
    filters: {
      therapeuticArea: 'Antidiabetic',
      timeRange: '3yr',
      view: 'trends'
    },
    createdAt: '2023-11-22',
    lastAccessed: '2024-01-12'
  }
]

export const sampleTimeRangeOptions: TimeRangeOption[] = [
  { value: '1yr', label: 'Last 12 Months' },
  { value: '3yr', label: 'Last 3 Years' },
  { value: '5yr', label: 'Last 5 Years' },
  { value: 'all', label: 'All Time' }
]

export const sampleTherapeuticAreaOptions: string[] = [
  'Cardiovascular',
  'Central Nervous System',
  'Antidiabetic',
  'Anti-infective',
  'Gastrointestinal',
  'Oncology',
  'Immunology',
  'Respiratory',
  'Dermatology',
  'Other'
]
