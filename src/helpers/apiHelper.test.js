import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import apiHelper from './apiHelper'

const okResponse = (body) => ({ ok: true, json: async () => body })

describe('apiHelper', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('manages access token and user correctly', () => {
    expect(apiHelper.getAccessToken()).toBe('')
    apiHelper.putAccessToken('token-123')
    expect(apiHelper.getAccessToken()).toBe('token-123')
    apiHelper.putAccessToken('')
    expect(apiHelper.getAccessToken()).toBe('')

    expect(apiHelper.getUser()).toBeNull()
    apiHelper.putUser({ username: 'john' })
    expect(apiHelper.getUser()).toEqual({ username: 'john' })
    apiHelper.putUser(null)
    expect(apiHelper.getUser()).toBeNull()
  })

  it('injects the bearer token and merges custom headers', async () => {
    apiHelper.putAccessToken('secret-token')
    const mockFetch = vi.fn().mockResolvedValue(okResponse({ data: 'ok' }))
    vi.stubGlobal('fetch', mockFetch)

    const result = await apiHelper.fetchData('/posts', {
      method: 'GET',
      headers: { 'X-Custom': 'yes' },
    })

    expect(result).toEqual({ data: 'ok' })
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8081/api/posts',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom': 'yes',
          Authorization: 'Bearer secret-token',
        },
      })
    )
  })

  it('does not send an Authorization header when there is no token', async () => {
    const mockFetch = vi.fn().mockResolvedValue(okResponse({ data: 'public' }))
    vi.stubGlobal('fetch', mockFetch)

    await apiHelper.fetchData('/public/posts')

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8081/api/public/posts', {
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('resolves absolute, relative and already prefixed urls', async () => {
    const mockFetch = vi.fn().mockResolvedValue(okResponse({ status: 'success' }))
    vi.stubGlobal('fetch', mockFetch)

    await apiHelper.fetchData('http://localhost:8081/api/test')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8081/api/test', expect.any(Object))

    await apiHelper.fetchData('https://example.com/secure')
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/secure', expect.any(Object))

    await apiHelper.fetchData('custom')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8081/api/custom', expect.any(Object))

    await apiHelper.fetchData('/api/already')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8081/api/already', expect.any(Object))

    await apiHelper.fetchData('/api')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8081/api', expect.any(Object))
  })

  it('reads VITE_API_BASE_URL from env or handles empty, trailing slashes, and /api suffix', async () => {
    const originalViteApi = import.meta.env.VITE_API_BASE_URL
    const mockFetch = vi.fn().mockResolvedValue(okResponse({ ok: true }))
    vi.stubGlobal('fetch', mockFetch)

    delete import.meta.env.VITE_API_BASE_URL
    expect(apiHelper.getBaseUrl()).toBe('')
    await apiHelper.fetchData('/posts')
    expect(mockFetch).toHaveBeenLastCalledWith('/api/posts', expect.any(Object))

    import.meta.env.VITE_API_BASE_URL = 'https://api.example.com/'
    expect(apiHelper.getBaseUrl()).toBe('https://api.example.com')
    await apiHelper.fetchData('/posts')
    expect(mockFetch).toHaveBeenLastCalledWith('https://api.example.com/api/posts', expect.any(Object))

    import.meta.env.VITE_API_BASE_URL = 'https://api.example.com/api'
    expect(apiHelper.getBaseUrl()).toBe('https://api.example.com/api')
    await apiHelper.apiRequest('/posts')
    expect(mockFetch).toHaveBeenLastCalledWith('https://api.example.com/api/posts', expect.any(Object))

    import.meta.env.VITE_API_BASE_URL = originalViteApi
  })

  it('throws response message, response error or a status fallback on non-ok responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 422, json: async () => ({ message: 'Validasi gagal' }) })
    )
    await expect(apiHelper.fetchData('/bad')).rejects.toThrow('Validasi gagal')

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: 'Bad request' }) })
    )
    await expect(apiHelper.fetchData('/bad')).rejects.toThrow('Bad request')

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('invalid json')
        },
      })
    )
    await expect(apiHelper.fetchData('/bad2')).rejects.toThrow('Request failed with status 500')
  })
})
