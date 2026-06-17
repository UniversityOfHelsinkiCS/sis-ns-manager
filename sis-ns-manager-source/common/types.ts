export interface Student {
  eduPersonPrincipalName: string
  firstNames: string
  lastName: string
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

// --- SIS CourseUnitRealisation ---
// Mirrors the Sequelize model at:
// https://github.com/UniversityOfHelsinkiCS/sis-importer/blob/master/importer-db-api/src/models/CourseUnitRealisation.js

export interface CourseUnitRealisation {
  id: string
  universityOrgIds: string[]
  flowState: string
  name: Record<string, unknown>
  nameSpecifier: Record<string, unknown> | null
  assessmentItemIds: string[]
  activityPeriod: Record<string, unknown>
  teachingLanguageUrn: string
  courseUnitRealisationTypeUrn: string
  studyGroupSets: Record<string, unknown>[]
  organisations: Record<string, unknown>[]
  enrolmentPeriod: Record<string, unknown>
  responsibilityInfos: Record<string, unknown>[]
  customCodeUrns: Record<string, unknown> | null
  documentState: 'ACTIVE' | null
  createdAt: string
  updatedAt: string
}

export type User = {
  id: string
  username: string
  hyPersonSisuId: string
  email: string
}