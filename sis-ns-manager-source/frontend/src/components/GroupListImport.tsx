import { useState } from 'react'
import type { Student } from '@common/types'
import { parseGroupList, type ParsedGroup } from '../util/groupList'

interface Props {
  students: Student[]
  onApply: (groups: ParsedGroup[]) => void
  disabled?: boolean
}

const PLACEHOLDER = `- name: course-2026-1
  users: [alice, bob]
- name: course-2026-2
  users:
    - carol
    - dave`

// Paste a YAML (or JSON) group list to set group names and assignments in one
// go. Nothing is applied unless the whole list is valid and every user is on
// the course roster.
export function GroupListImport({ students, onApply, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [unknownUsers, setUnknownUsers] = useState<string[]>([])

  function clearResult() {
    setErrors([])
    setUnknownUsers([])
  }

  function handleApply() {
    const result = parseGroupList(text, students)
    if (!result.ok) {
      setErrors(result.errors)
      setUnknownUsers(result.unknownUsers)
      return
    }
    clearResult()
    onApply(result.groups)
    setOpen(false)
  }

  if (!open) {
    return (
      <div>
        <button
          className="btn btn--secondary btn--sm"
          onClick={() => setOpen(true)}
          disabled={disabled}
        >
          Paste group list…
        </button>
      </div>
    )
  }

  return (
    <div className="modal-field group-import">
      <span className="modal-field__label">Paste group list (YAML or JSON)</span>
      <textarea
        className="modal-field__input group-import__text"
        value={text}
        onChange={e => {
          setText(e.target.value)
          clearResult()
        }}
        placeholder={PLACEHOLDER}
        rows={8}
        disabled={disabled}
        spellCheck={false}
        autoComplete="off"
      />
      <p className="modal-note">
        Usernames must be on the course's students list. Students not listed
        stay unassigned. Applying replaces the current groups and clears
        users added by username.
      </p>

      {errors.map(err => (
        <span key={err} className="modal-field__error">{err}</span>
      ))}
      {unknownUsers.length > 0 && (
        <div className="group-import__warning">
          These users aren't in the course's students list:{' '}
          <code>{unknownUsers.join(', ')}</code>
        </div>
      )}

      <div className="group-import__actions">
        <button
          className="btn btn--primary btn--sm"
          onClick={handleApply}
          disabled={disabled || !text.trim()}
        >
          Apply
        </button>
        <button
          className="btn btn--secondary btn--sm"
          onClick={() => {
            setOpen(false)
            clearResult()
          }}
          disabled={disabled}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
