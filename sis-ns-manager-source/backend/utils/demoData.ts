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

// "Ohjelmistotuotanto": a large course (200 students, see demoLargeRoster) in
// group mode, for previewing the UI at scale. Unlike the others its id is made
// up, so its "Course page" link doesn't resolve. Namespace names follow the
// UI's default (`<slug>-<year>-<n>`), so "Add new groups" suggests `-9` next.
const DEMO_LARGE_COURSE = 'demo-cur-ohjelmistotuotanto-2026'
const DEMO_NS_LARGE = 'ohjelmistotuotanto-2026'

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
  demoCourse(
    DEMO_LARGE_COURSE,
    'Ohjelmistotuotanto',
    'Software Engineering',
    '2026-09-01',
    '2026-12-20',
  ),
]

// Namespaces the demo user sees as already provisioned, so the Manage modal can
// be previewed in development without a real cluster (creation/deletion are
// no-ops for the demo user in routes/okd.ts). Associated with a course by the
// `course` field (mirrors the COURSE_ANNOTATION on real namespaces).
//
// Creation is binary, so each demo course is in exactly one mode:
//  - "Distributed Systems": group mode — three group namespaces, no course one.
//  - "Databases and Web Programming": course mode — a single course namespace,
//    end date pulled forward to tomorrow, so its card shows an imminent
//    "Active until" in red (scheduled for deletion).
//  - "Ohjelmistotuotanto": group mode at scale — eight group namespaces over
//    200 students, 15 of whom are in no group.
const DEMO_NS_GROUPS = 'tkt-cs-distributed-systems-2026'
const DEMO_GROUPS_COURSE = 'hy-opt-cur-2526-b8ec1422-835b-4bdb-bd2c-25df506de0f8'
const DEMO_NS_PENDING = 'tkt-cs-tietokannat-ja-web-ohjelmointi-2026'
const DEMO_PENDING_COURSE = 'hy-opt-cur-2526-e435f40e-4faa-4140-96b6-e77a2e161b06'

const tomorrow = (() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
})()

export const demoNamespaces = [
  // Group mode — active (endDate is the normal course-end + 60 days).
  { name: `${DEMO_NS_GROUPS}-group-1`, created: '2026-10-20T09:05:00.000Z', endDate: '2027-02-16', course: DEMO_GROUPS_COURSE },
  { name: `${DEMO_NS_GROUPS}-group-2`, created: '2026-10-20T09:05:00.000Z', endDate: '2027-02-16', course: DEMO_GROUPS_COURSE },
  { name: `${DEMO_NS_GROUPS}-group-3`, created: '2026-10-20T09:05:00.000Z', endDate: '2027-02-16', course: DEMO_GROUPS_COURSE },
  // Course mode — scheduled for deletion.
  { name: DEMO_NS_PENDING, created: '2026-11-01T09:00:00.000Z', endDate: tomorrow, course: DEMO_PENDING_COURSE },
  // Large group mode — active (course end 2026-12-20 + 60 days).
  { name: `${DEMO_NS_LARGE}-1`, created: '2026-09-05T10:00:00.000Z', endDate: '2027-02-18', course: DEMO_LARGE_COURSE },
  { name: `${DEMO_NS_LARGE}-2`, created: '2026-09-05T10:00:00.000Z', endDate: '2027-02-18', course: DEMO_LARGE_COURSE },
  { name: `${DEMO_NS_LARGE}-3`, created: '2026-09-05T10:00:00.000Z', endDate: '2027-02-18', course: DEMO_LARGE_COURSE },
  { name: `${DEMO_NS_LARGE}-4`, created: '2026-09-05T10:00:00.000Z', endDate: '2027-02-18', course: DEMO_LARGE_COURSE },
  { name: `${DEMO_NS_LARGE}-5`, created: '2026-09-05T10:00:00.000Z', endDate: '2027-02-18', course: DEMO_LARGE_COURSE },
  { name: `${DEMO_NS_LARGE}-6`, created: '2026-09-05T10:00:00.000Z', endDate: '2027-02-18', course: DEMO_LARGE_COURSE },
  { name: `${DEMO_NS_LARGE}-7`, created: '2026-09-05T10:00:00.000Z', endDate: '2027-02-18', course: DEMO_LARGE_COURSE },
  { name: `${DEMO_NS_LARGE}-8`, created: '2026-09-05T10:00:00.000Z', endDate: '2027-02-18', course: DEMO_LARGE_COURSE },
]

