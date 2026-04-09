import type { Course, Student, NamespaceInfo } from './types'

export const mockCourses: Course[] = [
  {
    id: 'tkt-cs-1001',
    code: 'TKT-CS-1001',
    name: 'Introduction to Programming',
    year: 2026,
    period: 'III',
  },
  {
    id: 'tkt-cs-2001',
    code: 'TKT-CS-2001',
    name: 'Data Structures and Algorithms',
    year: 2026,
    period: 'III',
  },
  {
    id: 'tkt-cs-3001',
    code: 'TKT-CS-3001',
    name: 'Operating Systems',
    year: 2026,
    period: 'IV',
  },
  {
    id: 'tkt-cs-3002',
    code: 'TKT-CS-3002',
    name: 'Computer Networks',
    year: 2026,
    period: 'IV',
  },
  {
    id: 'tkt-cs-4001',
    code: 'TKT-CS-4001',
    name: 'Software Engineering',
    year: 2026,
    period: 'III',
  },
  {
    id: 'tkt-cs-4002',
    code: 'TKT-CS-4002',
    name: 'Distributed Systems',
    year: 2026,
    period: 'IV',
  },
]

const allStudents: Student[] = [
  { id: 's01', name: 'Aino Mäkinen',     studentNumber: '010001' },
  { id: 's02', name: 'Eetu Virtanen',    studentNumber: '010002' },
  { id: 's03', name: 'Helmi Korhonen',   studentNumber: '010003' },
  { id: 's04', name: 'Iida Nieminen',    studentNumber: '010004' },
  { id: 's05', name: 'Juhani Leinonen',  studentNumber: '010005' },
  { id: 's06', name: 'Kaisa Heikkinen',  studentNumber: '010006' },
  { id: 's07', name: 'Lauri Koskinen',   studentNumber: '010007' },
  { id: 's08', name: 'Minja Järvinen',   studentNumber: '010008' },
  { id: 's09', name: 'Niko Laitinen',    studentNumber: '010009' },
  { id: 's10', name: 'Oona Hakkarainen', studentNumber: '010010' },
  { id: 's11', name: 'Petri Ahonen',     studentNumber: '010011' },
  { id: 's12', name: 'Riikka Salminen',  studentNumber: '010012' },
  { id: 's13', name: 'Sami Tuominen',    studentNumber: '010013' },
  { id: 's14', name: 'Tiia Lehtinen',    studentNumber: '010014' },
  { id: 's15', name: 'Ulla Mäntylä',     studentNumber: '010015' },
  { id: 's16', name: 'Ville Karjalainen',studentNumber: '010016' },
  { id: 's17', name: 'Waltteri Ojanen',  studentNumber: '010017' },
  { id: 's18', name: 'Xenia Pietilä',    studentNumber: '010018' },
]

// Assign a slightly different subset to each course
const slices: Record<string, [number, number]> = {
  'tkt-cs-1001': [0, 18],
  'tkt-cs-2001': [2, 14],
  'tkt-cs-3001': [4, 16],
  'tkt-cs-3002': [1, 12],
  'tkt-cs-4001': [3, 15],
  'tkt-cs-4002': [6, 18],
}

export function getMockStudents(courseId: string): Student[] {
  const [from, to] = slices[courseId] ?? [0, 10]
  return allStudents.slice(from, to)
}

const mockNamespaces: Record<string, NamespaceInfo[]> = {
  'tkt-cs-1001': [
    { name: 'tkt-cs-introduction-to-programming-2026-group-1', type: 'group', groupNumber: 1, created: '2026-01-10T09:05:00Z', studentCount: 6 },
    { name: 'tkt-cs-introduction-to-programming-2026-group-2', type: 'group', groupNumber: 2, created: '2026-01-10T09:05:00Z', studentCount: 6 },
    { name: 'tkt-cs-introduction-to-programming-2026-group-3', type: 'group', groupNumber: 3, created: '2026-01-10T09:05:00Z', studentCount: 6 },
  ],
  'tkt-cs-2001': [
    { name: 'tkt-cs-data-structures-and-algorithms-2026', type: 'course', created: '2026-01-12T11:30:00Z', studentCount: 12 },
  ],
  'tkt-cs-3002': [
    { name: 'tkt-cs-computer-networks-2026-group-1', type: 'group', groupNumber: 1, created: '2025-10-01T08:10:00Z', studentCount: 4 },
    { name: 'tkt-cs-computer-networks-2026-group-2', type: 'group', groupNumber: 2, created: '2025-10-01T08:10:00Z', studentCount: 4 },
  ],
}

export function getMockNamespaces(courseId: string): NamespaceInfo[] {
  return mockNamespaces[courseId] ?? []
}
