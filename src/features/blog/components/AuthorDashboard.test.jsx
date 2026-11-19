import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AuthorDashboard from './AuthorDashboard'

const posts = [
  {
    id: 1,
    title: 'Artikel Terbit',
    slug: 'artikel-terbit',
    category: 'Teknologi',
    status: 'published',
    published_at: '2026-03-15T00:00:00Z',
  },
  {
    id: 2,
    title: 'Artikel Draf',
    slug: 'artikel-draf',
    category: 'Bisnis',
    status: 'draft',
    created_at: '2026-03-16T00:00:00Z',
  },
  {
    id: 3,
    title: 'Draf Kedua',
    slug: 'draf-kedua',
    category: 'Umum',
    status: 'draft',
    created_at: '2026-03-17T00:00:00Z',
  },
]

const renderDashboard = (overrides = {}) => {
  const props = {
    posts,
    onCreate: vi.fn(),
    onOpenAi: vi.fn(),
    onDetail: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onTogglePublish: vi.fn(),
    ...overrides,
  }
  render(<AuthorDashboard {...props} />)
  return props
}

describe('AuthorDashboard Component', () => {
  it('renders the empty state with zero statistics when there are no posts', () => {
    renderDashboard({ posts: [] })

    expect(screen.getByTestId('author-empty')).toBeInTheDocument()
    expect(screen.getByTestId('stat-total')).toHaveTextContent('0')
    expect(screen.getByTestId('stat-published')).toHaveTextContent('0')
    expect(screen.getByTestId('stat-draft')).toHaveTextContent('0')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('renders statistics and the article table', () => {
    renderDashboard()

    expect(screen.getByTestId('stat-total')).toHaveTextContent('3')
    expect(screen.getByTestId('stat-published')).toHaveTextContent('1')
    expect(screen.getByTestId('stat-draft')).toHaveTextContent('2')

    expect(screen.getByText('Artikel Terbit')).toBeInTheDocument()
    expect(screen.getByText('Artikel Draf')).toBeInTheDocument()
    expect(screen.getByText('Terbit')).toBeInTheDocument()
    expect(screen.getAllByText('Draf')).toHaveLength(2)

    expect(screen.getByLabelText('toggle-publish-1')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByLabelText('toggle-publish-2')).toHaveAttribute('aria-checked', 'false')
  })

  it('triggers create, AI generator and the instant publish toggle', () => {
    const props = renderDashboard()

    fireEvent.click(screen.getByText('Tambah Artikel'))
    expect(props.onCreate).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByText('AI Generator'))
    expect(props.onOpenAi).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByLabelText('toggle-publish-1'))
    expect(props.onTogglePublish).toHaveBeenLastCalledWith(posts[0])

    fireEvent.click(screen.getByLabelText('toggle-publish-2'))
    expect(props.onTogglePublish).toHaveBeenLastCalledWith(posts[1])
  })

  it('opens and closes the kebab menu and runs detail, edit and delete actions', () => {
    const props = renderDashboard()
    const kebab = screen.getByLabelText('kebab-1')

    expect(screen.queryByTestId('kebab-menu-1')).not.toBeInTheDocument()

    // buka lalu tutup dengan klik kebab yang sama
    fireEvent.click(kebab)
    expect(screen.getByTestId('kebab-menu-1')).toBeInTheDocument()
    fireEvent.click(kebab)
    expect(screen.queryByTestId('kebab-menu-1')).not.toBeInTheDocument()

    // Detail
    fireEvent.click(kebab)
    fireEvent.click(screen.getByText('Detail'))
    expect(props.onDetail).toHaveBeenCalledWith(posts[0])
    expect(screen.queryByTestId('kebab-menu-1')).not.toBeInTheDocument()

    // Ubah
    fireEvent.click(kebab)
    fireEvent.click(screen.getByText('Ubah'))
    expect(props.onEdit).toHaveBeenCalledWith(posts[0])
    expect(screen.queryByTestId('kebab-menu-1')).not.toBeInTheDocument()

    // Hapus
    fireEvent.click(kebab)
    fireEvent.click(screen.getByText('Hapus'))
    expect(props.onDelete).toHaveBeenCalledWith(posts[0])
    expect(screen.queryByTestId('kebab-menu-1')).not.toBeInTheDocument()
  })
})
