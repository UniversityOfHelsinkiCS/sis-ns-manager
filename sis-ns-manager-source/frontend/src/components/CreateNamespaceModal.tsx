import { useState } from 'react'
import type { CourseUnitRealisation, Student, GroupAssignment } from '@common/types'
import { StudentGroupAssignment } from './StudentGroupAssignment'
import { GroupListImport } from './GroupListImport'
import { Modal } from './Modal'
import type { ParsedGroup } from '../util/groupList'
import { createNamespace, addNamespaceUsers, errorMessage } from '../util/okdApi'
import {
  getActiveUntil,
  formatDate,
  validateNsName,
  validateUsername,
  USERNAME_MAX,
  studentUsername,
  studentName,
  byStudentUsername,
} from '../utils'

interface Props {
  course: CourseUnitRealisation
  nsName: string
  students: Student[]
  onClose: () => void
  onCreated: () => void
}

// A teacher-typed username (e.g. a TA not on the roster), plus which of the
// namespaces being created it should be granted admin in. `groups` is unused
// (and ignored at submit) outside group mode, where there's only one target.
interface ManualUser {
  username: string
  groups: number[]
}

const INITIAL_GROUPS = 4

// Fill in default names for groups 1..count, keeping every name the user has
// already edited (including ones above the current count, so lowering then
// raising the count doesn't lose them).
const buildGroupNames = (
  base: string,
  count: number,
  prev: Record<number, string> = {},
): Record<number, string> => {
  const next: Record<number, string> = { ...prev }
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

  // Users added by username rather than picked from the course roster.
  const [manualUsername, setManualUsername] = useState('')
  const [manualUserGroups, setManualUserGroups] = useState<Set<number>>(new Set())
  const [manualUsers, setManualUsers] = useState<ManualUser[]>([])

  function handleGroupCountChange(count: number) {
    const n = Math.max(1, Math.min(99, count))
    setGroupCount(n)
    // Keep existing assignments; only students in a group that no longer exists
    // fall back to unassigned. Never silently (re-)assign the whole class — that
    // is only ever done by the explicit "Auto-assign evenly" button.
    setAssignment(prev => {
      const next: GroupAssignment = {}
      for (const [id, g] of Object.entries(prev)) next[id] = g > n ? 0 : g
      return next
    })
    setGroupNames(prev => buildGroupNames(nsName, n, prev))
  }

  // Replace the whole group setup with a pasted list. Students the list doesn't
  // mention end up unassigned.
  function applyGroupList(groups: ParsedGroup[]) {
    setGroupCount(groups.length)
    setGroupNames(Object.fromEntries(groups.map((g, i) => [i + 1, g.name])))
    const next: GroupAssignment = {}
    groups.forEach((g, i) => {
      for (const sn of g.studentNumbers) next[sn] = i + 1
    })
    setAssignment(next)
    // Manually-added users are tied to group numbers, which now point at
    // different groups - clear them, as the mode toggle does.
    setManualUsers([])
    setManualUsername('')
    setManualUserGroups(new Set())
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

  const trimmedManualUsername = manualUsername.trim().toLowerCase()
  const manualUsernameError = trimmedManualUsername ? validateUsername(trimmedManualUsername) : null
  const manualUsernameTaken = manualUsers.some(u => u.username === trimmedManualUsername)
  const canAddManualUser =
    !!trimmedManualUsername &&
    !manualUsernameError &&
    !manualUsernameTaken &&
    (!createGroups || manualUserGroups.size > 0)

  function toggleManualUserGroup(g: number) {
    setManualUserGroups(prev => {
      const next = new Set(prev)
      if (next.has(g)) next.delete(g)
      else next.add(g)
      return next
    })
  }

  function addManualUser() {
    if (!canAddManualUser) return
    setManualUsers(prev => [
      ...prev,
      { username: trimmedManualUsername, groups: [...manualUserGroups].sort((a, b) => a - b) },
    ])
    setManualUsername('')
    setManualUserGroups(new Set())
  }

  function removeManualUser(username: string) {
    setManualUsers(prev => prev.filter(u => u.username !== username))
  }

  async function handleCreate() {
    setLoading(true)
    setError(null)
    try {
      if (!createGroups) {
        const ns = name.trim()
        await createNamespace(ns, course.id, manualUsers.map(u => u.username))
        const studentNumbers = students.map(s => s.studentNumber).filter(Boolean)
        if (studentNumbers.length > 0) await addNamespaceUsers(ns, studentNumbers)
      } else {
        for (const group of activeGroups) {
          const studentNumbers = students
            .filter(s => assignment[s.studentNumber] === group)
            .map(s => s.studentNumber)
          const groupUsernames = manualUsers
            .filter(u => u.groups.includes(group))
            .map(u => u.username)

          const groupNs = (groupNames[group] ?? '').trim()
          await createNamespace(groupNs, course.id, groupUsernames)
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
  const roster = [...students].sort(byStudentUsername)

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

      <label className="modal-checkbox">
        <input
          type="checkbox"
          checked={createGroups}
          onChange={e => {
            // Manually-added users carry a per-group assignment that only
            // means something in the mode they were added in (empty in single
            // mode, so they'd silently match no group after switching to group
            // mode) - clear them on every switch rather than carry over.
            setCreateGroups(e.target.checked)
            setManualUsers([])
            setManualUsername('')
            setManualUserGroups(new Set())
          }}
        />
        <span>Create group namespaces</span>
      </label>

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

          {roster.length > 0 && (
            <div className="modal-field">
              <span className="modal-field__label">Course students ({roster.length})</span>
              <div className="modal-roster">
                {roster.map(s => (
                  <div key={s.studentNumber} className="modal-roster__student">
                    <span className="modal-roster__name">{studentUsername(s)}</span>
                    <span className="modal-roster__fullname">{studentName(s)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="modal-note">
            You{roster.length > 0 ? ' and all course students' : ''} will be added
            as admin to this namespace.
          </p>
        </>
      )}

      {createGroups && (
        <div className="modal-groups">
          <GroupListImport students={students} onApply={applyGroupList} disabled={loading} />

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

          <StudentGroupAssignment
            students={students}
            groupCount={groupCount}
            assignment={assignment}
            onChange={setAssignment}
          />

          <p className="modal-note">You'll be added as admin to each group namespace.</p>
        </div>
      )}

      <div className="modal-field">
        <span className="modal-field__label">Add users by username</span>
        <p className="modal-note">
          For people outside the course roster, like a teaching assistant —
          granted admin alongside you, by username.
        </p>
        <div className="modal-manual-users__row">
          <input
            className="modal-field__input"
            type="text"
            placeholder="username"
            value={manualUsername}
            onChange={e => setManualUsername(e.target.value.toLowerCase())}
            maxLength={USERNAME_MAX}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addManualUser()
              }
            }}
            disabled={loading}
            spellCheck={false}
            autoComplete="off"
          />
          <button
            className="btn btn--secondary btn--sm"
            onClick={addManualUser}
            disabled={!canAddManualUser || loading}
          >
            Add
          </button>
        </div>
        {trimmedManualUsername && manualUsernameError && (
          <span className="modal-field__error">{manualUsernameError}</span>
        )}
        {trimmedManualUsername && !manualUsernameError && manualUsernameTaken && (
          <span className="modal-field__error">Already added</span>
        )}

        {createGroups && (
          <div className="modal-manual-users__groups">
            {activeGroups.length === 0 ? (
              <span className="modal-note">Assign students to a group first.</span>
            ) : (
              activeGroups.map(g => (
                <label key={g} className="modal-checkbox modal-checkbox--sm">
                  <input
                    type="checkbox"
                    checked={manualUserGroups.has(g)}
                    onChange={() => toggleManualUserGroup(g)}
                  />
                  <span>{(groupNames[g] ?? '').trim() || `Group ${g}`}</span>
                </label>
              ))
            )}
          </div>
        )}

        {manualUsers.length > 0 && (
          <ul className="modal-manual-users__list">
            {manualUsers.map(u => (
              <li key={u.username} className="modal-manual-users__item">
                <span className="modal-manual-users__name">{u.username}</span>
                {createGroups && (
                  <span className="modal-manual-users__item-groups">
                    {u.groups.map(g => (groupNames[g] ?? '').trim() || `Group ${g}`).join(', ')}
                  </span>
                )}
                <button
                  className="btn btn--secondary btn--sm"
                  onClick={() => removeManualUser(u.username)}
                  disabled={loading}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

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
