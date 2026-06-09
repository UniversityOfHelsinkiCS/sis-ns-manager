import { useState } from 'react'
import type { CourseUnitRealisation, Student, GroupAssignment } from '@common/types'
import { StudentGroupAssignment, autoAssign } from './StudentGroupAssignment'
import { Modal } from './Modal'

interface Props {
  course: CourseUnitRealisation
  nsName: string
  students: Student[]
  onClose: () => void
  onCreated: () => void
}

export function CreateNamespaceModal({ course, nsName, students, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false)
  const [createGroups, setCreateGroups] = useState(false)
  const [groupCount, setGroupCount] = useState(4)
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

  const displayName = (course.name.fi ?? course.name.en ?? course.id) as string

  return (
    <Modal title="Create namespace" onClose={onClose}>
      <div className="modal-field">
        <span className="modal-field__label">Course</span>
        <span className="modal-field__text">{displayName}</span>
      </div>
      {!createGroups && (
        <div className="modal-field">
          <span className="modal-field__label">Namespace</span>
          <code className="modal-field__value">{nsName}</code>
        </div>
      )}

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
