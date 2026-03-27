import { useState } from 'react'
import type { Course } from '../types'
import { getMockStudents, getMockNamespaces } from '../mock'
import { getActiveUntil, getPeriodEnd, formatDate, courseNsName } from '../utils'
import { CreateNamespaceModal } from './CreateNamespaceModal'
import { ManageModal } from './ManageModal'
import './CourseCard.css'

interface Props {
  course: Course
}

export function CourseCard({ course }: Props) {
  const students = getMockStudents(course.id)
  const nsName = courseNsName(course)
  const existingNamespaces = getMockNamespaces(course.id)
  const isActive = existingNamespaces.length > 0
  const courseNs = existingNamespaces.find(n => n.type === 'course')
  const activeUntilDate = courseNs?.activeUntil //Active until needs to be encoded somewhere, small localized db for example. 
    ? new Date(courseNs.activeUntil)
    : getActiveUntil(course)
  const activeUntil = formatDate(activeUntilDate)
  const pastCourseEnd = new Date() > getPeriodEnd(course)

  const [open, setCreateOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)

  return (
    <>
      <div className="course-card">
        <div className="course-card__meta">
          <span className="course-card__code">{course.code}</span>
          <span className="course-card__period">{course.year} / Period {course.period}</span>
        </div>
        <div className="course-card__body">
          <h2 className="course-card__name">{course.name}</h2>
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
            <button className="btn btn--primary" onClick={() => setCreateOpen(true)}>
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
