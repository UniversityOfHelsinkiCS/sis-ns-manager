// Describes the table to application code
import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../sequelize.ts'

export class SelfServiceCourse extends Model {
  declare id: number
  declare course_unit_realisation_code: string
  declare source_course_name: string
  declare start_date: string
  declare end_date: string
  declare self_service_enabled: boolean
  declare allowing_teacher_username: string | null
  declare demo_only: boolean
  declare ns_prefix: string
  declare created_at: Date
  declare updated_at: Date
}

SelfServiceCourse.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    course_unit_realisation_code: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    source_course_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    self_service_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    allowing_teacher_username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    demo_only: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    ns_prefix: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'self_service_courses',
    timestamps: false,
  },
)