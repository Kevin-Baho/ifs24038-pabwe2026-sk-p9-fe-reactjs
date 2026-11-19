import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PublicArticleDetail from './PublicArticleDetail'

const post = {
  id: 1,
  title: 'Belajar React Hooks',
  slug: 'belajar-react-hooks',
  category: 'Teknologi',
  content: 'Hooks memudahkan state di komponen fungsi.',
  author: { username: 'ubaid' },
  published_at: '2026-03-15T00:00:00Z',
  reading_time: 3,
}

describe('PublicArticleDetail Component', () => {
  it('shows a loading indicator', () => {
    render(<PublicArticleDetail post={null} loading={true} onBack={vi.fn()} />)
    expect(screen.getByTestId('detail-loading')).toBeInTheDocument()
  })

  it('shows a not-found state with a back button', () => {
    const onBack = vi.fn()
    render(<PublicArticleDetail post={null} loading={false} onBack={onBack} />)

    expect(screen.getByTestId('detail-not-found')).toBeInTheDocument()
    expect(screen.getByText('Artikel tidak ditemukan')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Kembali ke Beranda'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('renders the full width article with metadata and the markdown viewer', () => {
    const onBack = vi.fn()
    render(<PublicArticleDetail post={post} loading={false} onBack={onBack} />)

    expect(screen.getByTestId('article-detail')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Belajar React Hooks' })).toBeInTheDocument()
    expect(screen.getByText('Teknologi')).toBeInTheDocument()
    expect(screen.getByText('ubaid')).toBeInTheDocument()
    expect(screen.getByText(/2026/)).toBeInTheDocument()
    expect(screen.getByText('3 menit baca')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Kembali ke daftar artikel'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
