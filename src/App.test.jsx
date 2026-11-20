import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Swal from 'sweetalert2'
import App from './App'
import apiHelper from './helpers/apiHelper'

const API = 'http://localhost:8081/api'

const authorUser = { id: 10, username: 'penulis', role: 'author' }
const adminUser = { id: 1, username: 'admin', role: 'admin' }

const postPublished = {
  id: 1,
  title: 'Belajar React Hooks',
  slug: 'belajar-react-hooks',
  category: 'Teknologi',
  content: 'Hooks memudahkan state di komponen fungsi.',
  status: 'published',
  is_published: true,
  author: { username: 'penulis' },
  published_at: '2026-03-15T00:00:00Z',
}

const postDraft = {
  id: 2,
  title: 'Draf Bisnis Startup',
  slug: 'draf-bisnis-startup',
  category: 'Bisnis',
  content: 'Catatan awal bisnis.',
  status: 'draft',
  is_published: false,
  author: { username: 'penulis' },
  created_at: '2026-03-16T00:00:00Z',
}

const postOpini = {
  id: 3,
  title: 'Opini Pendidikan Digital',
  slug: 'opini-pendidikan-digital',
  category: 'Pendidikan',
  content: 'Teknologi mengubah cara belajar.',
  status: 'published',
  is_published: true,
  author: { username: 'siti' },
  published_at: '2026-02-01T00:00:00Z',
}

const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
})

/**
 * Router fetch palsu. Kunci route: "METHOD /path" (tanpa prefix API).
 * Handler mengembalikan body sukses, atau { __status, message } / { __reject, message } untuk kegagalan.
 */
function createFetch(overrides = {}) {
  const routes = {
    'GET /public/posts': () => ({ data: [postPublished, postOpini] }),
    'GET /public/posts/belajar-react-hooks': () => ({ data: postPublished }),
    'GET /posts': () => ({ data: [postPublished, postDraft] }),
    'POST /posts': (body) => ({ data: { id: 99, ...body } }),
    'PUT /posts/1': (body) => ({ data: { id: 1, ...body } }),
    'DELETE /posts/1': () => ({ data: { message: 'deleted' } }),
    'DELETE /posts/2': () => ({ data: { message: 'deleted' } }),
    'PATCH /posts/1/toggle-publish': () => ({ data: { id: 1, is_published: false, status: 'draft' } }),
    'PATCH /posts/2/toggle-publish': () => ({ data: { id: 2, is_published: true, status: 'published' } }),
    'POST /posts/ai-generate': () => ({
      data: {
        title: 'Judul Hasil AI',
        content: 'Isi artikel hasil AI',
        search_sources: ['https://id.wikipedia.org - Topik AI'],
      },
    }),
    'POST /auth/login': (body) => ({
      data: {
        token: `tok-${body.username}`,
        user: body.username === 'reguser' ? adminUser : authorUser,
      },
    }),
    'POST /auth/register': () => ({ data: { message: 'registered' } }),
    'POST /auth/logout': () => ({ success: true }),
    'GET /admin/users': () => ({
      data: [
        { id: 1, username: 'admin', email: 'admin@delcom.org', role: 'admin', total_posts: 3 },
        { id: 10, username: 'penulis', email: 'penulis@delcom.org', role: 'author', total_posts: 2 },
      ],
    }),
    'GET /admin/posts': () => ({ data: [postPublished, postDraft] }),
    ...overrides,
  }

  return vi.fn((url, options = {}) => {
    const method = options.method || 'GET'
    const key = `${method} ${url.replace(API, '')}`
    const handler = routes[key]
    if (!handler) {
      return Promise.resolve(jsonResponse(404, { message: `Route tidak ada: ${key}` }))
    }
    const out = handler(options.body ? JSON.parse(options.body) : null)
    if (out && out.__reject) return Promise.reject(new Error(out.message))
    if (out && out.__status) return Promise.resolve(jsonResponse(out.__status, { message: out.message }))
    return Promise.resolve(jsonResponse(200, out))
  })
}

