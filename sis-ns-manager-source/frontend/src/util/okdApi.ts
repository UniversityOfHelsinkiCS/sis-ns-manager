import axios from 'axios'

export type NamespaceSummary = {
  name: string
  created: string
  endDate: string | null
  course: string | null
}

export const createNamespace = (name: string, courseId: string) =>
  axios.post(`/api/okd/namespaces/${encodeURIComponent(name)}`, { courseId })

export const addNamespaceUsers = (name: string, studentNumbers: string[]) =>
  axios.post(`/api/okd/namespaces/${encodeURIComponent(name)}/users`, {
    studentNumbers,
  })

export const deleteNamespace = (name: string) =>
  axios.delete(`/api/okd/namespaces/${encodeURIComponent(name)}`)

// Extracts a user-facing message from an axios error (the backend sends
// { message }), falling back to a generic string.
export const errorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string })?.message ?? err.message
  }
  return fallback
}