// Admin-group members of the demo group namespaces (see getDemoNamespaceUsers).
// Two of the six "Distributed Systems" students are deliberately in no group, to
// stand in for late registrants when previewing "Add new groups".
const demoNamespaceUsers: Record<string, string[]> = {
  [`${DEMO_NS_GROUPS}-group-1`]: ['gwmxzqfdn7', 'lpvhrtskb3'],
  [`${DEMO_NS_GROUPS}-group-2`]: ['nqzwmfdxk2'],
  [`${DEMO_NS_GROUPS}-group-3`]: ['bvhgtrlpj5'],
}

export function getDemoNamespaceUsers(name: string): string[] {
  // "Ohjelmistotuotanto" groups: members come from the group column of
  // demoLargeRoster.
  if (name.startsWith(`${DEMO_NS_LARGE}-`)) {
    const group = Number(name.slice(DEMO_NS_LARGE.length + 1))
    return demoLargeRoster.filter((row) => row[4] === group).map((row) => row[0])
  }
  return demoNamespaceUsers[name] ?? []
}

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
// "Ohjelmistotuotanto" roster: [uid, first names, last name, student number,
// group namespace number (`${DEMO_NS_LARGE}-<n>`), 0 = in no group]. Every 13th
// student is in no group, standing in for late registrants; the rest are spread
// round-robin over the 8 groups.
const demoLargeRoster: [string, string, string, string, number][] = [
  ['lirqdfruh0', 'Emma', 'Salminen', '010665876', 1],
  ['ceikxoafh7', 'Otto', 'Karjalainen', '019534042', 2],
  ['hhkhrvhxc0', 'Pihla', 'Karjalainen', '013353756', 3],
  ['kzrqjazez8', 'Iida', 'Laine', '012743673', 4],
  ['zpwtpmnut5', 'Hilla', 'Salminen', '016732495', 5],
  ['aecyyeemp2', 'Lauri', 'Virtanen', '019480667', 0],
  ['zqxgpoaxw9', 'Aino', 'Kallio', '017919570', 6],
  ['ymlagvxof0', 'Hilla', 'Lindholm', '014967628', 7],
  ['fiswfpybo1', 'Emma', 'Heikkinen', '016274544', 8],
  ['fiexjbkjx8', 'Matias', 'Saarinen', '016398858', 1],
  ['gmfbcydvz1', 'Väinö', 'Lehtinen', '011669207', 2],
  ['xchbppzjn5', 'Lauri', 'Tuominen', '016682560', 3],
  ['krtdiklde3', 'Akseli', 'Rantanen', '010704626', 4],
  ['efgrricfw9', 'Kerttu', 'Laine', '018863229', 5],
  ['hkzoizmln7', 'Väinö', 'Miettinen', '017582823', 6],
  ['dcicdaiar4', 'Eino', 'Nieminen', '010589685', 7],
  ['jckimoowk4', 'Matias', 'Jokinen', '011352110', 8],
  ['vqittdssn1', 'Veeti', 'Tuominen', '019853321', 1],
  ['npsykjtwa9', 'Väinö', 'Lehtinen', '015479212', 0],
  ['ypvxyxgjs1', 'Aleksi', 'Ojanen', '013494754', 2],
  ['vierwugna5', 'Toivo', 'Aalto', '011316202', 3],
  ['qnyjkzyxn8', 'Otto', 'Virtanen', '019774109', 4],
  ['eofcldocv5', 'Eino', 'Laine', '013835059', 5],
  ['epnxvjkyh3', 'Iida', 'Laine', '013821179', 6],
  ['qjbconhgy6', 'Eero', 'Lehtonen', '017806090', 7],
  ['qeclxsmcu7', 'Kerttu', 'Lindholm', '018843164', 8],
  ['teffdrxhp5', 'Eero', 'Savolainen', '014344975', 1],
  ['kkljgokqe4', 'Otto', 'Ojanen', '018405186', 2],
  ['ezwiqmals7', 'Elias', 'Miettinen', '017267409', 3],
  ['jjidpmwts3', 'Lyydia', 'Ojanen', '010530018', 4],
  ['intcmgwhj0', 'Ilona', 'Mäkinen', '010801780', 5],
  ['twcyybkbe7', 'Matias', 'Mäkinen', '017157916', 0],
  ['zhamtypmw4', 'Lyydia', 'Savolainen', '017519145', 6],
  ['ojcqxknxj0', 'Niilo', 'Korhonen', '018413159', 7],
  ['akasfwvyt3', 'Matias', 'Mattila', '013783730', 8],
  ['uiyzfkhxy3', 'Sofia', 'Kallio', '013080446', 1],
  ['vhhemmjkl2', 'Veeti', 'Ojanen', '018167053', 2],
  ['jeqspyxnd5', 'Sofia', 'Kallio', '012148651', 3],
  ['blfxdcxtk4', 'Oliver', 'Halonen', '018118676', 4],
  ['ttlqnslqk7', 'Pihla', 'Rantanen', '019504875', 5],
  ['tssapfqxj6', 'Lyydia', 'Lehtinen', '010668177', 6],
  ['bhvprkwzh3', 'Otto', 'Karjalainen', '015089168', 7],
  ['kbhmsvxys1', 'Akseli', 'Kallio', '019475502', 8],
  ['fihxoynje0', 'Venla', 'Miettinen', '015899318', 1],
  ['ydzrjduyf0', 'Elias', 'Ojanen', '014127164', 0],
  ['dfhtbwyrk7', 'Hilla', 'Laine', '017738395', 2],
  ['fyqejkgps2', 'Emma', 'Mäkinen', '012870257', 3],
  ['zshgfjrfc1', 'Helmi', 'Mäkinen', '019075721', 4],
  ['rbzmtlvyr3', 'Leo', 'Mäkinen', '016079173', 5],
  ['jrqzpprnj8', 'Isla', 'Mattila', '015364823', 6],
  ['lpzadlwfq8', 'Leo', 'Tuominen', '019473907', 7],
  ['jhythyvgs1', 'Matias', 'Koskinen', '013993418', 8],
  ['ycjveufaa1', 'Veeti', 'Nieminen', '015501652', 1],
  ['khkdkpequ2', 'Aino', 'Järvinen', '017149160', 2],
  ['ybjtinwyy2', 'Toivo', 'Kinnunen', '013605445', 3],
  ['lgpfbzekn8', 'Isla', 'Peltonen', '019170193', 4],
  ['agxldyamh7', 'Oliver', 'Tuominen', '013114118', 5],
  ['nxnitxbde2', 'Kerttu', 'Miettinen', '013728138', 0],
  ['kofnparxk1', 'Isla', 'Kinnunen', '017814674', 6],
  ['ssnvrptcf7', 'Eino', 'Heikkinen', '019823356', 7],
  ['vyflgfkxm3', 'Ilona', 'Kallio', '014054496', 8],
  ['kqknakbub1', 'Pihla', 'Hiltunen', '014725454', 1],
  ['pcrnwafvk0', 'Niilo', 'Mattila', '016002961', 2],
  ['aofnalpok5', 'Aada', 'Savolainen', '014222372', 3],
  ['uwmxgavzr2', 'Venla', 'Kallio', '012417754', 4],
  ['qtkozsyns5', 'Iida', 'Järvinen', '013989123', 5],
  ['qcaqqotmq3', 'Väinö', 'Heikkinen', '019231959', 6],
  ['rnenllxbt2', 'Eino', 'Lindholm', '017428340', 7],
  ['oijuwgxnt9', 'Veeti', 'Leinonen', '019646290', 8],
  ['cindcvcof9', 'Ilona', 'Korhonen', '016890372', 1],
  ['kteyvuywj2', 'Eero', 'Tuominen', '013943834', 0],
  ['kggbpujtr6', 'Oliver', 'Virtanen', '018525469', 2],
  ['pkzoxgacn5', 'Onni', 'Korhonen', '010806056', 3],
  ['ymeyshxqg4', 'Elias', 'Jokinen', '011728661', 4],
  ['yixzjpqmp2', 'Toivo', 'Rantanen', '019492287', 5],
  ['fmnvyebac9', 'Matias', 'Halonen', '018352038', 6],
  ['jqohrqysg3', 'Aino', 'Tuominen', '012403078', 7],
  ['sfxxeemks9', 'Aleksi', 'Leinonen', '010535373', 8],
  ['hgeujgusi5', 'Ilona', 'Aalto', '015682374', 1],
  ['xuqgcfbbr8', 'Toivo', 'Savolainen', '013274434', 2],
  ['chgufxxra2', 'Helmi', 'Koskinen', '012072872', 3],
  ['milbbpvmd8', 'Kerttu', 'Salminen', '016959863', 4],
  ['imdlgpmbr2', 'Aada', 'Järvinen', '015626464', 5],
  ['ewswlvhct7', 'Isla', 'Laine', '011464494', 0],
  ['etbnhurpc6', 'Emma', 'Mäkinen', '014916436', 6],
  ['byceswjzd1', 'Lyydia', 'Mattila', '015958773', 7],
  ['myyzbkysk8', 'Leo', 'Laine', '018728445', 8],
  ['ygwfibgqw5', 'Matias', 'Hämäläinen', '010010166', 1],
  ['ezegxorah7', 'Saana', 'Heikkinen', '016871652', 2],
  ['mveltlxct6', 'Onni', 'Kinnunen', '017270120', 3],
  ['dchbyrgsy2', 'Veeti', 'Karjalainen', '017996777', 4],
  ['jfmgvkwoc2', 'Lyydia', 'Tuominen', '013644775', 5],
  ['hziwztrfq5', 'Venla', 'Ojanen', '010549524', 6],
  ['nsoxcuiqv4', 'Isla', 'Rantanen', '019462080', 7],
  ['rgwdhhsfl5', 'Onni', 'Saarinen', '015817818', 8],
  ['wgrlcuyqh6', 'Matias', 'Mattila', '017951712', 1],
  ['znmrhnxvi7', 'Saana', 'Saarinen', '012352044', 0],
  ['bprsaajyw8', 'Onni', 'Nieminen', '010825692', 2],
  ['kpehurkcj9', 'Elsa', 'Lehtinen', '015483996', 3],
  ['fkztxmjur8', 'Leo', 'Rantanen', '011496877', 4],
  ['ffimljevm0', 'Väinö', 'Laine', '010233598', 5],
  ['noznotwhj6', 'Saana', 'Ojanen', '016875472', 6],
  ['jybnjntzp6', 'Väinö', 'Kallio', '010493670', 7],
  ['gjjhazdxd5', 'Akseli', 'Savolainen', '010638039', 8],
  ['gkljedkhy1', 'Emma', 'Tuominen', '017070275', 1],
  ['smkgawedg1', 'Lauri', 'Lehtinen', '015642942', 2],
  ['prkuvzpqa5', 'Veeti', 'Turunen', '016491595', 3],
  ['ivqklygrl2', 'Akseli', 'Nieminen', '011679586', 4],
  ['ahoqgnrcm8', 'Pihla', 'Järvinen', '017000975', 5],
  ['wwcodaqzc1', 'Iida', 'Hiltunen', '018096713', 0],
  ['vckcjukkt7', 'Lauri', 'Mäkinen', '017674455', 6],
  ['gtnthdtkd2', 'Veeti', 'Lindholm', '011313003', 7],
  ['jgjmmxmsw6', 'Isla', 'Rantanen', '019604665', 8],
  ['nhiputslc6', 'Onni', 'Mäkinen', '017986923', 1],
  ['aaneeqhfy8', 'Matias', 'Nieminen', '011645925', 2],
  ['rdasuwuaz1', 'Isla', 'Koskinen', '013935340', 3],
  ['bkyroenqk1', 'Aada', 'Hämäläinen', '012967454', 4],
  ['dccfmtdkt1', 'Otto', 'Karjalainen', '011998198', 5],
  ['qwkxalyvk7', 'Aleksi', 'Leinonen', '015257197', 6],
  ['euyhzptio1', 'Aada', 'Turunen', '010677994', 7],
  ['ttjddnife4', 'Otto', 'Halonen', '013147239', 8],
  ['alqhnltss5', 'Aada', 'Koskinen', '016622871', 1],
  ['fhlyrubpt7', 'Saana', 'Ojanen', '011157132', 0],
  ['atcvzkuzx9', 'Pihla', 'Ojanen', '013519015', 2],
  ['ydfasyuxe2', 'Matias', 'Miettinen', '017723039', 3],
  ['zunvknrbh2', 'Pihla', 'Halonen', '018989291', 4],
  ['tyfwxyecs2', 'Leo', 'Kinnunen', '019603106', 5],
  ['huscsltfx0', 'Hilla', 'Hämäläinen', '014343719', 6],
  ['vtbmfviqq1', 'Kerttu', 'Lehtinen', '010092711', 7],
  ['fmqfxglwg5', 'Emma', 'Laine', '019606895', 8],
  ['equpwixia8', 'Oliver', 'Järvinen', '012532784', 1],
  ['neteptpgx7', 'Eino', 'Mattila', '012889142', 2],
  ['fpcsbpqbg8', 'Eino', 'Jokinen', '018114895', 3],
  ['jhrcwseld1', 'Veeti', 'Lehtinen', '018345164', 4],
  ['sudvkbkwh5', 'Saana', 'Mäkinen', '014021638', 5],
  ['piszbyvxk0', 'Otto', 'Koskinen', '013304907', 0],
  ['tlmuqnmay5', 'Eero', 'Halonen', '015320668', 6],
  ['lptxtmpiz7', 'Isla', 'Rantanen', '013272128', 7],
  ['vmipmeahe8', 'Sofia', 'Lehtinen', '019058173', 8],
  ['qkvkctoak9', 'Eino', 'Peltonen', '018925564', 1],
  ['guzfgsccj1', 'Leo', 'Savolainen', '019707878', 2],
  ['tjaseqxim8', 'Otto', 'Hämäläinen', '011639136', 3],
  ['rfxrldxjs5', 'Elsa', 'Kinnunen', '012672745', 4],
  ['egdualhan8', 'Helmi', 'Kinnunen', '015846690', 5],
  ['eatrztyby0', 'Veeti', 'Savolainen', '017038912', 6],
  ['jdckvbugx8', 'Lyydia', 'Lehtonen', '018585363', 7],
  ['hlrrxikde8', 'Iida', 'Lehtonen', '019233049', 8],
  ['qvhevlmiu8', 'Veeti', 'Korhonen', '018675035', 1],
  ['nmlzddyng7', 'Niilo', 'Rantanen', '018181996', 0],
  ['jgxkhnilb2', 'Lauri', 'Hiltunen', '014665136', 2],
  ['rtmysgbah6', 'Kerttu', 'Turunen', '010168979', 3],
  ['sdiedmevj9', 'Kerttu', 'Lehtonen', '010462408', 4],
  ['ljjitqqet4', 'Aada', 'Tuominen', '018937176', 5],
  ['wcirojmmn9', 'Veeti', 'Aalto', '012163110', 6],
  ['gwhlkfiwb3', 'Onni', 'Heikkinen', '014486642', 7],
  ['jdubqfeda7', 'Lauri', 'Kinnunen', '013209317', 8],
  ['phtjlgbid2', 'Eino', 'Leinonen', '013124057', 1],
  ['dubkzijbn3', 'Pihla', 'Koskinen', '010418060', 2],
  ['vgighgmzs1', 'Onni', 'Ojanen', '010731539', 3],
  ['pwdbcxnde7', 'Aino', 'Kallio', '015830497', 4],
  ['iwtaqbrva5', 'Lauri', 'Korhonen', '016427891', 5],
  ['utmwwzwis5', 'Hilla', 'Kallio', '016194592', 0],
  ['jqxvapbmy7', 'Hilla', 'Miettinen', '017886573', 6],
  ['xxgkfuvit1', 'Eino', 'Ojanen', '011962769', 7],
  ['kybpnrmop2', 'Helmi', 'Halonen', '019850918', 8],
  ['zgkmtnqbb2', 'Eero', 'Ojanen', '014800350', 1],
  ['fxmwjilfv3', 'Niilo', 'Aalto', '011851203', 2],
  ['dcggdnxyr4', 'Toivo', 'Peltonen', '012129332', 3],
  ['ipvpvanlb1', 'Emma', 'Turunen', '011474570', 4],
  ['tkgmmwoup4', 'Oliver', 'Järvinen', '014126822', 5],
  ['sbbcfydxr1', 'Lyydia', 'Rantanen', '019682482', 6],
  ['ddhedmzjc6', 'Kerttu', 'Miettinen', '013940928', 7],
  ['ariqcxqwu5', 'Kerttu', 'Leinonen', '010977366', 8],
  ['aliklrpgq2', 'Ilona', 'Hämäläinen', '010242911', 1],
  ['tpsuqjvem6', 'Aada', 'Saarinen', '014092434', 0],
  ['syemxncyk8', 'Otto', 'Hiltunen', '011152773', 2],
  ['revbxnzcb6', 'Leo', 'Heikkinen', '013887915', 3],
  ['vozuhksho9', 'Oliver', 'Laine', '012796721', 4],
  ['gthpxyhda9', 'Akseli', 'Hiltunen', '019842166', 5],
  ['goojqjear1', 'Iida', 'Laine', '015943834', 6],
  ['mqgvorgdu5', 'Kerttu', 'Kinnunen', '010892709', 7],
  ['zjiyengtu8', 'Toivo', 'Karjalainen', '016603887', 8],
  ['hzetmmxek3', 'Iida', 'Turunen', '019665629', 1],
  ['ghsdobcdu1', 'Aino', 'Laine', '018165588', 2],
  ['euymbcccq9', 'Aada', 'Jokinen', '016616650', 3],
  ['chuvfpatj1', 'Onni', 'Saarinen', '016478421', 4],
  ['gyvxljzpw5', 'Aada', 'Kinnunen', '013038129', 5],
  ['rkbdqdzmi8', 'Pihla', 'Salminen', '012547602', 0],
  ['azdltlseq1', 'Helmi', 'Jokinen', '011159901', 6],
  ['vuzfhkvwb8', 'Onni', 'Halonen', '017804136', 7],
  ['vyheusvwe0', 'Helmi', 'Rantanen', '018854283', 8],
  ['ubtfacxtr9', 'Aino', 'Kinnunen', '011653779', 1],
  ['djpijjdek2', 'Oliver', 'Lehtinen', '014944548', 2],
  ['kvidnkvdm8', 'Kerttu', 'Saarinen', '018776506', 3],
  ['pfoacpleu9', 'Venla', 'Tuominen', '013977430', 4],
  ['qegyvzssu1', 'Toivo', 'Hiltunen', '011430544', 5],
  ['pgzhjgjit9', 'Akseli', 'Laine', '014683055', 6],
  ['kpavshqaq0', 'Lauri', 'Saarinen', '018849630', 7],
  ['xqevepzmp8', 'Pihla', 'Jokinen', '010742342', 8],
  ['biklewwss1', 'Väinö', 'Kinnunen', '011197520', 1],
]

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
  [DEMO_LARGE_COURSE]: demoLargeRoster.map(([uid, firstNames, lastName, studentNumber]) =>
    student(uid, firstNames, lastName, studentNumber),
  ),
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
