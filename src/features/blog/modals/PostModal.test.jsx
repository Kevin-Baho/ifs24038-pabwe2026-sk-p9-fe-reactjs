import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PostModal from './PostModal'

describe('PostModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<PostModal isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders create mode with an empty form and submits the payload', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()

    render(<PostModal isOpen={true} onClose={onClose} onSave={onSave} />)

    expect(screen.getByText('Tambah Artikel Baru')).toBeInTheDocument()
    expect(screen.getByLabelText('Judul Artikel')).toHaveValue('')
    expect(screen.getByLabelText('Kategori')).toHaveValue('Umum')
    expect(screen.getByLabelText('Status Publikasi')).toHaveValue('draft')
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Judul Artikel'), { target: { value: '  Belajar Vitest  ' } })
    fireEvent.change(screen.getByLabelText('Kategori'), { target: { value: 'Teknologi' } })
    fireEvent.change(screen.getByLabelText('Status Publikasi'), { target: { value: 'published' } })
    fireEvent.change(screen.getByLabelText('Konten Markdown'), {
      target: { value: '## Rencana\n- unit test\n- coverage' },
    })

    fireEvent.click(screen.getByText('Simpan Artikel'))
    expect(onSave).toHaveBeenCalledWith({
      title: 'Belajar Vitest',
      category: 'Teknologi',
      status: 'published',
      content: '## Rencana\n- unit test\n- coverage',
    })

    fireEvent.click(screen.getByText('Batal'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders edit mode with prefilled values and closes via the X button', () => {
    const onClose = vi.fn()
    const existing = {
      id: 5,
      title: 'Artikel Lama',
      content: 'Isi lama',
      category: 'Bisnis',
      status: 'published',
    }

    render(<PostModal isOpen={true} onClose={onClose} onSave={vi.fn()} post={existing} />)

    expect(screen.getByText('Ubah Artikel')).toBeInTheDocument()
    expect(screen.getByLabelText('Judul Artikel')).toHaveValue('Artikel Lama')
    expect(screen.getByLabelText('Konten Markdown')).toHaveValue('Isi lama')
    expect(screen.getByLabelText('Kategori')).toHaveValue('Bisnis')
    expect(screen.getByLabelText('Status Publikasi')).toHaveValue('published')

    fireEvent.click(screen.getByLabelText('Tutup Modal'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('prefills create mode from initialData (AI result) while keeping the create heading', () => {
    const onSave = vi.fn()
    render(
      <PostModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
        post={null}
        initialData={{ title: 'Judul Hasil AI', content: 'Isi hasil AI', category: 'Opini' }}
      />
    )

    expect(screen.getByText('Tambah Artikel Baru')).toBeInTheDocument()
    expect(screen.getByLabelText('Judul Artikel')).toHaveValue('Judul Hasil AI')
    expect(screen.getByLabelText('Konten Markdown')).toHaveValue('Isi hasil AI')
    expect(screen.getByLabelText('Kategori')).toHaveValue('Opini')
    expect(screen.getByLabelText('Status Publikasi')).toHaveValue('draft')

    fireEvent.click(screen.getByText('Simpan Artikel'))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Judul Hasil AI', category: 'Opini', status: 'draft' })
    )
  })
})
