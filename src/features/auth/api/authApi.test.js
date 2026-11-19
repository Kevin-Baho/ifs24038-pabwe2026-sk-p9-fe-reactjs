import { describe, it, expect, vi, beforeEach } from 'vitest'
import authApi from './authApi'
import apiHelper from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  default: {
    fetchData: vi.fn(),
  },
}))

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls login, register, logout, and getProfile successfully', async () => {
    apiHelper.fetchData.mockResolvedValueOnce({ data: { token: 't1', user: { id: 1 } } })
    const loginRes = await authApi.login('user', 'pass')
    expect(loginRes).toEqual({ token: 't1', user: { id: 1 } })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'user', password: 'pass' }),
    })

    apiHelper.fetchData.mockResolvedValueOnce({ data: { message: 'registered' } })
    const regRes = await authApi.register('user', 'email@delcom.org', 'pass', 'author')
    expect(regRes).toEqual({ message: 'registered' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: 'user', email: 'email@delcom.org', password: 'pass', role: 'author' }),
    })

    apiHelper.fetchData.mockResolvedValueOnce({ data: { message: 'bye' } })
    expect(await authApi.logout()).toEqual({ message: 'bye' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/auth/logout', { method: 'POST' })

    apiHelper.fetchData.mockResolvedValueOnce({ data: { id: 1, username: 'user' } })
    const profRes = await authApi.getProfile()
    expect(profRes).toEqual({ id: 1, username: 'user' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/auth/profile')
  })
})
