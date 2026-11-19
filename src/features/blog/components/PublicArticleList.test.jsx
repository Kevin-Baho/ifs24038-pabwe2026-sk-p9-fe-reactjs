import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PublicArticleList from './PublicArticleList'

const posts = [
  {
    id: 1,
    title: 'Belajar React Hooks',
    slug: 'belajar-react-hooks',
    category: 'Teknologi',
    content: '## Pengantar\nHooks memudahkan state di komponen fungsi.',
    author: { username: 'ubaid' },
    published_at: '2026-03-15T00:00:00Z',
  },
  {
    id: 2,
    title: 'Opini Pendidikan Digital',
    slug: 'opini-pendidikan-digital',
    category: 'Pendidikan',
    excerpt: 'Ringkasan eksplisit tentang pendidikan.',
    reading_time: 4,
    author_name: 'siti',
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 3,
    title: 'Tips Startup Bisnis',
    slug: 'tips-startup-bisnis',
    category: 'Bisnis',
    content: 'Mulai dari masalah nyata.',
    published_at: '2026-01-20T00:00:00Z',
  },
]

const renderList = (overrides = {}) => {
  const props = {
    posts,
    loading: false,
    user: null,
    onOpenPost: vi.fn(),
    onNavigate: vi.fn(),
    ...overrides,
  }
  render(<PublicArticleList {...props} />)
  return props
}

describe('PublicArticleList Component', () => {
  it('shows a loading indicator while posts are being fetched', () => {
    renderList({ loading: true })
    expect(screen.getByTestId('posts-loading')).toBeInTheDocument()
    expect(screen.queryByTestId('post-card-1')).not.toBeInTheDocument()
  })

  it('shows the empty state when there are no posts', () => {
    renderList({ posts: [] })
    expect(screen.getByTestId('public-empty')).toBeInTheDocument()
  })

  it('renders cards with excerpt, reading time, author and date, and opens a post', () => {
    const props = renderList()

    expect(screen.getByTestId('post-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('post-card-2')).toBeInTheDocument()
    expect(screen.getByTestId('post-card-3')).toBeInTheDocument()

    // excerpt diturunkan dari konten / memakai excerpt eksplisit
    expect(screen.getByText(/Hooks memudahkan state/)).toBeInTheDocument()
    expect(screen.getByText('Ringkasan eksplisit tentang pendidikan.')).toBeInTheDocument()

    // reading time (turunan 1 menit & eksplisit 4 menit)
    expect(screen.getByText('4 menit baca')).toBeInTheDocument()
    expect(screen.getAllByText('1 menit baca')).toHaveLength(2)

    // penulis: nested author, author_name, fallback
    expect(screen.getByText('ubaid')).toBeInTheDocument()
    expect(screen.getByText('siti')).toBeInTheDocument()
    expect(screen.getByText('Anonim')).toBeInTheDocument()

    // klik judul -> navigasi SPA (default anchor dicegah)
    const notPrevented = fireEvent.click(screen.getByText('Belajar React Hooks'))
    expect(notPrevented).toBe(false)
    expect(props.onOpenPost).toHaveBeenLastCalledWith('belajar-react-hooks')

    // klik "Baca selengkapnya"
    fireEvent.click(screen.getAllByText('Baca selengkapnya →')[1])
    expect(props.onOpenPost).toHaveBeenLastCalledWith('opini-pendidikan-digital')
  })

  it('filters articles in real time by search keyword and category pills', () => {
    renderList()

    const search = screen.getByPlaceholderText('Cari artikel...')

    // cari berdasarkan judul
    fireEvent.change(search, { target: { value: 'hooks' } })
    expect(screen.getByTestId('post-card-1')).toBeInTheDocument()
    expect(screen.queryByTestId('post-card-2')).not.toBeInTheDocument()

    // cari berdasarkan penulis
    fireEvent.change(search, { target: { value: 'siti' } })
    expect(screen.queryByTestId('post-card-1')).not.toBeInTheDocument()
    expect(screen.getByTestId('post-card-2')).toBeInTheDocument()

    // tidak ada hasil
    fireEvent.change(search, { target: { value: 'tidak-ada-artikel-ini' } })
    expect(screen.getByTestId('public-empty')).toBeInTheDocument()

    // bersihkan pencarian
    fireEvent.change(search, { target: { value: '' } })
    expect(screen.getByTestId('post-card-3')).toBeInTheDocument()

    // filter kategori
    fireEvent.click(screen.getByRole('button', { name: 'Pendidikan' }))
    expect(screen.getByRole('button', { name: 'Pendidikan' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('post-card-2')).toBeInTheDocument()
    expect(screen.queryByTestId('post-card-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('post-card-3')).not.toBeInTheDocument()

    // kombinasi kategori + pencarian yang tidak cocok
    fireEvent.change(search, { target: { value: 'hooks' } })
    expect(screen.getByTestId('public-empty')).toBeInTheDocument()

    // kembali ke Semua
    fireEvent.change(search, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Semua' }))
    expect(screen.getByTestId('post-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('post-card-2')).toBeInTheDocument()
    expect(screen.getByTestId('post-card-3')).toBeInTheDocument()
  })

  it('renders all category filter pills', () => {
    renderList()
    ;['Semua', 'Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum'].forEach((name) => {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    })
  })

  it('shows login and register links for guests', () => {
    const props = renderList({ user: null })

    expect(screen.queryByText('Buka Workspace Penulis')).not.toBeInTheDocument()

    const notPrevented = fireEvent.click(screen.getByRole('link', { name: 'Masuk' }))
    expect(notPrevented).toBe(false)
    expect(props.onNavigate).toHaveBeenLastCalledWith('/login')

    fireEvent.click(screen.getByRole('link', { name: 'Daftar' }))
    expect(props.onNavigate).toHaveBeenLastCalledWith('/register')
  })

  it('shows the author workspace link when the user is logged in', () => {
    const props = renderList({ user: { username: 'ubaid', role: 'author' } })

    expect(screen.queryByRole('link', { name: 'Masuk' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Buka Workspace Penulis'))
    expect(props.onNavigate).toHaveBeenLastCalledWith('/author')
  })
})
