import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AdminDashboard from './AdminDashboard'

const users = [
  { id: 1, username: 'admin', email: 'admin@delcom.org', role: 'admin', total_posts: 5 },
  { id: 2, username: 'penulis1', email: 'penulis1@delcom.org', role: 'author', total_posts: 2 },
]

const posts = [
  {
    id: 10,
    title: 'Artikel Terbit Admin',
    category: 'Teknologi',
    status: 'published',
    author: { username: 'admin' },
    published_at: '2026-03-15T00:00:00Z',
  },
  {
    id: 11,
    title: 'Draf Penulis',
    category: 'Bisnis',
    status: 'draft',
    author_name: 'penulis1',
    created_at: '2026-03-16T00:00:00Z',
  },
]

describe('AdminDashboard Component', () => {
  it('renders empty states for both tables', () => {
    render(<AdminDashboard users={[]} posts={[]} />)

    expect(screen.getByText('Tidak ada data pengguna.')).toBeInTheDocument()
    expect(screen.getByText('Belum ada artikel.')).toBeInTheDocument()
    expect(screen.getByText('Pengguna Sistem (0)')).toBeInTheDocument()
    expect(screen.getByText('Arsip Seluruh Artikel (0)')).toBeInTheDocument()
  })

  it('renders the user monitoring table and the full article archive', () => {
    render(<AdminDashboard users={users} posts={posts} />)

    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument()
    expect(screen.getByText('Panel Pengawasan Administrator')).toBeInTheDocument()
    expect(screen.getByText('Pengguna Sistem (2)')).toBeInTheDocument()
    expect(screen.getByText('Arsip Seluruh Artikel (2)')).toBeInTheDocument()

    const usersBody = within(screen.getByTestId('admin-users-body'))
    expect(usersBody.getByText('penulis1')).toBeInTheDocument()
    expect(usersBody.getByText('penulis1@delcom.org')).toBeInTheDocument()
    // 'admin' muncul sebagai username sekaligus badge peran
    expect(usersBody.getAllByText('admin')).toHaveLength(2)
    expect(usersBody.getByText('author')).toBeInTheDocument()
    expect(usersBody.getByText('5')).toBeInTheDocument()

    const postsBody = within(screen.getByTestId('admin-posts-body'))
    expect(postsBody.getByText('Artikel Terbit Admin')).toBeInTheDocument()
    expect(postsBody.getByText('Draf Penulis')).toBeInTheDocument()
    expect(postsBody.getByText('Terbit')).toBeInTheDocument()
    expect(postsBody.getByText('Draf')).toBeInTheDocument()
    expect(postsBody.getByText('admin')).toBeInTheDocument()
    expect(postsBody.getByText('penulis1')).toBeInTheDocument()
  })
})
