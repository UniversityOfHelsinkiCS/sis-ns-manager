import { useState } from 'react'
import type { CourseUnitRealisation, NamespaceInfo } from '@common/types'
import { Modal } from './Modal'
import { formatDate } from '../utils'
import './ManageModal.css'

interface Props {
  course: CourseUnitRealisation
  nsName: string
  namespaces: NamespaceInfo[]
  onClose: () => void
}

export function ManageModal({ course, nsName, namespaces, onClose }: Props) {
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)

  const displayName = (course.name.fi ?? course.name.en ?? course.id) as string

  function handleDelete() {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onClose()
    }, 1200)
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
          To delete all namespaces for this course, type the namespace name below to confirm.
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
