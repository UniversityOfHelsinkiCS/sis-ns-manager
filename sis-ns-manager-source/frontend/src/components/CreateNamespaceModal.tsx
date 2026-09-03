import { useState } from 'react'
import type { CourseUnitRealisation, Student, GroupAssignment } from '@common/types'
import { StudentGroupAssignment, autoAssign } from './StudentGroupAssignment'
import { Modal } from './Modal'
import { createNamespace, addNamespaceUsers, errorMessage } from '../util/okdApi'
import { getActiveUntil, formatDate } from '../utils'

interface Props {
  course: CourseUnitRealisation
  nsName: string
  students: Student[]
  onClose: () => void
  onCreated: () => void
}

export function CreateNamespaceModal({ course, nsName, students, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createGroups, setCreateGroups] = useState(false)
  const [groupCount, setGroupCount] = useState(4)
  const [assignment, setAssignment] = useState<GroupAssignment>({})

  function handleGroupCountChange(count: number) {
    const n = Math.max(1, Math.min(99, count))
    setGroupCount(n)
    setAssignment(autoAssign(students, n))
  }

  async function handleCreate() {
    setLoading(true)
    setError(null)
    try {
      if (!createGroups) {
        await createNamespace(nsName, course.id)
      } else {
        for (let group = 1; group <= groupCount; group++) {
          const studentNumbers = students
            .filter(s => assignment[s.studentNumber] === group)
            .map(s => s.studentNumber)
          if (studentNumbers.length === 0) continue

          const groupNs = `${nsName}-group-${group}`
          await createNamespace(groupNs, course.id)
          await addNamespaceUsers(groupNs, studentNumbers)
        }
      }
      onCreated()
    } catch (err) {
      setError(errorMessage(err, 'Failed to create namespace'))
      setLoading(false)
    }
  }

  const displayName = (course.name.fi ?? course.name.en ?? course.id) as string
  const nonEmptyGroupCount = Array.from({ length: groupCount }, (_, i) => i + 1)
    .filter(g => students.some(s => assignment[s.studentNumber] === g)).length

  return (
    <Modal title="Create namespace" onClose={onClose}>
      <div className="modal-field">
        <span className="modal-field__label">Course</span>
        <span className="modal-field__text">{displayName}</span>
      </div>
      <div className="modal-field">
        <span className="modal-field__label">Active until</span>
        <span className="modal-field__text">{formatDate(getActiveUntil(course))}</span>
      </div>
      {!createGroups && (
        <>
          <div className="modal-field">
            <span className="modal-field__label">Namespace</span>
            <code className="modal-field__value">{nsName}</code>
          </div>
          <p className="modal-note">You'll be added as admin to this namespace.</p>
        </>
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

          <p className="modal-note">You'll be added as admin to each group namespace.</p>
        </div>
      )}

      {error && (
        <p style={{ color: '#c62828', fontSize: 13, margin: '12px 0 0' }}>{error}</p>
      )}

      <div className="modal__footer">
        <button className="btn btn--secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn btn--primary"
          onClick={handleCreate}
          disabled={loading || (createGroups && nonEmptyGroupCount === 0)}
        >
          {loading
            ? 'Creating…'
            : createGroups
            ? `Create ${nonEmptyGroupCount} group namespace${nonEmptyGroupCount !== 1 ? 's' : ''}`
            : 'Create namespace'}
        </button>
      </div>
    </Modal>
  )
}
