// Describes the tracked_namespaces table to application code
import { DataTypes, Model } from 'sequelize'
import type { SelfServiceCourse } from './SelfServiceCourse.ts'

import { sequelize } from '../sequelize.ts'

export class TrackedNamespace extends Model {
  declare id: number
  declare self_service_course_id: number
  declare provisioner_user_id: string
  declare provisioner_username: string
  declare namespace_name: string
  declare database_requested: boolean
  declare demo_only: boolean
  declare selfServiceCourse?: SelfServiceCourse
  declare created_at: Date
  declare updated_at: Date
}

TrackedNamespace.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    self_service_course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'self_service_courses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    provisioner_user_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    provisioner_username: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    namespace_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    database_requested: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    demo_only: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'tracked_namespaces',
    timestamps: false,
  },
)