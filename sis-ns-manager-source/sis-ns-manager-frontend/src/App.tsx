import { mockCourses } from './mock'
import { CourseCard } from './components/CourseCard'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <span className="app-header__university">University of Helsinki</span>
            <span className="app-header__divider" aria-hidden="true">·</span>
            <span className="app-header__title">sis-namespace-manager</span>
          </div>
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
            {mockCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
