import type { CourseUnitRealisation, NamespaceInfo } from '@common/types'
import './ManageModal.css'
import { Modal } from './Modal'
import { Fragment } from 'react/jsx-runtime'
import { formatDate } from '../utils'

interface Props {
  course: CourseUnitRealisation
  namespaces: NamespaceInfo[]
  onClose: () => void
}

export function ManageSelfProvisionModal({ course, namespaces, onClose }: Props) {
  const displayName = (course.name.fi ?? course.name.en ?? course.id) as string
  const namespacesCreated = namespaces.length > 0

  return (
    <Modal title={`Manage self-provisioning — ${displayName}`} onClose={onClose}>
      <div className="modal-field">
        <span className="modal-field__label">Course</span>
        <span className="modal-field__text">{displayName}</span>
      </div>
      
      <div className="modal-field">
              <span className="modal-field__label">
                {`Self-provisioned namespaces (${namespaces.length})`}
              </span>
              {!namespacesCreated ? (
                <p className="ns-table__hint">No self-provisioned namespaces have been created.</p>
              ) : (
              <table className="ns-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Provisioner</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {namespaces.map(ns => (
                    <Fragment key={ns.name}>
                      <tr>
                        <td><code className="ns-table__name">{ns.name}</code></td>
                        <td>{ns.provisioner}</td>
                        <td>{formatDate(ns.created)}</td>
                        <td className="ns-table__actions">
                          <button
                            className="btn btn--secondary btn--sm"
                          >
                            {'View'}
                          </button>
                              <button
                                className="btn btn--secondary btn--sm"
                              >
                                Delete
                              </button>
                        </td>
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            )}
      </div>
    </Modal>
  )
}