import { useState } from 'react'
import type { Course, GroupAssignment } from '@common/types'
import { StudentGroupAssignment, autoAssign } from './StudentGroupAssignment'
import { Modal } from './Modal'

interface Props {
  course: Course
  nsName: string
  students: { id: string; name: string; studentNumber: string }[]
  onClose: () => void
  onCreated: () => void
}

export function CreateNamespaceModal({ course, nsName, students, onClose, onCreated }: Props) {
  const defaultGroupCount = Math.max(1, Math.ceil(students.length / 5))

  const [loading, setLoading] = useState(false)
  const [createGroups, setCreateGroups] = useState(false)
  const [groupCount, setGroupCount] = useState(defaultGroupCount)
  const [assignment, setAssignment] = useState<GroupAssignment>({})

  function handleGroupCountChange(count: number) {
    const n = Math.max(1, Math.min(99, count))
    setGroupCount(n)
    setAssignment(autoAssign(students, n))
  }

  function handleCreate() {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onCreated()
    }, 1200)
  }

  return (
    <Modal title="Create namespace" onClose={onClose}>
      <div className="modal-field">
        <span className="modal-field__label">Course</span>
        <span className="modal-field__text">{course.name}</span>
      </div>
      {!createGroups && (
        <div className="modal-field">
          <span className="modal-field__label">Namespace</span>
          <code className="modal-field__value">{nsName}</code>
        </div>
      )}

      <div className="modal-field">
        <span className="modal-field__label">Students ({students.length})</span>
        <ul className="modal-student-list">
          {students.map(s => (
            <li key={s.id} className="modal-student-list__item">
              <span className="modal-student-list__name">{s.name}</span>
              <span className="modal-student-list__number">{s.studentNumber}</span>
            </li>
          ))}
        </ul>
      </div>

      <label className="modal-checkbox">
        <input
          type="checkbox"
          checked={createGroups}
          onChange={e => setCreateGroups(e.target.checked)}
        />
        <span>Create group namespaces</span>
      </label>

      {createGroups && (
        <div className="modal-groups">
          <div className="modal-field modal-field--row">
            <label htmlFor={`gc-${course.id}`} className="modal-field__label">
              Number of groups
            </label>
            <input
              id={`gc-${course.id}`}
              type="number"
              min={1}
              max={99}
              value={groupCount}
              onChange={e => handleGroupCountChange(Number(e.target.value))}
              className="course-card__groups-input"
            />
          </div>

          <StudentGroupAssignment
            students={students}
            groupCount={groupCount}
            assignment={assignment}
            onChange={setAssignment}
          />

          <div className="course-card__groups-ns-preview">
            {Array.from({ length: Math.min(groupCount, 4) }, (_, i) => (
              <span key={i} className="course-card__ns-tag">
                {nsName}-group-{i + 1}
              </span>
            ))}
            {groupCount > 4 && (
              <span className="course-card__ns-tag course-card__ns-tag--more">
                +{groupCount - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="modal__footer">
        <button className="btn btn--secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn btn--primary"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading
            ? 'Creating…'
            : createGroups
            ? `Create ${groupCount} group namespace${groupCount !== 1 ? 's' : ''}`
            : 'Create namespace'}
        </button>
      </div>
    </Modal>
  )
}
