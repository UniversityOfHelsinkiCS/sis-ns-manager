import { useState } from 'react'
import type { CourseUnitRealisation, NamespaceInfo } from '@common/types'
import { Modal } from './Modal'
import { formatDate } from '../utils'
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
      await Promise.all(namespaces.map(ns => deleteNamespace(ns.name)))
      onDeleted()
    } catch (err) {
      setError(errorMessage(err, 'Failed to delete namespaces'))
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
        <span className="modal-field__label">Namespaces ({namespaces.length})</span>
        <table className="ns-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {namespaces.map(ns => (
              <tr key={ns.name}>
                <td><code className="ns-table__name">{ns.name}</code></td>
                <td>
                  <span className={`ns-badge ns-badge--${ns.type}`}>
                    {ns.type === 'course' ? 'Course' : `Group ${ns.groupNumber}`}
                  </span>
                </td>
                <td>{formatDate(ns.created)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="manage-delete">
        <p className="manage-delete__description">
          Deleting schedules every namespace for this course for removal. They
          remain available for a 1-day grace period and are permanently deleted
          tomorrow ({deletionDate}). Type the namespace name below to confirm.
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

      {error && (
        <p style={{ color: '#c62828', fontSize: 13, margin: '12px 0 0' }}>{error}</p>
      )}

      <div className="modal__footer">
        <button className="btn btn--secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn btn--danger"
          onClick={handleDelete}
          disabled={!confirmed || loading}
        >
          {loading ? 'Deleting…' : 'Delete namespaces'}
        </button>
      </div>
    </Modal>
  )
}
