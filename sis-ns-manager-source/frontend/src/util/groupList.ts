import { load, FAILSAFE_SCHEMA, YAMLException } from 'js-yaml'
import type { Student } from '@common/types'
import { studentUsername, validateNsName } from '../utils'

// Pasted group list, e.g.
//
//   - name: ohtu-2026-team-a
//     users: [alice, bob]
//
// Parsed with the failsafe schema so every scalar stays a string — otherwise
// YAML would turn usernames like `0123` or `no` into numbers / booleans. JSON
// is valid YAML, so a JSON paste works too.

export const MAX_GROUPS = 99

export interface ParsedGroup {
  name: string
  studentNumbers: string[]
}

export type GroupListResult =
  | { ok: true; groups: ParsedGroup[] }
  | { ok: false; errors: string[]; unknownUsers: string[] }

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

function parseYaml(text: string): { data: unknown } | { error: string } {
  try {
    return { data: load(text, { schema: FAILSAFE_SCHEMA }) }
  } catch (err) {
    if (err instanceof YAMLException) {
      const line = err.mark ? ` at line ${err.mark.line + 1}` : ''
      return { error: `Invalid YAML${line}: ${err.reason}` }
    }
    return { error: 'Invalid YAML' }
  }
}

export function parseGroupList(text: string, students: Student[]): GroupListResult {
  const fail = (errors: string[], unknownUsers: string[] = []): GroupListResult =>
    ({ ok: false, errors, unknownUsers })

  if (!text.trim()) return fail(['Paste a group list first'])

  const parsed = parseYaml(text)
  if ('error' in parsed) return fail([parsed.error])

  const data = parsed.data
  if (!Array.isArray(data) || data.length === 0) {
    return fail(['Expected a list of groups, each with "name" and "users"'])
  }
  if (data.length > MAX_GROUPS) return fail([`Too many groups (max ${MAX_GROUPS})`])

  const byUsername = new Map(students.map(s => [studentUsername(s).toLowerCase(), s.studentNumber]))

  const errors: string[] = []
  const unknownUsers = new Set<string>()
  const seenNames = new Set<string>()
  // username -> 1-based number of the group it was first listed in
  const seenUsers = new Map<string, number>()
  const groups: ParsedGroup[] = []

  data.forEach((entry, i) => {
    const group = i + 1
    if (!isRecord(entry)) {
      errors.push(`Group ${group}: expected "name" and "users"`)
      return
    }

    const name = typeof entry.name === 'string' ? entry.name.trim().toLowerCase() : ''
    const label = name ? `Group ${group} (${name})` : `Group ${group}`
    const nameError = validateNsName(name)
    if (nameError) errors.push(`${label}: name — ${nameError}`)
    else if (seenNames.has(name)) errors.push(`${label}: name is repeated`)
    seenNames.add(name)

    // `users:` with nothing after it parses as "" under the failsafe schema.
    if (!Array.isArray(entry.users)) {
      errors.push(`${label}: "users" must be a list`)
      return
    }

    const studentNumbers: string[] = []
    for (const raw of entry.users) {
      if (typeof raw !== 'string' || !raw.trim()) {
        errors.push(`${label}: every user must be a username`)
        continue
      }
      const username = raw.trim().toLowerCase()
      const firstGroup = seenUsers.get(username)
      if (firstGroup !== undefined) {
        errors.push(
          firstGroup === group
            ? `"${username}" is listed twice in group ${group}`
            : `"${username}" is in both group ${firstGroup} and group ${group}`,
        )
        continue
      }
      seenUsers.set(username, group)

      const studentNumber = byUsername.get(username)
      if (studentNumber === undefined) unknownUsers.add(username)
      else studentNumbers.push(studentNumber)
    }

    groups.push({ name, studentNumbers })
  })

  if (errors.length > 0 || unknownUsers.size > 0) return fail(errors, [...unknownUsers])
  return { ok: true, groups }
}
