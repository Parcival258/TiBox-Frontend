import { describe, expect, it } from 'vitest'
import type { User } from '../types'
import { unwrapUser } from './usersService'

const user: User = {
  id: 'user-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  role: null,
  permissions: [],
}

describe('usersService', () => {
  it('normalizes supported create and update response shapes', () => {
    expect(unwrapUser({ user })).toEqual(user)
    expect(unwrapUser({ data: { user } })).toEqual(user)
    expect(unwrapUser({ data: user })).toEqual(user)
  })

  it('rejects malformed user responses instead of breaking the users view', () => {
    expect(() => unwrapUser({ data: {} as User })).toThrow(
      'La respuesta del usuario no tiene el formato esperado'
    )
  })
})
