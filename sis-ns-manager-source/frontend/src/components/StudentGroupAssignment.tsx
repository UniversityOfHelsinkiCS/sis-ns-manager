import type { Student, GroupAssignment } from '@common/types'
import './StudentGroupAssignment.css'

interface Props {
  students: Student[]
  groupCount: number
  assignment: GroupAssignment
  onChange: (assignment: GroupAssignment) => void
}

// The uid (part of eduPersonPrincipalName before '@') — the same identifier the
// backend grants namespace access to. Falls back to the student number.
const username = (s: Student) =>
  s.eduPersonPrincipalName?.split('@')[0] || s.studentNumber

const fullName = (s: Student) =>
  [s.firstNames?.split(' ')[0], s.lastName].filter(Boolean).join(' ')

export function autoAssign(students: Student[], groupCount: number): GroupAssignment {
  const result: GroupAssignment = {}
  students.forEach((s, i) => {
    result[s.studentNumber] = (i % groupCount) + 1
  })
  return result
}

export function StudentGroupAssignment({ students, groupCount, assignment, onChange }: Props) {
  const groups = Array.from({ length: groupCount }, (_, i) => i + 1)

  function setGroup(studentId: string, group: number) {
    onChange({ ...assignment, [studentId]: group })
  }

  const countPerGroup = groups.map(g =>
    students.filter(s => assignment[s.studentNumber] === g).length
  )

  return (
    <div className="sga">
      <div className="sga__toolbar">
        <span className="sga__label">{students.length} students</span>
        <button
          className="btn btn--secondary btn--sm"
          onClick={() => onChange(autoAssign(students, groupCount))}
        >
          Auto-assign evenly
        </button>
      </div>

      <div className="sga__columns">
        {groups.map((g, gi) => (
          <div key={g} className="sga__group">
            <div className="sga__group-header">
              <span className="sga__group-name">Group {g}</span>
              <span className="sga__group-count">{countPerGroup[gi]}</span>
            </div>
            <ul className="sga__student-list">
              {students.filter(s => assignment[s.studentNumber] === g).map(s => (
                <li key={s.studentNumber} className="sga__student">
                  <span className="sga__student-name">{username(s)}</span>
                  <span className="sga__student-fullname">{fullName(s)}</span>
                  <select
                    className="sga__student-select"
                    value={assignment[s.studentNumber] ?? 0}
                    onChange={e => setGroup(s.studentNumber, Number(e.target.value))}
                    aria-label={`Move ${username(s)} to group`}
                  >
                    <option value={0}>— unassign</option>
                    {groups.map(opt => (
                      <option key={opt} value={opt}>→ {opt}</option>
                    ))}
                  </select>
                </li>
              ))}
              {countPerGroup[gi] === 0 && (
                <li className="sga__student sga__student--empty">Empty</li>
              )}
            </ul>
          </div>
        ))}
      </div>

      {students.some(s => !assignment[s.studentNumber]) && (
        <div className="sga__unassigned">
          <span className="sga__unassigned-label">Unassigned</span>
          <ul className="sga__unassigned-list">
            {students.filter(s => !assignment[s.studentNumber]).map(s => (
              <li key={s.studentNumber} className="sga__student">
                <span className="sga__student-name">{username(s)}</span>
                <span className="sga__student-fullname">{fullName(s)}</span>
                <select
                  className="sga__student-select"
                  value={0}
                  onChange={e => setGroup(s.studentNumber, Number(e.target.value))}
                  aria-label={`Assign ${username(s)} to group`}
                >
                  <option value={0}>— assign</option>
                  {groups.map(opt => (
                    <option key={opt} value={opt}>Group {opt}</option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
