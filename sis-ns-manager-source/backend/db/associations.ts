import { SelfServiceCourse } from './models/SelfServiceCourse.ts'
import { SelfServiceCourseResponsibility } from './models/SelfServiceCourseResponsibility.ts'

SelfServiceCourse.hasMany(SelfServiceCourseResponsibility, {
  foreignKey: 'self_service_course_id',
  as: 'responsibilities',
})

SelfServiceCourseResponsibility.belongsTo(SelfServiceCourse, {
  foreignKey: 'self_service_course_id',
})