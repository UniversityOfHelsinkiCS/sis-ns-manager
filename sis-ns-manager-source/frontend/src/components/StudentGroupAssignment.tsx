import type { Student, GroupAssignment } from '@common/types'
import { studentUsername as username, studentName as fullName, byStudentUsername } from '../utils'
import './StudentGroupAssignment.css'

interface Props {
  students: Student[]
  groupCount: number
  assignment: GroupAssignment
  onChange: (assignment: GroupAssignment) => void
  // Number shown for the first group. Display only — assignment values stay
  // 1..groupCount. Used when adding groups after existing ones.
  firstGroupNumber?: number
  // username -> existing namespaces the student already has access to. Such
  // students get a badge and are left out of "Auto-assign evenly".
  groupedIn?: Record<string, string[]>
}

export function autoAssign(students: Student[], groupCount: number): GroupAssignment {
  const result: GroupAssignment = {}
  students.forEach((s, i) => {
    result[s.studentNumber] = (i % groupCount) + 1
  })
  return result
}

export function StudentGroupAssignment({
  students: unsorted,
  groupCount,
  assignment,
  onChange,
  firstGroupNumber = 1,
  groupedIn,
}: Props) {
  const students = [...unsorted].sort(byStudentUsername)
  const groups = Array.from({ length: groupCount }, (_, i) => i + 1)
  const label = (g: number) => g + firstGroupNumber - 1

  const existingGroups = (s: Student) => groupedIn?.[username(s).toLowerCase()] ?? []
  const ungrouped = students.filter(s => existingGroups(s).length === 0)

  function setGroup(studentId: string, group: number) {
    onChange({ ...assignment, [studentId]: group })
  }

  const countPerGroup = groups.map(g =>
    students.filter(s => assignment[s.studentNumber] === g).length
  )

  function badge(s: Student) {
    const existing = existingGroups(s)
    if (existing.length === 0) return null
    const text = `in ${existing.join(', ')}`
    return <span className="sga__student-badge" title={text}>{text}</span>
  }

  return (
    <div className="sga">
      <div className="sga__toolbar">
        <span className="sga__label">
          {students.length} students
          {groupedIn && ` · ${ungrouped.length} not in any group`}
        </span>
        <button
          className="btn btn--secondary btn--sm"
          onClick={() => onChange(autoAssign(ungrouped, groupCount))}
          disabled={ungrouped.length === 0}
        >
          Auto-assign evenly
        </button>
      </div>

      <div className="sga__columns">
        {groups.map((g, gi) => (
          <div key={g} className="sga__group">
            <div className="sga__group-header">
              <span className="sga__group-name">Group {label(g)}</span>
              <span className="sga__group-count">{countPerGroup[gi]}</span>
            </div>
            <ul className="sga__student-list">
              {students.filter(s => assignment[s.studentNumber] === g).map(s => (
                <li key={s.studentNumber} className="sga__student">
                  <span className="sga__student-name">{username(s)}</span>
                  <span className="sga__student-fullname">{fullName(s)}</span>
                  {badge(s)}
                  <select
                    className="sga__student-select"
                    value={assignment[s.studentNumber] ?? 0}
                    onChange={e => setGroup(s.studentNumber, Number(e.target.value))}
                    aria-label={`Move ${username(s)} to group`}
                  >
                    <option value={0}>— unassign</option>
                    {groups.map(opt => (
                      <option key={opt} value={opt}>→ {label(opt)}</option>
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
          {/* When adding groups, some of these are already in an existing
              group (see badges), so "unassigned" would be misleading. */}
          <span className="sga__unassigned-label">{groupedIn ? 'Students' : 'Unassigned'}</span>
          <ul className="sga__unassigned-list">
            {students
              .filter(s => !assignment[s.studentNumber])
              // Students in no group at all (e.g. late registrants) first;
              // the sort is stable, so each part stays alphabetical.
              .sort((a, b) => Number(existingGroups(a).length > 0) - Number(existingGroups(b).length > 0))
              .map(s => (
              <li key={s.studentNumber} className="sga__student">
                <span className="sga__student-name">{username(s)}</span>
                <span className="sga__student-fullname">{fullName(s)}</span>
                {badge(s)}
                <select
                  className="sga__student-select"
                  value={0}
                  onChange={e => setGroup(s.studentNumber, Number(e.target.value))}
                  aria-label={`Assign ${username(s)} to group`}
                >
                  <option value={0}>— assign</option>
                  {groups.map(opt => (
                    <option key={opt} value={opt}>Group {label(opt)}</option>
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
