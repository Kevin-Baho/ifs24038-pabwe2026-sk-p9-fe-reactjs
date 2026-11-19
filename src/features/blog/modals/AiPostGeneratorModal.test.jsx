import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AiPostGeneratorModal from './AiPostGeneratorModal'

const renderModal = (overrides = {}) => {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    onGenerate: vi.fn(),
    onApply: vi.fn(),
    loading: false,
    ...overrides,
  }
  render(<AiPostGeneratorModal {...props} />)
  return props
}

describe('AiPostGeneratorModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<AiPostGeneratorModal isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('generates with web search, previews content and sources, then applies to the editor', async () => {
    const onGenerate = vi.fn().mockResolvedValue({
      title: 'Judul Hasil AI',
      content: 'Isi artikel hasil AI',
      search_sources: ['https://id.wikipedia.org - React', 'https://react.dev - Dokumentasi'],
    })
    const props = renderModal({ onGenerate })

    expect(screen.getByText('AI Post Generator')).toBeInTheDocument()
    expect(screen.getByText('Pratinjau artikel hasil AI akan tampil di sini.')).toBeInTheDocument()
    expect(screen.queryByText('Terapkan ke Editor')).not.toBeInTheDocument()

    // toggle pencarian web
    const toggle = screen.getByTestId('ai-toggle-search')
    expect(toggle).toBeChecked()
    fireEvent.click(toggle)
    expect(toggle).not.toBeChecked()
    fireEvent.click(toggle)
    expect(toggle).toBeChecked()

    fireEvent.change(screen.getByLabelText('Prompt Artikel AI'), {
      target: { value: '  Pengantar React Hooks  ' },
    })
    fireEvent.change(screen.getByLabelText('Kategori AI'), { target: { value: 'Teknologi' } })
    fireEvent.click(screen.getByText('Hasilkan via AI'))

    expect(onGenerate).toHaveBeenCalledWith({
      prompt: 'Pengantar React Hooks',
      category: 'Teknologi',
      include_web_search: true,
    })

    await waitFor(() => {
      expect(screen.getByTestId('ai-result-preview')).toBeInTheDocument()
    })
    expect(screen.getByText('Judul Hasil AI')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()
    expect(screen.getByTestId('ai-search-sources')).toBeInTheDocument()
    expect(screen.getByText('https://id.wikipedia.org - React')).toBeInTheDocument()
    expect(screen.getByText('https://react.dev - Dokumentasi')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Terapkan ke Editor'))
    expect(props.onApply).toHaveBeenCalledWith({
      title: 'Judul Hasil AI',
      content: 'Isi artikel hasil AI',
      category: 'Teknologi',
    })
    expect(props.onClose).toHaveBeenCalledTimes(1)
  })

  it('hides the sources panel when the result has no search sources', async () => {
    const onGenerate = vi.fn().mockResolvedValue({
      title: 'Tanpa Sumber',
      content: 'Isi tanpa sumber',
      search_sources: [],
    })
    renderModal({ onGenerate })

    fireEvent.click(screen.getByTestId('ai-toggle-search'))
    fireEvent.change(screen.getByLabelText('Prompt Artikel AI'), { target: { value: 'Topik bebas' } })
    fireEvent.click(screen.getByText('Hasilkan via AI'))

    expect(onGenerate).toHaveBeenCalledWith({
      prompt: 'Topik bebas',
      category: 'Umum',
      include_web_search: false,
    })

    await waitFor(() => {
      expect(screen.getByText('Tanpa Sumber')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('ai-search-sources')).not.toBeInTheDocument()
  })

  it('keeps the placeholder when generation fails and returns nothing', async () => {
    const onGenerate = vi.fn().mockResolvedValue(null)
    renderModal({ onGenerate })

    fireEvent.change(screen.getByLabelText('Prompt Artikel AI'), { target: { value: 'Gagal' } })
    fireEvent.click(screen.getByText('Hasilkan via AI'))

    await waitFor(() => {
      expect(onGenerate).toHaveBeenCalledTimes(1)
    })
    expect(screen.queryByTestId('ai-result-preview')).not.toBeInTheDocument()
    expect(screen.getByText('Pratinjau artikel hasil AI akan tampil di sini.')).toBeInTheDocument()
  })

  it('ignores a blank prompt and closes via X or Tutup', () => {
    const props = renderModal()

    fireEvent.change(screen.getByLabelText('Prompt Artikel AI'), { target: { value: '   ' } })
    fireEvent.click(screen.getByText('Hasilkan via AI'))
    expect(props.onGenerate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Tutup Modal'))
    expect(props.onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByText('Tutup'))
    expect(props.onClose).toHaveBeenCalledTimes(2)
  })

  it('disables the form and shows progress text while loading', () => {
    renderModal({ loading: true })

    expect(screen.getByText('Sedang Menghasilkan...')).toBeDisabled()
    expect(screen.getByTestId('ai-toggle-search')).toBeDisabled()
  })
})
