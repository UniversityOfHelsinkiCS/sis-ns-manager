import { useState, useEffect } from 'react'
import axios from 'axios'
import type { CourseUnitRealisation } from '@common/types'
import { CourseCard } from './components/CourseCard'
import './App.css'

export default function App() {
  const [courses, setCourses] = useState<CourseUnitRealisation[]>([])
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const response = await fetch('/api/sis/courses')
      const data: CourseUnitRealisation[] = await response.json()
      setCourses(data.sort((a, b) =>
        (a.activityPeriod.startDate as string).localeCompare(b.activityPeriod.startDate as string)
      ))
    }

    const loadUser = async () => {
      const { data } = await axios.get('/api/user')
      setUsername(data.username)
    }

    load()
    loadUser()
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
        </div>
      </main>
    </div>
  )
}
