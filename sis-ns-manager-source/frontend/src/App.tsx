import { useState, useEffect } from 'react'
import type { CourseUnitRealisation } from '@common/types'
import { CourseCard } from './components/CourseCard'
import './App.css'
import useRequiredUser from './util/useRequiredUser'

export default function App() {
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()

  const [courses, setCourses] = useState<CourseUnitRealisation[]>([])

  const hasAccess = Boolean(user && user.isAllowed)

  useEffect(() => {
    if (!hasAccess) return

    const loadCourses = async () => {
      const response = await fetch('/api/sis/courses')
      const data: CourseUnitRealisation[] = await response.json()
      setCourses(data.sort((a, b) =>
        (a.activityPeriod.startDate as string).localeCompare(b.activityPeriod.startDate as string)
      ))
    }

    loadCourses()
  }, [hasAccess])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <span className="app-header__university">University of Helsinki</span>
            <span className="app-header__divider" aria-hidden="true">·</span>
            <span className="app-header__title">sis-namespace-manager</span>
          </div>
          {user ? (
            <div className="app-header__account">
              <span className="app-header__user">Logged in as: {user.username}</span>
              <button
                className="btn btn--primary btn--sm"
                onClick={() => { window.location.href = '/api/logout' }}
              >
                Log out
              </button>
            </div>
          ) : isUnauthorized ? (
            <div className="app-header__account">
              <span className="app-header__user">Not logged in!</span>
              <button
                className="btn btn--primary btn--sm"
                onClick={() => { window.location.href = '/api/login' }}
              >
                Login
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="app-main">
        <div className="app-main__inner">
          {user && !user.isAllowed ? (
            <div className="access-notice" role="alert">
              <h2 className="access-notice__title">Access required</h2>
              <p className="access-notice__text">
                Your account is not a member of the <code>grp-okd-teachers</code>{' '}
                group, which is required to use this application. Request access
                and try again.
              </p>
            </div>
          ) : hasAccess ? (
            <>
              <div className="page-header">
                <h1 className="page-header__title">Courses</h1>
                <p className="page-header__subtitle">
                  Provision Kubernetes namespaces in the OKD cluster for your courses.
                </p>
              </div>

              <div className="course-grid">
                {courses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  )
}
