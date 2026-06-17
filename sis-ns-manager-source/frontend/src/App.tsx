import { useState, useEffect } from 'react'
import axios from 'axios'
import type { CourseUnitRealisation } from '@common/types'
import { CourseCard } from './components/CourseCard'
import './App.css'
import useRequiredUser from './util/useRequiredUser'
import { RedirectToLogin } from './util/redirectToLogin'

export default function App() {
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()

  const [courses, setCourses] = useState<CourseUnitRealisation[]>([])
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await axios.get('/api/user')
        setUsername(data.username)
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          window.location.href = '/login'
          return
        }
        throw error
      }

      const response = await fetch('/api/sis/courses')
      const data: CourseUnitRealisation[] = await response.json()
      setCourses(data.sort((a, b) =>
        (a.activityPeriod.startDate as string).localeCompare(b.activityPeriod.startDate as string)
      ))
    }

    init()
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <span className="app-header__university">University of Helsinki</span>
            <span className="app-header__divider" aria-hidden="true">·</span>
            <span className="app-header__title">sis-namespace-manager</span>
          </div>
          {username && (
            <span className="app-header__user">Logged in as: {username}</span>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="app-main__inner">
          {!isUserLoading && user && !user.isAllowed ? (
            <div className="access-notice" role="alert">
              <h2 className="access-notice__title">Access required</h2>
              <p className="access-notice__text">
                Your account is not a member of the <code>grp-okd-teachers</code>{' '}
                group, which is required to use this application. Request access
                and try again.
              </p>
            </div>
          ) : (
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
          )}
        </div>
      </main>
    </div>
  )
}
