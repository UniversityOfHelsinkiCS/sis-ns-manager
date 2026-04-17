import type { Student, GroupAssignment } from '@common/types'
import './StudentGroupAssignment.css'

interface Props {
  students: Student[]
  groupCount: number
  assignment: GroupAssignment
  onChange: (assignment: GroupAssignment) => void
}

export function autoAssign(students: Student[], groupCount: number): GroupAssignment {
  const result: GroupAssignment = {}
  students.forEach((s, i) => {
    result[s.id] = (i % groupCount) + 1
  })
  return result
}

export function StudentGroupAssignment({ students, groupCount, assignment, onChange }: Props) {
  const groups = Array.from({ length: groupCount }, (_, i) => i + 1)

  function setGroup(studentId: string, group: number) {
    onChange({ ...assignment, [studentId]: group })
  }

  const countPerGroup = groups.map(g =>
    students.filter(s => assignment[s.id] === g).length
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
              {students.filter(s => assignment[s.id] === g).map(s => (
                <li key={s.id} className="sga__student">
                  <span className="sga__student-name">{s.name}</span>
                  <select
                    className="sga__student-select"
                    value={assignment[s.id] ?? 0}
                    onChange={e => setGroup(s.id, Number(e.target.value))}
                    aria-label={`Move ${s.name} to group`}
                  >
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

      {students.some(s => !assignment[s.id]) && (
        <div className="sga__unassigned">
          <span className="sga__unassigned-label">Unassigned</span>
          <ul className="sga__unassigned-list">
            {students.filter(s => !assignment[s.id]).map(s => (
              <li key={s.id} className="sga__student">
                <span className="sga__student-name">{s.name}</span>
                <select
                  className="sga__student-select"
                  value={0}
                  onChange={e => setGroup(s.id, Number(e.target.value))}
                  aria-label={`Assign ${s.name} to group`}
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
