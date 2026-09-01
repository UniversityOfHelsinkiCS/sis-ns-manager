import { useState } from 'react'
import type { CourseUnitRealisation, NamespaceInfo, Student } from '@common/types'
import { getActiveUntil, getCourseEndDate, formatDate, courseNsName } from '../utils'
import { CreateNamespaceModal } from './CreateNamespaceModal'
import { ManageModal } from './ManageModal'
import useApi from '../util/useApi'
import type { NamespaceSummary } from '../util/okdApi'
import './CourseCard.css'

interface Props {
  course: CourseUnitRealisation
}

export function CourseCard({ course }: Props) {
  const nsName = courseNsName(course)

  const { data, refetch } = useApi<NamespaceSummary[]>(
    'namespaces',
    '/api/okd/namespaces',
    'GET',
  )
  const all = Array.isArray(data) ? data : []

  const existingNamespaces: NamespaceInfo[] = all
    .filter((ns) => ns.name === nsName || ns.name.startsWith(`${nsName}-group-`))
    .map((ns) => {
      const groupMatch = ns.name === nsName ? null : ns.name.match(/-group-(\d+)$/)
      return {
        name: ns.name,
        type: groupMatch ? 'group' : 'course',
        groupNumber: groupMatch ? Number(groupMatch[1]) : undefined,
        created: ns.created,
        activeUntil: ns.endDate ?? undefined,
        studentCount: 0,
      }
    })

  const isActive = existingNamespaces.length > 0
  // Displayed to the user as the namespace's active-until date, always 30 days
  // past the course end — the real annotation (used by the pruner) is set 60
  // days past course end, giving a 30-day grace window where the namespace
  // still exists but is hidden from the UI below.
  const activeUntilDate = getActiveUntil(course)
  const activeUntil = formatDate(activeUntilDate)
  const pastCourseEnd = new Date() > getCourseEndDate(course)
  const hidden = isActive && new Date() > activeUntilDate

  const [open, setCreateOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [students, setStudents] = useState<Student[]>([])

  async function handleCreateOpen() {
    const response = await fetch(`/api/sis/courses/${course.id}/students`)
    const data = await response.json()
    setStudents(data)
    setCreateOpen(true)
  }

  if (hidden) return null

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
          onCreated={() => { refetch(); setCreateOpen(false) }}
        />
      )}
      {manageOpen && (
        <ManageModal
          course={course}
          nsName={nsName}
          namespaces={existingNamespaces}
          onClose={() => setManageOpen(false)}
          onDeleted={() => { refetch(); setManageOpen(false) }}
        />
      )}
    </>
  )
}
