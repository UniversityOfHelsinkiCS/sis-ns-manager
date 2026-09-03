import { useState } from 'react'
import type { CourseUnitRealisation, Student, GroupAssignment } from '@common/types'
import { StudentGroupAssignment, autoAssign } from './StudentGroupAssignment'
import { Modal } from './Modal'
import { createNamespace, addNamespaceUsers, errorMessage } from '../util/okdApi'
import { getActiveUntil, formatDate, validateNsName } from '../utils'

interface Props {
  course: CourseUnitRealisation
  nsName: string
  students: Student[]
  onClose: () => void
  onCreated: () => void
}

const INITIAL_GROUPS = 4

// Names for groups 1..count, keeping any the user already edited.
const buildGroupNames = (
  base: string,
  count: number,
  prev: Record<number, string> = {},
): Record<number, string> => {
  const next: Record<number, string> = {}
  for (let g = 1; g <= count; g++) next[g] = prev[g] ?? `${base}-${g}`
  return next
}

export function CreateNamespaceModal({ course, nsName, students, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createGroups, setCreateGroups] = useState(false)
  const [groupCount, setGroupCount] = useState(INITIAL_GROUPS)
  const [assignment, setAssignment] = useState<GroupAssignment>({})

  // User-defined namespace names: one for the single-namespace case, and one per
  // group (keyed by group number) for the group case. Defaulted to the derived
  // course name; fully editable.
  const [name, setName] = useState(nsName)
  const [groupNames, setGroupNames] = useState<Record<number, string>>(() =>
    buildGroupNames(nsName, INITIAL_GROUPS),
  )

  function handleGroupCountChange(count: number) {
    const n = Math.max(1, Math.min(99, count))
    setGroupCount(n)
    setAssignment(autoAssign(students, n))
    setGroupNames(prev => buildGroupNames(nsName, n, prev))
  }

  const groupSizes = Array.from({ length: groupCount }, (_, i) =>
    students.filter(s => assignment[s.studentNumber] === i + 1).length,
  )
  const activeGroups = Array.from({ length: groupCount }, (_, i) => i + 1)
    .filter(g => groupSizes[g - 1] > 0)

  const nameError = validateNsName(name)
  const activeGroupNames = activeGroups.map(g => (groupNames[g] ?? '').trim())
  const duplicateName =
    activeGroupNames.find((n, i) => n && activeGroupNames.indexOf(n) !== i) ?? null
  const groupsValid =
    activeGroups.length > 0 &&
    activeGroups.every(g => !validateNsName(groupNames[g] ?? '')) &&
    !duplicateName

  const canCreate = !loading && (createGroups ? groupsValid : !nameError)

  async function handleCreate() {
    setLoading(true)
    setError(null)
    try {
      if (!createGroups) {
        await createNamespace(name.trim(), course.id)
      } else {
        for (const group of activeGroups) {
          const studentNumbers = students
            .filter(s => assignment[s.studentNumber] === group)
            .map(s => s.studentNumber)

          const groupNs = (groupNames[group] ?? '').trim()
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
            <label className="modal-field__label" htmlFor={`ns-${course.id}`}>
              Namespace name
            </label>
            <input
              id={`ns-${course.id}`}
              className="modal-field__input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value.toLowerCase())}
              disabled={loading}
              spellCheck={false}
              autoComplete="off"
            />
            {nameError && <span className="modal-field__error">{nameError}</span>}
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

          <div className="modal-groups__names">
            {Array.from({ length: groupCount }, (_, i) => i + 1).map(g => {
              const size = groupSizes[g - 1]
              // Validate a group's name once it has students or the user has
              // typed something — the name can be set before any assignment.
              const err =
                size > 0 || (groupNames[g] ?? '').trim()
                  ? validateNsName(groupNames[g] ?? '')
                  : null
              return (
                <div key={g} className="modal-groups__name-row">
                  <label className="modal-groups__name-label" htmlFor={`gn-${course.id}-${g}`}>
                    Group {g} <span className="modal-groups__name-count">· {size}</span>
                  </label>
                  <input
                    id={`gn-${course.id}-${g}`}
                    className="modal-field__input"
                    type="text"
                    value={groupNames[g] ?? ''}
                    onChange={e =>
                      setGroupNames(prev => ({ ...prev, [g]: e.target.value.toLowerCase() }))
                    }
                    disabled={loading}
                    spellCheck={false}
                    autoComplete="off"
                  />
                  {err && <span className="modal-field__error">{err}</span>}
                </div>
              )
            })}
            {duplicateName && (
              <span className="modal-field__error">
                Namespace names must be unique (“{duplicateName}” is repeated)
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
          disabled={!canCreate}
        >
          {loading
            ? 'Creating…'
            : createGroups
            ? `Create ${activeGroups.length} group namespace${activeGroups.length !== 1 ? 's' : ''}`
            : 'Create namespace'}
        </button>
      </div>
    </Modal>
  )
}
