import { Fragment, useState } from 'react'
import type { CourseUnitRealisation, NamespaceInfo } from '@common/types'
import { Modal } from './Modal'
import { formatDate, getActiveUntil, ADMIN_EMAIL } from '../utils'
import { deleteNamespace, errorMessage } from '../util/okdApi'
import './ManageModal.css'

interface Props {
  course: CourseUnitRealisation
  nsName: string
  namespaces: NamespaceInfo[]
  onClose: () => void
  onDeleted: () => void
}

export function ManageModal({ course, nsName, namespaces, onClose, onDeleted }: Props) {
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Per-row deletion of group namespaces: the name of the group namespace whose
  // inline type-to-confirm is currently open, and the text typed into it.
  const [rowConfirm, setRowConfirm] = useState<string | null>(null)
  const [rowInput, setRowInput] = useState('')

  // Namespaces already scheduled for deletion — seeded from the current data
  // (endDate pulled forward well before the normal grace window) and extended
  // optimistically as the user deletes rows, so the table reflects it without
  // waiting on a refetch.
  const isScheduled = (ns: NamespaceInfo) =>
    ns.activeUntil ? new Date(ns.activeUntil) < getActiveUntil(course) : false
  const [scheduled, setScheduled] = useState<Set<string>>(
    () => new Set(namespaces.filter(isScheduled).map(ns => ns.name)),
  )

  // Creation is binary: a course has either one course namespace or a set of
  // group namespaces, never both. The modal follows whichever mode it's in.
  const groupMode = namespaces.length > 0 && namespaces.every(ns => ns.type === 'group')

  // Namespaces not yet scheduled for deletion — the only ones the bulk delete
  // can act on. When none are left there is nothing to confirm.
  const pending = namespaces.filter(ns => !scheduled.has(ns.name))
  const canDelete = pending.length > 0
  const partial = pending.length < namespaces.length

  const displayName = (course.name.fi ?? course.name.en ?? course.id) as string

  const deletionDate = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return formatDate(d)
  })()

  async function handleDelete() {
    setLoading(true)
    setError(null)
    try {
      await Promise.all(pending.map(ns => deleteNamespace(ns.name)))
      onDeleted()
      onClose()
    } catch (err) {
      setError(errorMessage(err, 'Failed to delete namespaces'))
      setLoading(false)
    }
  }

  function startRowConfirm(name: string) {
    setRowConfirm(name)
    setRowInput('')
    setError(null)
  }

  function cancelRowConfirm() {
    setRowConfirm(null)
    setRowInput('')
  }

  async function handleRowDelete(name: string) {
    setLoading(true)
    setError(null)
    try {
      await deleteNamespace(name)
      setScheduled(prev => new Set(prev).add(name))
      cancelRowConfirm()
      onDeleted()
    } catch (err) {
      setError(errorMessage(err, 'Failed to delete namespace'))
    } finally {
      setLoading(false)
    }
  }

  const confirmed = confirmation === nsName

  return (
    <Modal title={`Manage — ${course.id}`} onClose={onClose}>
      <div className="modal-field">
        <span className="modal-field__label">Course</span>
        <span className="modal-field__text">{displayName}</span>
      </div>

      <div className="modal-field">
        <span className="modal-field__label">
          {groupMode ? `Group namespaces (${namespaces.length})` : 'Namespace'}
        </span>
        <table className="ns-table">
          <thead>
            <tr>
              <th>Name</th>
              {groupMode && <th>Group</th>}
              <th>Created</th>
              {groupMode && <th></th>}
            </tr>
          </thead>
          <tbody>
            {namespaces.map(ns => (
              <Fragment key={ns.name}>
                <tr className={scheduled.has(ns.name) ? 'ns-table__row--scheduled' : undefined}>
                  <td><code className="ns-table__name">{ns.name}</code></td>
                  {groupMode && (
                    <td>
                      <span className="ns-badge ns-badge--group">Group {ns.groupNumber}</span>
                    </td>
                  )}
                  <td>{formatDate(ns.created)}</td>
                  {groupMode && (
                    <td className="ns-table__actions">
                      {scheduled.has(ns.name) ? (
                        <span className="ns-table__scheduled">Scheduled</span>
                      ) : (
                        <button
                          className="btn btn--secondary btn--sm"
                          onClick={() => startRowConfirm(ns.name)}
                          disabled={loading || rowConfirm === ns.name}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
                {groupMode && rowConfirm === ns.name && (
                  <tr className="ns-row-confirm-row">
                    <td colSpan={4}>
                      <p className="ns-table__hint">
                        Deleting a group schedules it for removal — it stays
                        available for a 1-day grace period and is permanently
                        deleted tomorrow ({deletionDate}). Type{' '}
                        <code>{ns.name}</code> to confirm.
                      </p>
                      <div className="ns-row-confirm">
                        <input
                          className="ns-row-confirm__input"
                          type="text"
                          placeholder={ns.name}
                          value={rowInput}
                          onChange={e => setRowInput(e.target.value)}
                          disabled={loading}
                          autoFocus
                        />
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => handleRowDelete(ns.name)}
                          disabled={rowInput !== ns.name || loading}
                        >
                          {loading ? 'Deleting…' : 'Delete group'}
                        </button>
                        <button
                          className="btn btn--secondary btn--sm"
                          onClick={cancelRowConfirm}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {canDelete ? (
        <div className="manage-delete">
          <p className="manage-delete__description">
            {groupMode ? (
              <>
                Deleting schedules {partial ? 'the remaining ' : 'all '}
                {pending.length} group namespace{pending.length !== 1 ? 's' : ''} for
                removal. They remain available for a 1-day grace period and are
                permanently deleted tomorrow ({deletionDate}). Type the course
                name below to confirm.
              </>
            ) : (
              <>
                Deleting schedules this namespace for removal. It remains available
                for a 1-day grace period and is permanently deleted tomorrow
                ({deletionDate}). Type the namespace name below to confirm.
              </>
            )}
          </p>
          <code className="modal-field__value">{nsName}</code>
          <input
            className="manage-delete__input"
            type="text"
            placeholder={nsName}
            value={confirmation}
            onChange={e => setConfirmation(e.target.value)}
            disabled={loading}
          />
        </div>
      ) : (
        <p className="manage-delete__none">
          {groupMode
            ? 'All group namespaces are already scheduled for deletion.'
            : 'This namespace is already scheduled for deletion.'}
        </p>
      )}

      {error && (
        <p style={{ color: '#c62828', fontSize: 13, margin: '12px 0 0' }}>{error}</p>
      )}

      <p className="manage-contact">
        Need a change this tool can't make, like reassigning students between
        groups?
        <br />
        Contact{' '}
        <a href={`mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(`Advanced group management — ${course.id}`)}`}>
          {ADMIN_EMAIL}
        </a>.
      </p>

      <div className="modal__footer">
        <button className="btn btn--secondary" onClick={onClose}>
          {canDelete ? 'Cancel' : 'Close'}
        </button>
        {canDelete && (
          <button
            className="btn btn--danger"
            onClick={handleDelete}
            disabled={!confirmed || loading}
          >
            {loading
              ? 'Deleting…'
              : groupMode
              ? partial ? 'Delete remaining groups' : 'Delete all groups'
              : 'Delete namespace'}
          </button>
        )}
      </div>
    </Modal>
  )
}
