const apiHelper = (() => {
  const getBaseUrl = () => {
    return (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
  }

  function getAccessToken() {
    return localStorage.getItem('token') || ''
  }

  function putAccessToken(token) {
    if (!token) {
      localStorage.removeItem('token')
    } else {
      localStorage.setItem('token', token)
    }
  }

  function getUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  function putUser(user) {
    if (!user) {
      localStorage.removeItem('user')
    } else {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }

  async function apiRequest(url, options = {}) {
    const token = getAccessToken()
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    let fullUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      const BASE_URL = getBaseUrl()
      let normalizedPath = url.startsWith('/') ? url : `/${url}`
      if (!normalizedPath.startsWith('/api/') && normalizedPath !== '/api') {
        normalizedPath = `/api${normalizedPath}`
      }
      fullUrl = BASE_URL.endsWith('/api')
        ? `${BASE_URL.slice(0, -4)}${normalizedPath}`
        : `${BASE_URL}${normalizedPath}`
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(result.message || result.error || `Request failed with status ${response.status}`)
    }
    return result
  }

  return {
    getBaseUrl,
    getAccessToken,
    putAccessToken,
    getUser,
    putUser,
    fetchData: apiRequest,
    apiRequest,
  }
})()

export default apiHelper
