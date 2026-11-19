import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AuthModal from './AuthModal'

describe('AuthModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<AuthModal isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('verifies explicit login form IDs and handles login submit', async () => {
    const onLogin = vi.fn().mockResolvedValue()
    const onClose = vi.fn()

    render(<AuthModal isOpen={true} onClose={onClose} onLogin={onLogin} onRegister={vi.fn()} />)

    const usernameInput = document.getElementById('login-username')
    const passwordInput = document.getElementById('login-password')
    const submitBtn = document.getElementById('login-submit')

    expect(usernameInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
    expect(submitBtn).toBeInTheDocument()

    fireEvent.change(usernameInput, { target: { value: 'user123' } })
    fireEvent.change(passwordInput, { target: { value: 'secret123' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith({ username: 'user123', password: 'secret123' })
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('switches to register tab and submits registration', async () => {
    const onRegister = vi.fn().mockResolvedValue()
    const onClose = vi.fn()

    render(<AuthModal isOpen={true} onClose={onClose} onLogin={vi.fn()} onRegister={onRegister} />)

    fireEvent.click(screen.getByText('Daftar (Register)'))
    expect(screen.getByText('Daftar Akun Baru')).toBeInTheDocument()

    fireEvent.change(screen.getByTestId('input-username'), { target: { value: 'newuser' } })
    fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'new@example.com' } })
    fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'admin' } })

    fireEvent.click(screen.getByTestId('btn-submit-auth'))

    await waitFor(() => {
      expect(onRegister).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        role: 'admin',
      })
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('shows error message on failure and clears it when switching tabs', async () => {
    const onLogin = vi.fn().mockRejectedValue(new Error('Kredensial tidak valid'))
    render(<AuthModal isOpen={true} onClose={vi.fn()} onLogin={onLogin} onRegister={vi.fn()} />)

    fireEvent.change(document.getElementById('login-username'), { target: { value: 'wronguser' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'wrongpass' } })
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(screen.getByText('Kredensial tidak valid')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Daftar (Register)'))
    expect(screen.queryByText('Kredensial tidak valid')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Masuk (Login)'))
    expect(screen.queryByText('Kredensial tidak valid')).not.toBeInTheDocument()
  })

  it('shows a fallback error message and closes via the close button', async () => {
    const onLogin = vi.fn().mockRejectedValue({})
    const onClose = vi.fn()
    render(<AuthModal isOpen={true} onClose={onClose} onLogin={onLogin} onRegister={vi.fn()} />)

    fireEvent.change(document.getElementById('login-username'), { target: { value: 'user' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'pass' } })
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(screen.getByText('Terjadi kesalahan autentikasi.')).toBeInTheDocument()
    })
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Tutup Modal'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
