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
    '2026-06-01',
    '2026-08-31',
  ),
  // TKT20019
  demoCourse(
    'hy-opt-cur-2526-e435f40e-4faa-4140-96b6-e77a2e161b06',
    'Tietokannat ja web-ohjelmointi',
    'Databases and Web Programming',
    '2026-05-04',
    '2026-06-30',
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

function student(
  eduPersonPrincipalName: string,
  firstNames: string,
  lastName: string,
  studentNumber: string,
): Student {
  return { eduPersonPrincipalName, firstNames, lastName, studentNumber }
}

// Usernames (eduPersonPrincipalName) are random 10-character strings: nine
// lowercase letters followed by a digit. No special characters.
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
