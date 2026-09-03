import type { CourseUnitRealisation, Student } from '../../common/types.ts'

// Hardcoded demo data served to the demo user (see isDemoUser in validations.ts).
// The demo user logs in normally but has no real SIS data, so these stand in.
//
// Courses are real University of Helsinki CS course implementations: the ids are
// the real SIS CourseUnitRealisation ids, so the "Course page" link
// (studies.helsinki.fi/courses/course-implementation/<id>) resolves to the
// actual course. Students below are fabricated (random usernames).

function demoCourse(
  id: string,
  fi: string,
  en: string,
  startDate: string,
  endDate: string,
): CourseUnitRealisation {
  return {
    id,
    universityOrgIds: [],
    flowState: 'PUBLISHED',
    name: { fi, en },
    nameSpecifier: null,
    assessmentItemIds: [],
    activityPeriod: { startDate, endDate },
    teachingLanguageUrn: 'urn:code:language:fi',
    courseUnitRealisationTypeUrn:
      'urn:code:course-unit-realisation-type:teaching-participation-lab',
    studyGroupSets: [],
    organisations: [],
    enrolmentPeriod: { startDate, endDate },
    responsibilityInfos: [],
    customCodeUrns: null,
    documentState: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

export const demoCourses: CourseUnitRealisation[] = [
  // CSM141091
  demoCourse(
    'otm-e534066a-d0e9-49b1-9208-62805f4d64c4',
    'Full Stack -websovelluskehitys harjoitustyö',
    'Full Stack Web Development Project',
    '2026-12-01',
    '2027-02-28',
  ),
  // TKT20019
  demoCourse(
    'hy-opt-cur-2526-e435f40e-4faa-4140-96b6-e77a2e161b06',
    'Tietokannat ja web-ohjelmointi',
    'Databases and Web Programming',
    '2026-11-04',
    '2026-12-30',
  ),
  // CSM13001
  demoCourse(
    'hy-opt-cur-2526-b8ec1422-835b-4bdb-bd2c-25df506de0f8',
    'Distributed Systems',
    'Distributed Systems',
    '2026-10-26',
    '2026-12-18',
  ),
]

// Namespaces the demo user sees as already provisioned, so the Manage modal can
// be previewed in development without a real cluster (creation/deletion are
// no-ops for the demo user in routes/okd.ts). These names mirror what
// courseNsName() in the frontend derives for the demo courses above:
// `tkt-cs-<slug>-<start year>`, plus `-group-N` per group.
//
// Creation is binary, so each demo course is in exactly one mode:
//  - "Distributed Systems": group mode — three group namespaces, no course one.
//  - "Databases and Web Programming": course mode — a single course namespace,
//    end date pulled forward to tomorrow, so its card shows an imminent
//    "Active until" in red (scheduled for deletion).
const DEMO_NS_GROUPS = 'tkt-cs-distributed-systems-2026'
const DEMO_NS_PENDING = 'tkt-cs-tietokannat-ja-web-ohjelmointi-2026'

const tomorrow = (() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
})()

export const demoNamespaces = [
  // Group mode — active (endDate is the normal course-end + 60 days).
  { name: `${DEMO_NS_GROUPS}-group-1`, created: '2026-10-20T09:05:00.000Z', endDate: '2027-02-16' },
  { name: `${DEMO_NS_GROUPS}-group-2`, created: '2026-10-20T09:05:00.000Z', endDate: '2027-02-16' },
  { name: `${DEMO_NS_GROUPS}-group-3`, created: '2026-10-20T09:05:00.000Z', endDate: '2027-02-16' },
  // Course mode — scheduled for deletion.
  { name: DEMO_NS_PENDING, created: '2026-11-01T09:00:00.000Z', endDate: tomorrow },
]

function student(
  uid: string,
  firstNames: string,
  lastName: string,
  studentNumber: string,
): Student {
  return {
    eduPersonPrincipalName: `${uid}@helsinki.fi`,
    firstNames,
    lastName,
    studentNumber,
  }
}

// The uid passed to student() is a random 10-character string: nine lowercase
// letters followed by a digit (no special characters). eduPersonPrincipalName
// is then `<uid>@helsinki.fi`, matching the real SIS email form.
const demoStudentsByCourse: Record<string, Student[]> = {
  'otm-e534066a-d0e9-49b1-9208-62805f4d64c4': [
    student('qbnrmwktl4', 'Aino', 'Virtanen', '014203877'),
    student('zhfdpxsva7', 'Eero', 'Nieminen', '015118420'),
    student('mwkqljnzb2', 'Sofia Maria', 'Mäkinen', '014977201'),
    student('tpsrvhcxg9', 'Onni', 'Korhonen', '015342096'),
    student('ndklfqwmz3', 'Helmi', 'Järvinen', '014660514'),
    student('vbghtrjpl6', 'Väinö', 'Laine', '015809333'),
  ],
  'hy-opt-cur-2526-e435f40e-4faa-4140-96b6-e77a2e161b06': [
    student('xkmwqzdfn1', 'Ilona', 'Heikkinen', '014501982'),
    student('rplsvnktb8', 'Leo', 'Hämäläinen', '015274610'),
    student('jhcgwmqxz5', 'Venla', 'Koskinen', '014938745'),
    student('fwnbkrtpl0', 'Elias Johannes', 'Lehtinen', '015063228'),
    student('dscjmwqzv1', 'Aada', 'Saarinen', '014712559'),
    student('ktblrnphw4', 'Niilo', 'Salminen', '015487103'),
  ],
  'hy-opt-cur-2526-b8ec1422-835b-4bdb-bd2c-25df506de0f8': [
    student('gwmxzqfdn7', 'Lyydia', 'Ojanen', '014355890'),
    student('lpvhrtskb3', 'Akseli', 'Rantanen', '015190467'),
    student('nqzwmfdxk2', 'Iida', 'Halonen', '014824071'),
    student('bvhgtrlpj5', 'Veeti', 'Tuominen', '015602938'),
    student('wkqmzndfl8', 'Saana Emilia', 'Aalto', '014079215'),
    student('srptvhcxg6', 'Eino', 'Mattila', '015933604'),
  ],
}

export function getDemoStudents(courseId: string): Student[] {
  return demoStudentsByCourse[courseId] ?? []
}

export function getDemoStudentsByNumbers(studentNumbers: string[]): Student[] {
  const wanted = new Set(studentNumbers)
  return Object.values(demoStudentsByCourse)
    .flat()
    .filter((student) => wanted.has(student.studentNumber))
}
