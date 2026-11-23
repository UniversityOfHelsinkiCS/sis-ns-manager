import axios from 'axios'

export const allowSelfProvisioning = async (
  courseId: string,
  courseName: string,
  startDate: string,
  endDate: string,
  nsPrefix: string,
  usernames: string[] = []
) => {
  const { data } = await axios.post(`/api/db/allow-self-provisioning/${encodeURIComponent(courseId)}`, {
    nsPrefix,
    usernames,
    courseName,
    startDate,
    endDate
  })
  return data
}

export const errorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string })?.message ?? err.message
  }
  return fallback
}
