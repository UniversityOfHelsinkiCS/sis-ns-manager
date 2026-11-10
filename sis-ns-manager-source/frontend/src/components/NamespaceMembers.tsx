import { useEffect, useState } from 'react'
import type { Student } from '@common/types'
import { addNamespaceUsernames, getNamespaceUsers, errorMessage } from '../util/okdApi'
import { validateUsername, USERNAME_MAX, studentName } from '../utils'

interface Props {
  name: string
  // False for namespaces already scheduled for deletion: members are view-only.
  canAdd: boolean
  // Course roster keyed by lowercased username, for showing full names. null
  // while it loads or if it couldn't be loaded - usernames are shown alone then.
  roster: Map<string, Student> | null
}

// Members (admin Group users) of one namespace, shown inline in the Manage
// modal, plus an input for granting one more user by username.
export function NamespaceMembers({ name, canAdd, roster }: Props) {
  const [members, setMembers] = useState<string[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getNamespaceUsers(name)
      .then(users => { if (!cancelled) setMembers(users) })
      .catch(err => { if (!cancelled) setLoadError(errorMessage(err, 'Failed to load members')) })
    return () => { cancelled = true }
  }, [name])

  const trimmed = username.trim().toLowerCase()
  const usernameError = trimmed ? validateUsername(trimmed) : null
  const alreadyMember = members?.some(m => m.toLowerCase() === trimmed) ?? false
  const canSubmit = !!trimmed && !usernameError && !alreadyMember && members !== null && !adding

  async function handleAdd() {
    if (!canSubmit) return
    setAdding(true)
    setAddError(null)
    try {
      const granted = await addNamespaceUsernames(name, [trimmed])
      // Merge locally rather than refetch, so the result also shows for the
      // demo user, whose membership data is static.
      setMembers(prev => [...new Set([...(prev ?? []), ...granted])])
      setUsername('')
    } catch (err) {
      setAddError(errorMessage(err, 'Failed to add user'))
    } finally {
      setAdding(false)
    }
  }

  const sorted = [...(members ?? [])].sort((a, b) => a.localeCompare(b))

  return (
    <div className="ns-members">
      {loadError ? (
        <span className="modal-field__error">{loadError}</span>
      ) : members === null ? (
        <span className="ns-members__status">Loading members…</span>
      ) : (
        <>
          <span className="ns-members__label">
            {sorted.length > 0 ? `Members (${sorted.length})` : 'No members'}
          </span>
          {sorted.length > 0 && (
            <div className="modal-roster">
              {sorted.map(member => {
                const student = roster?.get(member.toLowerCase())
                return (
                  <div key={member} className="modal-roster__student">
                    <span className="modal-roster__name">{member}</span>
                    {student && (
                      <span className="modal-roster__fullname">{studentName(student)}</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {canAdd && members !== null && (
        <div className="ns-members__add">
          <div className="modal-manual-users__row">
            <input
              className="modal-field__input"
              type="text"
              placeholder="username"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase())}
              maxLength={USERNAME_MAX}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAdd()
                }
              }}
              disabled={adding}
              spellCheck={false}
              autoComplete="off"
              aria-label={`Add user to ${name}`}
            />
            <button
              className="btn btn--secondary btn--sm"
              onClick={handleAdd}
              disabled={!canSubmit}
            >
              {adding ? 'Adding…' : 'Add'}
            </button>
          </div>
          {trimmed && usernameError && (
            <span className="modal-field__error">{usernameError}</span>
          )}
          {trimmed && !usernameError && alreadyMember && (
            <span className="modal-field__error">Already a member</span>
          )}
          {addError && <span className="modal-field__error">{addError}</span>}
        </div>
      )}
    </div>
  )
}
