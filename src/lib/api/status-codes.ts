// =============================================================================
// Health Canada DPD Status Code Mappings
// =============================================================================
// Status codes used in the Drug Product Database (DPD) API
// Reference: https://health-products.canada.ca/api/documentation/dpd-documentation-en.html

export interface StatusInfo {
  code: number
  name: string
  description: string
  category: 'active' | 'inactive' | 'pending'
}

/**
 * DPD Status Codes (1-15)
 * Maps numeric status codes from Health Canada API to human-readable values
 */
export const DPD_STATUS_CODES: Record<number, StatusInfo> = {
  1: {
    code: 1,
    name: 'Approved',
    description: 'Drug has been approved for sale in Canada',
    category: 'active',
  },
  2: {
    code: 2,
    name: 'Marketed',
    description: 'Drug is currently marketed in Canada',
    category: 'active',
  },
  3: {
    code: 3,
    name: 'Cancelled Pre-Market',
    description: 'Drug was cancelled before entering the market',
    category: 'inactive',
  },
  4: {
    code: 4,
    name: 'Cancelled Post-Market',
    description: 'Drug was cancelled after being marketed',
    category: 'inactive',
  },
  5: {
    code: 5,
    name: 'Dormant',
    description: 'Drug is dormant (not actively marketed but approval intact)',
    category: 'inactive',
  },
  6: {
    code: 6,
    name: 'Cancelled (Safety Issue)',
    description: 'Drug was cancelled due to safety concerns',
    category: 'inactive',
  },
  7: {
    code: 7,
    name: 'Cancelled (Sponsor Request)',
    description: 'Drug was cancelled at the request of the sponsor',
    category: 'inactive',
  },
  8: {
    code: 8,
    name: 'Cancelled (Problem with Application)',
    description: 'Drug was cancelled due to application problems',
    category: 'inactive',
  },
  9: {
    code: 9,
    name: 'Cancelled (Packaging Issues)',
    description: 'Drug was cancelled due to packaging issues',
    category: 'inactive',
  },
  10: {
    code: 10,
    name: 'Cancelled (Labelling Issues)',
    description: 'Drug was cancelled due to labelling issues',
    category: 'inactive',
  },
  11: {
    code: 11,
    name: 'Cancelled (Manufacturing Issues)',
    description: 'Drug was cancelled due to manufacturing issues',
    category: 'inactive',
  },
  12: {
    code: 12,
    name: 'Cancelled (Unknown)',
    description: 'Drug was cancelled for unknown reasons',
    category: 'inactive',
  },
  13: {
    code: 13,
    name: 'Cancelled (Compliance Issues)',
    description: 'Drug was cancelled due to compliance issues',
    category: 'inactive',
  },
  14: {
    code: 14,
    name: 'Cancelled (Post-NOC)',
    description: 'Drug was cancelled after Notice of Compliance was issued',
    category: 'inactive',
  },
  15: {
    code: 15,
    name: 'Cancelled (Other)',
    description: 'Drug was cancelled for other reasons',
    category: 'inactive',
  },
}

/**
 * Get status info by code
 */
export function getStatusInfo(code: number): StatusInfo | undefined {
  return DPD_STATUS_CODES[code]
}

/**
 * Get status name by code
 */
export function getStatusName(code: number): string {
  return DPD_STATUS_CODES[code]?.name ?? 'Unknown'
}

/**
 * Get status category by code
 */
export function getStatusCategory(code: number): 'active' | 'inactive' | 'pending' {
  return DPD_STATUS_CODES[code]?.category ?? 'inactive'
}

/**
 * Parse status code from API response string
 */
export function parseStatusCode(statusString: string): number {
  const code = parseInt(statusString, 10)
  return isNaN(code) ? 0 : code
}

/**
 * Get all active status codes
 */
export function getActiveStatusCodes(): number[] {
  return Object.values(DPD_STATUS_CODES)
    .filter(status => status.category === 'active')
    .map(status => status.code)
}

/**
 * Get all inactive status codes
 */
export function getInactiveStatusCodes(): number[] {
  return Object.values(DPD_STATUS_CODES)
    .filter(status => status.category === 'inactive')
    .map(status => status.code)
}

/**
 * Check if a status code represents an active product
 */
export function isActiveStatus(code: number): boolean {
  return DPD_STATUS_CODES[code]?.category === 'active'
}

/**
 * Get status codes for filtering
 * Returns array of { value, label } for dropdowns
 */
export function getStatusOptions(): Array<{ value: number; label: string }> {
  return Object.values(DPD_STATUS_CODES).map(status => ({
    value: status.code,
    label: status.name,
  }))
}

/**
 * Schedule types from DPD
 */
export const DPD_SCHEDULES = {
  PRESCRIPTION: 'Prescription',
  OTC: 'OTC',
  SCHEDULE_G: 'Schedule G (CDSA III/IV)',
  SCHEDULE_C: 'Schedule C',
  SCHEDULE_D: 'Schedule D',
  NARCOTIC: 'Narcotic (CDSA I/II)',
  ETHICAL: 'Ethical',
  TARGETED: 'Targeted (CDSA IV)',
} as const

export type ScheduleType = typeof DPD_SCHEDULES[keyof typeof DPD_SCHEDULES]
