import { useState, useEffect } from 'react'
import type { CourseUnitRealisation } from '@common/types'
import { CourseCard } from './components/CourseCard'
import { ADMIN_EMAIL } from './utils'
import './App.css'
import useRequiredUser from './util/useRequiredUser'
import useApi from './util/useApi'

export default function App() {
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()
  const { data: config } = useApi<{ clusterName: string }>('config', '/api/config', 'GET')

  const [courses, setCourses] = useState<CourseUnitRealisation[]>([])
  const [coursesLoaded, setCoursesLoaded] = useState(false)

  const hasAccess = Boolean(user && user.isAllowed)

  useEffect(() => {
    if (!hasAccess) return

    const loadCourses = async () => {
      const response = await fetch('/api/sis/courses')
      const data: CourseUnitRealisation[] = await response.json()
      setCourses(data.sort((a, b) =>
        (a.activityPeriod.startDate as string).localeCompare(b.activityPeriod.startDate as string)
      ))
      setCoursesLoaded(true)
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
            {config?.clusterName ? (
              <span className="app-header__cluster" title="Target cluster">
                {config.clusterName}
              </span>
            ) : null}
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
          {isUserLoading ? null : isUnauthorized ? (
            <div className="access-notice" role="alert">
              <h2 className="access-notice__title">Not logged in</h2>
              <p className="access-notice__text">
                Log in with your University of Helsinki account to provision
                namespaces for your courses.
              </p>
              <button
                className="btn btn--primary btn--sm"
                onClick={() => { window.location.href = '/api/login' }}
              >
                Login
              </button>
            </div>
          ) : user && !user.isAllowed ? (
            <div className="access-notice" role="alert">
              <h2 className="access-notice__title">No privileges</h2>
              <p className="access-notice__text">
                Your account does not have privileges to use this application.
                If you believe this is a mistake, contact{' '}
                <a href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a>.
              </p>
            </div>
          ) : hasAccess ? (
            <>
              <div className="page-header">
                <h1 className="page-header__title">Courses</h1>
                <p className="page-header__subtitle">
                  Provision Kubernetes namespaces in the OKD cluster for your courses.
                  {' '}For advanced group management, contact{' '}
                  <a href={`mailto:${ADMIN_EMAIL}?subject=Advanced group management`}>
                    {ADMIN_EMAIL}
                  </a>.
                </p>
              </div>

              {!coursesLoaded ? null : courses.length === 0 ? (
                <div className="access-notice">
                  <h2 className="access-notice__title">No courses</h2>
                  <p className="access-notice__text">
                    No courses are associated with your account. Only courses
                    where you are listed as a responsible in Sisu show up here. If a
                    course is missing, contact{' '}
                    <a href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a>.
                  </p>
                </div>
              ) : (
                <div className="course-grid">
                  {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>

      <footer className="app-footer">
        <a className="app-footer__link" href="/tietosuojaseloste" target="_blank" rel="noreferrer">
          Tietosuojaseloste
        </a>
      </footer>
    </div>
  )
}
