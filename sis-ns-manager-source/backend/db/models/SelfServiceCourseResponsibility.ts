// Describes the table to application code
import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../sequelize.ts'

export class SelfServiceCourseResponsibility extends Model {
  declare id: number
  declare self_service_course_id: number
  declare responsible_person_id: string
  declare demo_only: boolean
  declare created_at: Date
  declare updated_at: Date
}

SelfServiceCourseResponsibility.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    self_service_course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    responsible_person_id: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: 'self_service_course_responsibilities',
    timestamps: false,
  },
)