import type { CourseUnitRealisation, Student } from '../../common/types.ts'

// Hardcoded demo data served to the demo user (see isDemoUser in validations.ts).
// The demo user logs in normally but has no real SIS data, so these stand in.
//
// Course ids use a `demo-` prefix on purpose: they are not valid SIS
// CourseUnitRealisation ids, so the "Course page" link
// (studies.helsinki.fi/courses/course-implementation/<id>) resolves to a
// non-existent course. Names are amateur-radio / antenna themed and do not
// correspond to any real course.

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
  demoCourse(
    'demo-cur-antenna-basics-2026',
    'Antennitekniikan perusteet',
    'Fundamentals of Antenna Technology',
    '2026-01-13',
    '2026-03-06',
  ),
  demoCourse(
    'demo-cur-yagi-design-2026',
    'Yagi-antennien suunnittelu',
    'Yagi Antenna Design',
    '2026-03-16',
    '2026-05-08',
  ),
  demoCourse(
    'demo-cur-hf-propagation-2026',
    'Radioamatöörin HF-radioyhteydet',
    'Amateur Radio HF Propagation',
    '2026-09-01',
    '2026-10-23',
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
  'demo-cur-antenna-basics-2026': [
    student('qbnrmwktl4', 'Aino', 'Virtanen', '014203877'),
    student('zhfdpxsva7', 'Eero', 'Nieminen', '015118420'),
    student('mwkqljnzb2', 'Sofia Maria', 'Mäkinen', '014977201'),
    student('tpsrvhcxg9', 'Onni', 'Korhonen', '015342096'),
    student('ndklfqwmz3', 'Helmi', 'Järvinen', '014660514'),
    student('vbghtrjpl6', 'Väinö', 'Laine', '015809333'),
  ],
  'demo-cur-yagi-design-2026': [
    student('xkmwqzdfn1', 'Ilona', 'Heikkinen', '014501982'),
    student('rplsvnktb8', 'Leo', 'Hämäläinen', '015274610'),
    student('jhcgwmqxz5', 'Venla', 'Koskinen', '014938745'),
    student('fwnbkrtpl0', 'Elias Johannes', 'Lehtinen', '015063228'),
    student('dscjmwqzv1', 'Aada', 'Saarinen', '014712559'),
    student('ktblrnphw4', 'Niilo', 'Salminen', '015487103'),
  ],
  'demo-cur-hf-propagation-2026': [
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
