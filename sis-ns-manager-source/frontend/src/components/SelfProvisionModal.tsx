import { useState } from 'react'
import type { CourseUnitRealisation } from '@common/types'
import { Modal } from './Modal'
import { allowSelfProvisioning } from '../util/dbApi'
import {
  validateNsPrefix,
  validateUsername,
  USERNAME_MAX,
} from '../utils'

interface Props {
  course: CourseUnitRealisation
  nsPrefix: string
  onClose: () => void
  onCreated: () => void
}

// Can be used to add e.g. TAs as admins to all student-provisioned namespaces
interface ManualUser {
  username: string
}


export function SelfProvisionModal({ course, nsPrefix, onClose, onCreated }: Props) {
  const [name, setPrefix] = useState(nsPrefix)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [manualUsername, setManualUsername] = useState('')
  const [manualUsers, setManualUsers] = useState<ManualUser[]>([])

  const prefixError = validateNsPrefix(name)

  const canCreate = !loading && !prefixError

  const trimmedManualUsername = manualUsername.trim().toLowerCase()
  const manualUsernameError = trimmedManualUsername ? validateUsername(trimmedManualUsername) : null
  const manualUsernameTaken = manualUsers.some(user => user.username === trimmedManualUsername)
  const canAddManualUser =
    !!trimmedManualUsername &&
    !manualUsernameError &&
    !manualUsernameTaken
  
  function addManualUser() {
    if (!canAddManualUser) return
    setManualUsers(prev => [...prev, { username: trimmedManualUsername }])
    setManualUsername('')
  }

  function removeManualUser(username: string) {
    setManualUsers(prev => prev.filter(user => user.username !== username))
  }

  async function handleSelfProvisionAllow(courseName: string, nsPrefix: string) {
    setLoading(true)
    setError(null)
    try {
      await allowSelfProvisioning(
        course.id,
        courseName,
        course.activityPeriod.startDate as string,
        course.activityPeriod.endDate as string,
        nsPrefix,
        manualUsers.map(user => user.username)
      )
      onCreated()
    } catch (err) {
      setError((err as Error).message)
    }
    setLoading(false)
  }

  const displayName = (course.name.fi ?? course.name.en ?? course.id) as string

  return (
    <Modal title={`Allow self-provisioning for ${displayName}`}
      onClose={onClose}
    >
      <div className="modal-field">
        <span className="modal-field__label">Info</span>
        <span className="modal-field__text">
          By selecting this option, you will be allowing students to self-provision namespaces for this course.{' '}
          Note that enrollment on the course <u>is not required</u> for students to self-provision namespaces!
        </span>
      </div>
      <div className="modal-field">
        <span className="modal-field__label">Course</span>
        <span className="modal-field__text">{displayName}</span>
      </div>
      <div className="modal-field">
        <span className="modal-field__label">Namespace prefix</span>
        <span className="modal-note">All student-provisioned namespaces will start with this prefix.</span>
        <input
          id={`ns-${course.id}`}
          className="modal-field__input"
          type="text"
          value={name}
          onChange={e => setPrefix(e.target.value.toLowerCase())}
          disabled={loading}
          spellCheck={false}
          autoComplete="off"
        />
        {prefixError && <span className="modal-field__error">{prefixError}</span>}
      </div>
      <div className="modal-field">
        <span className="modal-field__label">Add namespace admins</span>
        <p className="modal-note">
          You will be granted admin access to all student-provisioned namespaces for this course.{' '}
          If additional users&mdash;such as teaching assistants&mdash;should also have admin access,{' '}
          you can add them here by specifying their usernames.
        </p>
        <div className="modal-manual-users__row">
          <input
            className="modal-field__input"
            type="text"
            placeholder="username"
            value={manualUsername}
            onChange={e => setManualUsername(e.target.value.toLocaleLowerCase())}
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

        {manualUsers.length > 0 && (
          <ul className="modal-manual-users__list">
            {manualUsers.map(user => (
              <li key={user.username} className="modal-manual-users__item">
                <span className="modal-manual-users__name">{user.username}</span>
                <button
                  className="btn btn--secondary btn--sm"
                  onClick={() => removeManualUser(user.username)}
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
          onClick={() => handleSelfProvisionAllow(displayName, name.trim())}
          disabled={!canCreate}
        >
          {loading
            ? 'Contacting database…'
            : 'Allow self-provisioning'}
        </button>
      </div>
    </Modal>
  )
}
