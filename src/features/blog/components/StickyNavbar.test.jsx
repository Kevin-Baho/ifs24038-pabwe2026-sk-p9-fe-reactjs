import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StickyNavbar from './StickyNavbar'

const accents = [
  { id: 'indigo', name: 'Indigo', hex: '#6366f1' },
  { id: 'emerald', name: 'Emerald', hex: '#10b981' },
]

const buildProps = (overrides = {}) => ({
  user: null,
  currentPath: '/',
  onNavigate: vi.fn(),
  onLogout: vi.fn(),
  mode: 'light',
  accent: 'indigo',
  accents,
  onToggleMode: vi.fn(),
  onChangeAccent: vi.fn(),
  ...overrides,
})

describe('StickyNavbar Component', () => {
  it('renders the guest navbar without sidebar and handles navigation, theme and accent', () => {
    const props = buildProps()
    render(<StickyNavbar {...props} />)

    expect(screen.getByTestId('sticky-navbar')).toBeInTheDocument()
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(screen.queryByText('Keluar')).not.toBeInTheDocument()
    expect(screen.queryByText('Workspace Penulis')).not.toBeInTheDocument()
    expect(screen.queryByText('Panel Admin')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Delcom Blog'))
    expect(props.onNavigate).toHaveBeenLastCalledWith('/')

    fireEvent.click(screen.getByRole('button', { name: 'Artikel' }))
    expect(props.onNavigate).toHaveBeenLastCalledWith('/')

    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(props.onNavigate).toHaveBeenLastCalledWith('/login')

    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(props.onNavigate).toHaveBeenLastCalledWith('/register')

    fireEvent.click(screen.getByLabelText('Toggle Mode Gelap Terang'))
    expect(props.onToggleMode).toHaveBeenCalledTimes(1)
    expect(screen.getByTitle('Ganti ke Mode Gelap')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Tema Emerald'))
    expect(props.onChangeAccent).toHaveBeenCalledWith('emerald')
  })

  it('shows the sun toggle title in dark mode', () => {
    render(<StickyNavbar {...buildProps({ mode: 'dark' })} />)
    expect(screen.getByTitle('Ganti ke Mode Terang')).toBeInTheDocument()
  })

  it('renders every home-like path and the author path without errors', () => {
    const paths = ['/', '/public', '/posts/belajar-react', '/author']
    paths.forEach((path) => {
      const { unmount } = render(<StickyNavbar {...buildProps({ currentPath: path })} />)
      expect(screen.getByRole('button', { name: 'Artikel' })).toBeInTheDocument()
      unmount()
    })
  })

  it('renders the author navbar with workspace link, user badge and logout', () => {
    const props = buildProps({
      user: { username: 'penulis', role: 'author' },
      currentPath: '/author',
    })
    render(<StickyNavbar {...props} />)

    expect(screen.getByText('penulis')).toBeInTheDocument()
    expect(screen.getByText('AUTHOR')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Masuk' })).not.toBeInTheDocument()
    expect(screen.queryByText('Panel Admin')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Workspace Penulis'))
    expect(props.onNavigate).toHaveBeenLastCalledWith('/author')

    fireEvent.click(screen.getByText('Keluar'))
    expect(props.onLogout).toHaveBeenCalledTimes(1)
  })

  it('renders the admin navbar with the admin panel link', () => {
    const props = buildProps({
      user: { username: 'admin', role: 'admin' },
      currentPath: '/admin',
    })
    render(<StickyNavbar {...props} />)

    expect(screen.getByText('ADMIN')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Panel Admin'))
    expect(props.onNavigate).toHaveBeenLastCalledWith('/admin')
  })
})
