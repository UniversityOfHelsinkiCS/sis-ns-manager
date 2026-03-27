export interface Course {
  id: string
  code: string
  name: string
  year: number
  period: string
}

export interface Student {
  id: string
  name: string
  studentNumber: string
}

// studentId -> group number (1-based), 0 = unassigned
export type GroupAssignment = Record<string, number>

export interface NamespaceInfo {
  name: string
  type: 'course' | 'group'
  groupNumber?: number
  created: string // ISO date string
  activeUntil?: string // ISO date string, set when enrolled for deletion
  studentCount: number
}
