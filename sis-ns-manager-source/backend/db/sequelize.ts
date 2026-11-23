import { Sequelize } from "sequelize";
import { COURSES_DB_URL, inLocal } from "../utils/config";

if (!COURSES_DB_URL) {
  throw new Error("COURSES_DB_URL is not defined");
}

export const sequelize = new Sequelize(COURSES_DB_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: inLocal
    ? {}
    : { ssl: { require: true, rejectUnauthorized: true } },
})
