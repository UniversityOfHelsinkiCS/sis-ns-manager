import { useState } from 'react'
import type { CourseUnitRealisation, Student } from '@common/types'
import { getActiveUntil, getCourseEndDate, formatDate, courseNsName } from '../utils'
import { CreateNamespaceModal } from './CreateNamespaceModal'
import { ManageModal } from './ManageModal'
import './CourseCard.css'

interface Props {
  course: CourseUnitRealisation
}

export function CourseCard({ course }: Props) {
  const nsName = courseNsName(course)
  const existingNamespaces: import('@common/types').NamespaceInfo[] = []
  const isActive = existingNamespaces.length > 0
  const courseNs = existingNamespaces.find(n => n.type === 'course')
  const activeUntilDate = courseNs?.activeUntil
    ? new Date(courseNs.activeUntil)
    : getActiveUntil(course)
  const activeUntil = formatDate(activeUntilDate)
  const pastCourseEnd = new Date() > getCourseEndDate(course)

  const [open, setCreateOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [students, setStudents] = useState<Student[]>([])

  async function handleCreateOpen() {
    const response = await fetch(`/api/sis/courses/${course.id}/students`)
    const data = await response.json()
    setStudents(data)
    setCreateOpen(true)
  }

  const displayName = (course.name.fi ?? course.name.en ?? course.id) as string
  const startYear = new Date(course.activityPeriod.startDate as string).getFullYear()

  return (
    <>
      <div className="course-card">
        <div className="course-card__meta">
          <h2 className="course-card__name">{displayName}</h2>
          <span className="course-card__period">{startYear}</span>
        </div>
        <div className="course-card__body">
          <a
            href={`https://studies.helsinki.fi/courses/course-implementation/${course.id}`}
            target="_blank"
            rel="noreferrer"
            className="course-card__code"
          >
            Course page
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
          {isActive && (
            <span className={`course-card__active-until${pastCourseEnd ? ' course-card__active-until--expired' : ''}`}>
              Active until {activeUntil}
            </span>
          )}
        </div>
        <div className="course-card__actions">
          {isActive ? (
            <button className="btn btn--manage" onClick={() => setManageOpen(true)}>
              Manage
            </button>
          ) : (
            <button className="btn btn--primary" onClick={handleCreateOpen}>
              Create namespace
            </button>
          )}
        </div>
      </div>

      {open && (
        <CreateNamespaceModal
          course={course}
          nsName={nsName}
          students={students}
          onClose={() => setCreateOpen(false)}
          onCreated={() => setCreateOpen(false)}
        />
      )}
      {manageOpen && (
        <ManageModal
          course={course}
          nsName={nsName}
          namespaces={existingNamespaces}
          onClose={() => setManageOpen(false)}
        />
      )}
    </>
  )
}
