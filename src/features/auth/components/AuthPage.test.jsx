import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AuthPage from './AuthPage'

const fillLogin = (username, password) => {
  fireEvent.change(document.getElementById('login-username'), { target: { value: username } })
  fireEvent.change(document.getElementById('login-password'), { target: { value: password } })
}

describe('AuthPage Component', () => {
  it('defaults to login mode with the standardized form ids and submits credentials', async () => {
    const handleLogin = vi.fn().mockResolvedValue({})
    const handleNavigate = vi.fn()

    render(<AuthPage onLogin={handleLogin} onRegister={vi.fn()} onNavigate={handleNavigate} />)

    expect(screen.getByText('Masuk ke Delcom Blog')).toBeInTheDocument()
    expect(document.getElementById('login-username')).toBeInTheDocument()
    expect(document.getElementById('login-password')).toBeInTheDocument()
    expect(document.getElementById('login-submit')).toBeInTheDocument()

    fillLogin('johndoe', 'secret123')
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(handleLogin).toHaveBeenCalledWith({ username: 'johndoe', password: 'secret123' })
    })
    await waitFor(() => {
      expect(document.getElementById('login-submit')).not.toBeDisabled()
    })
    // Navigasi pasca login ditangani App, bukan AuthPage
    expect(handleNavigate).not.toHaveBeenCalled()

    // Pindah ke register
    fireEvent.click(screen.getByText('Daftar di sini'))
    expect(handleNavigate).toHaveBeenCalledWith('/register')

    // Kembali ke beranda
    fireEvent.click(screen.getByText('← Kembali ke Halaman Utama'))
    expect(handleNavigate).toHaveBeenCalledWith('/')
  })

  it('renders register mode and submits registration including the role', async () => {
    const handleRegister = vi.fn().mockResolvedValue({})
    const handleNavigate = vi.fn()

    render(
      <AuthPage mode="register" onLogin={vi.fn()} onRegister={handleRegister} onNavigate={handleNavigate} />
    )

    expect(screen.getByText('Daftar Akun Delcom Blog')).toBeInTheDocument()

    fireEvent.change(document.getElementById('register-username'), { target: { value: 'janedoe' } })
    fireEvent.change(document.getElementById('register-email'), { target: { value: 'jane@example.com' } })
    fireEvent.change(document.getElementById('register-password'), { target: { value: 'password123' } })
    fireEvent.change(document.getElementById('register-role'), { target: { value: 'admin' } })
    fireEvent.click(document.getElementById('register-submit'))

    await waitFor(() => {
      expect(handleRegister).toHaveBeenCalledWith({
        username: 'janedoe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'admin',
      })
    })

    fireEvent.click(screen.getByText('Masuk di sini'))
    expect(handleNavigate).toHaveBeenCalledWith('/login')
  })

  it('shows the error message when login fails', async () => {
    const handleLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'))

    render(<AuthPage mode="login" onLogin={handleLogin} onRegister={vi.fn()} onNavigate={vi.fn()} />)

    fillLogin('johndoe', 'wrongpass')
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('auth-error-msg')).toHaveTextContent('Invalid credentials')
    })
  })

  it('shows a fallback error message when the error has no message', async () => {
    const handleLogin = vi.fn().mockRejectedValue({})

    render(<AuthPage mode="login" onLogin={handleLogin} onRegister={vi.fn()} onNavigate={vi.fn()} />)

    fillLogin('user1', 'pass1')
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('auth-error-msg')).toHaveTextContent('Terjadi kesalahan autentikasi.')
    })
  })
})
