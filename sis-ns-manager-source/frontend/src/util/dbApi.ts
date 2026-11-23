import axios from 'axios'

/*
  declare course_unit_realisation_code: string
  declare source_course_name: string
  declare start_date: string
  declare end_date: string
  declare self_service_enabled: boolean
  declare demo_only: boolean
  declare ns_prefix: string
*/

export const allowSelfProvisioning = async (
  courseId: string,
  courseName: string,
  startDate: string,
  endDate: string,
  demoOnly: boolean,
  nsPrefix: string,
  usernames: string[] = []
) => {
  const { data } = await axios.post(`/api/db/allow-self-provisioning/${encodeURIComponent(courseId)}`, {
    nsPrefix,
    usernames,
    courseName,
    startDate,
    endDate,
    demoOnly
  })
  return data
}

export const errorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string })?.message ?? err.message
  }
  return fallback
}
