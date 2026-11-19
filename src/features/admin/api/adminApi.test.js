import { describe, it, expect, vi, beforeEach } from 'vitest'
import adminApi from './adminApi'
import apiHelper from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  default: {
    fetchData: vi.fn(),
  },
}))

describe('adminApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches users and falls back to an empty list when data is null', async () => {
    apiHelper.fetchData.mockResolvedValueOnce({ data: [{ id: 1, username: 'admin' }] })
    expect(await adminApi.getUsers()).toEqual([{ id: 1, username: 'admin' }])
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/admin/users')

    apiHelper.fetchData.mockResolvedValueOnce({ data: null })
    expect(await adminApi.getUsers()).toEqual([])
  })

  it('fetches all posts and falls back to an empty list when data is null', async () => {
    apiHelper.fetchData.mockResolvedValueOnce({ data: [{ id: 10, title: 'Post' }] })
    expect(await adminApi.getPosts()).toEqual([{ id: 10, title: 'Post' }])
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/admin/posts')

    apiHelper.fetchData.mockResolvedValueOnce({ data: null })
    expect(await adminApi.getPosts()).toEqual([])
  })
})
