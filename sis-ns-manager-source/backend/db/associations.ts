import { SelfServiceCourse } from './models/SelfServiceCourse.ts'
import { SelfServiceCourseResponsibility } from './models/SelfServiceCourseResponsibility.ts'
import { TrackedNamespace } from './models/TrackedNamespaces.ts'

SelfServiceCourse.hasMany(SelfServiceCourseResponsibility, {
  foreignKey: 'self_service_course_id',
  as: 'responsibilities',
})

SelfServiceCourse.hasMany(TrackedNamespace, {
  foreignKey: 'self_service_course_id',
  as: 'trackedNamespaces',
})

TrackedNamespace.belongsTo(SelfServiceCourse, {
  foreignKey: 'self_service_course_id',
  as: 'selfServiceCourse'
})

SelfServiceCourseResponsibility.belongsTo(SelfServiceCourse, {
  foreignKey: 'self_service_course_id',
})