const callsOf = (fetchMock, method, path) =>
  fetchMock.mock.calls.filter(
    ([url, options = {}]) => url === `${API}${path}` && (options.method || 'GET') === method
  )

const lastBody = (fetchMock, method, path) => {
  const calls = callsOf(fetchMock, method, path)
  return JSON.parse(calls[calls.length - 1][1].body)
}

const loginAs = (user) => {
  apiHelper.putAccessToken(`tok-${user.username}`)
  apiHelper.putUser(user)
}

const goTo = (path) => window.history.pushState({}, '', path)

describe('App Integration', () => {
  let confirmAnswer

  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-accent')
    vi.restoreAllMocks()
    confirmAnswer = true
    vi.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({ isConfirmed: confirmAnswer }))
    goTo('/')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the guest public view without sidebar, filters, opens an article and navigates auth pages', async () => {
    vi.stubGlobal('fetch', createFetch())
    render(<App />)

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(screen.getByTestId('sticky-navbar')).toBeInTheDocument()
    expect(screen.getByTestId('posts-loading')).toBeInTheDocument()

    expect(await screen.findByText('Belajar React Hooks')).toBeInTheDocument()
    expect(screen.getByText('Opini Pendidikan Digital')).toBeInTheDocument()

    // Pencarian real-time & filter kategori
    const search = screen.getByPlaceholderText('Cari artikel...')
    fireEvent.change(search, { target: { value: 'hooks' } })
    expect(screen.queryByText('Opini Pendidikan Digital')).not.toBeInTheDocument()
    fireEvent.change(search, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Pendidikan' }))
    expect(screen.queryByText('Belajar React Hooks')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Semua' }))
    expect(screen.getByText('Belajar React Hooks')).toBeInTheDocument()

    // Buka artikel -> /posts/:slug
    fireEvent.click(screen.getByText('Belajar React Hooks'))
    expect(await screen.findByTestId('article-detail')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/posts/belajar-react-hooks')
    expect(screen.getByRole('heading', { level: 1, name: 'Belajar React Hooks' })).toBeInTheDocument()

    // Kembali ke daftar
    fireEvent.click(screen.getByText('Kembali ke daftar artikel'))
    expect(await screen.findByTestId('public-article-list')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')

    // popstate (tombol back/forward peramban)
    goTo('/posts/belajar-react-hooks')
    fireEvent(window, new PopStateEvent('popstate'))
    expect(await screen.findByTestId('article-detail')).toBeInTheDocument()
    goTo('/')
    fireEvent(window, new PopStateEvent('popstate'))
    expect(await screen.findByTestId('public-article-list')).toBeInTheDocument()

    // Tema & aksen
    fireEvent.click(screen.getByLabelText('Toggle Mode Gelap Terang'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    fireEvent.click(screen.getByLabelText('Toggle Mode Gelap Terang'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    fireEvent.click(screen.getByLabelText('Tema Emerald'))
    expect(document.documentElement.getAttribute('data-accent')).toBe('emerald')

    // Navbar: Masuk -> /login -> kembali
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(screen.getByText('Masuk ke Delcom Blog')).toBeInTheDocument()
    fireEvent.click(screen.getByText('← Kembali ke Halaman Utama'))
    expect(await screen.findByTestId('public-article-list')).toBeInTheDocument()

    // Link hero: Daftar -> /register -> /login -> kembali
    fireEvent.click(screen.getByRole('link', { name: 'Daftar' }))
    expect(screen.getByText('Daftar Akun Delcom Blog')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Masuk di sini'))
    expect(screen.getByText('Masuk ke Delcom Blog')).toBeInTheDocument()
  })

  it('treats /public and unknown paths as the public article list', async () => {
    vi.stubGlobal('fetch', createFetch())

    goTo('/public')
    const first = render(<App />)
    expect(await screen.findByText('Belajar React Hooks')).toBeInTheDocument()
    first.unmount()

    goTo('/halaman-tidak-dikenal')
    render(<App />)
    expect(await screen.findByText('Opini Pendidikan Digital')).toBeInTheDocument()
  })

  it('shows loading then a not-found state for an unknown article slug', async () => {
    vi.stubGlobal(
      'fetch',
      createFetch({
        'GET /public/posts/missing': () => ({ __status: 404, message: 'Artikel tidak ditemukan' }),
      })
    )
    goTo('/posts/missing')
    render(<App />)

    expect(screen.getByTestId('detail-loading')).toBeInTheDocument()
    expect(await screen.findByTestId('detail-not-found')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Kembali ke Beranda'))
    expect(await screen.findByTestId('public-article-list')).toBeInTheDocument()
  })

  it('handles login, logout, registration (admin) and a failing logout request', async () => {
    let failLogout = false
    const fetchMock = createFetch({
      'POST /auth/logout': () => (failLogout ? { __reject: true, message: 'network down' } : { success: true }),
    })
    vi.stubGlobal('fetch', fetchMock)

    goTo('/login')
    render(<App />)

    // Login sebagai penulis -> /author
    expect(screen.getByText('Masuk ke Delcom Blog')).toBeInTheDocument()
    fireEvent.change(document.getElementById('login-username'), { target: { value: 'penulis' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'password123' } })
    fireEvent.click(document.getElementById('login-submit'))

    expect(await screen.findByTestId('author-dashboard')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/author')
    expect(apiHelper.getAccessToken()).toBe('tok-penulis')
    expect(apiHelper.getUser()).toEqual(authorUser)
    expect(screen.getByText('AUTHOR')).toBeInTheDocument()

    // Logout normal
    fireEvent.click(screen.getByText('Keluar'))
    expect(await screen.findByRole('button', { name: 'Masuk' })).toBeInTheDocument()
    expect(apiHelper.getAccessToken()).toBe('')
    expect(apiHelper.getUser()).toBeNull()
    expect(window.location.pathname).toBe('/')

    // Registrasi sebagai admin -> otomatis login -> /admin
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(screen.getByText('Daftar Akun Delcom Blog')).toBeInTheDocument()
    fireEvent.change(document.getElementById('register-username'), { target: { value: 'reguser' } })
    fireEvent.change(document.getElementById('register-email'), { target: { value: 'reg@delcom.org' } })
    fireEvent.change(document.getElementById('register-password'), { target: { value: 'password123' } })
    fireEvent.change(document.getElementById('register-role'), { target: { value: 'admin' } })
    fireEvent.click(document.getElementById('register-submit'))

    expect(await screen.findByTestId('admin-dashboard')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin')
    expect(lastBody(fetchMock, 'POST', '/auth/register')).toEqual({
      username: 'reguser',
      email: 'reg@delcom.org',
      password: 'password123',
      role: 'admin',
    })

    // Logout tetap membersihkan sesi walau request logout gagal
    failLogout = true
    fireEvent.click(screen.getByText('Keluar'))
    expect(await screen.findByRole('button', { name: 'Masuk' })).toBeInTheDocument()
    expect(apiHelper.getAccessToken()).toBe('')
  })

  it('lets an author manage posts: toggle publish, create, edit, detail, delete and AI generator', async () => {
    loginAs(authorUser)
    goTo('/author')
    const fetchMock = createFetch()
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)

    expect(await screen.findByText('Draf Bisnis Startup')).toBeInTheDocument()
    expect(screen.getByTestId('stat-total')).toHaveTextContent('2')
    expect(screen.getByTestId('stat-published')).toHaveTextContent('1')
    expect(screen.getByTestId('stat-draft')).toHaveTextContent('1')

    // Switch publikasi: Terbit -> Draf, Draf -> Terbit
    fireEvent.click(screen.getByLabelText('toggle-publish-1'))
    await waitFor(() => expect(callsOf(fetchMock, 'PATCH', '/posts/1/toggle-publish')).toHaveLength(1))

    fireEvent.click(screen.getByLabelText('toggle-publish-2'))
    await waitFor(() => expect(callsOf(fetchMock, 'PATCH', '/posts/2/toggle-publish')).toHaveLength(1))

    // Tambah artikel
    fireEvent.click(screen.getByText('Tambah Artikel'))
    expect(screen.getByTestId('post-modal')).toBeInTheDocument()
    expect(screen.getByText('Tambah Artikel Baru')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Judul Artikel'), { target: { value: 'Artikel Baru' } })
    fireEvent.click(screen.getByText('Simpan Artikel'))
    await waitFor(() => expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument())
    expect(lastBody(fetchMock, 'POST', '/posts')).toEqual({
      title: 'Artikel Baru',
      category: 'Umum',
      status: 'draft',
      content: '',
    })

    // Ubah artikel
    fireEvent.click(screen.getByLabelText('kebab-1'))
    fireEvent.click(screen.getByText('Ubah'))
    expect(screen.getByText('Ubah Artikel')).toBeInTheDocument()
    expect(screen.getByLabelText('Judul Artikel')).toHaveValue('Belajar React Hooks')
    fireEvent.change(screen.getByLabelText('Judul Artikel'), { target: { value: 'Belajar React Hooks v2' } })
    fireEvent.click(screen.getByText('Simpan Artikel'))
    await waitFor(() => expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument())
    expect(lastBody(fetchMock, 'PUT', '/posts/1').title).toBe('Belajar React Hooks v2')

    // Detail artikel
    fireEvent.click(screen.getByLabelText('kebab-1'))
    fireEvent.click(screen.getByText('Detail'))
    expect(await screen.findByTestId('article-detail')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/posts/belajar-react-hooks')
    fireEvent.click(screen.getByRole('button', { name: 'Workspace Penulis' }))
    expect(await screen.findByTestId('author-dashboard')).toBeInTheDocument()

    // Hapus: dikonfirmasi
    fireEvent.click(screen.getByLabelText('kebab-2'))
    fireEvent.click(screen.getByText('Hapus'))
    await waitFor(() => expect(callsOf(fetchMock, 'DELETE', '/posts/2')).toHaveLength(1))
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ toast: true, title: 'Artikel berhasil dihapus.' }))
    )

    // Hapus: dibatalkan
    confirmAnswer = false
    fireEvent.click(screen.getByLabelText('kebab-1'))
    fireEvent.click(screen.getByText('Hapus'))
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: 'warning' }))
    )
    expect(callsOf(fetchMock, 'DELETE', '/posts/1')).toHaveLength(0)

    // AI Generator: tutup tanpa menerapkan
    fireEvent.click(screen.getByText('AI Generator'))
    expect(screen.getByTestId('ai-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Tutup'))
    expect(screen.queryByTestId('ai-modal')).not.toBeInTheDocument()

    // AI Generator: hasilkan lalu terapkan ke editor
    fireEvent.click(screen.getByText('AI Generator'))
    fireEvent.change(screen.getByLabelText('Prompt Artikel AI'), { target: { value: 'Topik AI' } })
    fireEvent.click(screen.getByText('Hasilkan via AI'))
    expect(await screen.findByTestId('ai-result-preview')).toBeInTheDocument()
    expect(screen.getByText('https://id.wikipedia.org - Topik AI')).toBeInTheDocument()
    expect(lastBody(fetchMock, 'POST', '/posts/ai-generate')).toEqual({
      prompt: 'Topik AI',
      category: 'Umum',
      include_web_search: true,
    })

    fireEvent.click(screen.getByText('Terapkan ke Editor'))
    expect(await screen.findByTestId('post-modal')).toBeInTheDocument()
    expect(screen.queryByTestId('ai-modal')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Judul Artikel')).toHaveValue('Judul Hasil AI')

    fireEvent.click(screen.getByText('Simpan Artikel'))
    await waitFor(() => expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument())
    const saved = lastBody(fetchMock, 'POST', '/posts')
    expect(saved.title).toBe('Judul Hasil AI')
    expect(saved.content).toContain('Isi artikel hasil AI')
  }, 30000)

  it('reports API failures for save, delete, publish toggle and AI generation', async () => {
    loginAs(authorUser)
    goTo('/author')
    vi.stubGlobal(
      'fetch',
      createFetch({
        'POST /posts': () => ({ __status: 500, message: 'Gagal simpan' }),
        'DELETE /posts/1': () => ({ __status: 500, message: 'Gagal hapus' }),
        'PATCH /posts/1/toggle-publish': () => ({ __status: 500, message: 'Gagal ubah status' }),
        'POST /posts/ai-generate': () => ({ __status: 500, message: 'AI error' }),
      })
    )
    render(<App />)
    expect(await screen.findByText('Draf Bisnis Startup')).toBeInTheDocument()

    // Simpan gagal -> modal tetap terbuka
    fireEvent.click(screen.getByText('Tambah Artikel'))
    fireEvent.change(screen.getByLabelText('Judul Artikel'), { target: { value: 'Artikel Gagal' } })
    fireEvent.click(screen.getByText('Simpan Artikel'))
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Gagal simpan' }))
    )
    expect(screen.getByTestId('post-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Batal'))
    expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument()

    // Hapus gagal
    fireEvent.click(screen.getByLabelText('kebab-1'))
    fireEvent.click(screen.getByText('Hapus'))
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Gagal hapus' }))
    )

    // Toggle publikasi gagal
    fireEvent.click(screen.getByLabelText('toggle-publish-1'))
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Gagal ubah status' }))
    )

    // AI gagal -> tidak ada pratinjau, tombol kembali aktif
    fireEvent.click(screen.getByText('AI Generator'))
    fireEvent.change(screen.getByLabelText('Prompt Artikel AI'), { target: { value: 'gagal' } })
    fireEvent.click(screen.getByText('Hasilkan via AI'))
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'AI error' }))
    )
    await waitFor(() => expect(screen.getByText('Hasilkan via AI')).not.toBeDisabled())
    expect(screen.queryByTestId('ai-result-preview')).not.toBeInTheDocument()
  }, 30000)

  it('falls back to empty lists when the list endpoints fail', async () => {
    loginAs(authorUser)
    goTo('/author')
    vi.stubGlobal(
      'fetch',
      createFetch({
        'GET /public/posts': () => ({ __status: 500, message: 'down' }),
        'GET /posts': () => ({ __status: 500, message: 'down' }),
      })
    )
    render(<App />)

    expect(await screen.findByTestId('author-empty')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Artikel' }))
    expect(await screen.findByTestId('public-empty')).toBeInTheDocument()
  })

  it('renders the admin dashboard for admins and navigates between admin and author areas', async () => {
    loginAs(adminUser)
    goTo('/admin')
    vi.stubGlobal('fetch', createFetch())
    render(<App />)

    expect(await screen.findByTestId('admin-dashboard')).toBeInTheDocument()
    expect(await screen.findByText('penulis@delcom.org')).toBeInTheDocument()
    expect(screen.getByText('Arsip Seluruh Artikel (2)')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Workspace Penulis' }))
    expect(await screen.findByTestId('author-dashboard')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Panel Admin' }))
    expect(await screen.findByTestId('admin-dashboard')).toBeInTheDocument()
  })

  it('denies non-admin users on /admin', async () => {
    loginAs(authorUser)
    goTo('/admin')
    vi.stubGlobal('fetch', createFetch())
    render(<App />)

    expect(await screen.findByTestId('forbidden')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Kembali ke Beranda'))
    expect(await screen.findByTestId('public-article-list')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it('protects /admin and /author for guests with a login modal', async () => {
    vi.stubGlobal('fetch', createFetch())

    // Guest di /admin -> modal login, tutup mengembalikan ke beranda
    goTo('/admin')
    const first = render(<App />)
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    expect(await screen.findByText('Belajar React Hooks')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Tutup Modal'))
    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
    first.unmount()

    // Guest di /author -> login lewat modal -> masuk ke workspace penulis
    goTo('/author')
    render(<App />)
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    fireEvent.change(document.getElementById('login-username'), { target: { value: 'penulis' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'password123' } })
    fireEvent.click(document.getElementById('login-submit'))

    expect(await screen.findByTestId('author-dashboard')).toBeInTheDocument()
    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument()
    expect(window.location.pathname).toBe('/author')
  })
})
