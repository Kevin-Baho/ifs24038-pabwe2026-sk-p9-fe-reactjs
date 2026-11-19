import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import Editor from '@toast-ui/editor'
import MarkdownEditor from './MarkdownEditor'
import MarkdownViewer from './MarkdownViewer'

// Editor palsu agar seluruh cabang (change event, sinkronisasi nilai, destroy) dapat diuji deterministik.
vi.mock('@toast-ui/editor', () => {
  const instances = []
  class FakeEditor {
    constructor(options) {
      this.options = options
      this.markdown = options.initialValue
      this.destroy = vi.fn()
      instances.push(this)
    }
    getMarkdown() {
      return this.markdown
    }
    setMarkdown(markdown, cursorToEnd) {
      this.markdown = markdown
      this.cursorToEnd = cursorToEnd
    }
    static factory(options) {
      return new FakeEditor(options)
    }
  }
  FakeEditor.instances = instances
  return { default: FakeEditor }
})

const lastInstance = () => Editor.instances[Editor.instances.length - 1]

describe('MarkdownEditor', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('creates the editor with explicit props, forwards changes, syncs value and destroys on unmount', () => {
    const handleChange = vi.fn()
    const { rerender, unmount } = render(
      <MarkdownEditor
        value="# Initial"
        onChange={handleChange}
        height="450px"
        placeholder="Tulis di sini"
      />
    )
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()

    const editor = lastInstance()
    expect(editor.options).toEqual(
      expect.objectContaining({
        height: '450px',
        placeholder: 'Tulis di sini',
        initialValue: '# Initial',
        initialEditType: 'markdown',
        previewStyle: 'tab',
        usageStatistics: false,
        theme: 'light',
      })
    )

    // change event -> onChange menerima markdown terbaru
    editor.markdown = '# Diketik user'
    editor.options.events.change()
    expect(handleChange).toHaveBeenCalledWith('# Diketik user')

    // value sama dengan isi editor -> tidak ada setMarkdown
    const setSpy = vi.spyOn(editor, 'setMarkdown')
    rerender(
      <MarkdownEditor value="# Diketik user" onChange={handleChange} height="450px" placeholder="Tulis di sini" />
    )
    expect(setSpy).not.toHaveBeenCalled()

    // value berbeda -> editor disinkronkan
    rerender(
      <MarkdownEditor value="# Updated" onChange={handleChange} height="450px" placeholder="Tulis di sini" />
    )
    expect(setSpy).toHaveBeenCalledWith('# Updated', false)
    expect(editor.getMarkdown()).toBe('# Updated')

    unmount()
    expect(editor.destroy).toHaveBeenCalledTimes(1)
  })

  it('uses default props, dark theme, and a safe default onChange', () => {
    document.documentElement.classList.add('dark')
    render(<MarkdownEditor />)

    const editor = lastInstance()
    expect(editor.options).toEqual(
      expect.objectContaining({
        height: '280px',
        initialValue: '',
        theme: 'dark',
        placeholder: 'Tuliskan konten artikel dalam format Markdown...',
      })
    )
    // onChange default tidak boleh melempar error
    expect(() => editor.options.events.change()).not.toThrow()
  })
})

describe('MarkdownViewer', () => {
  it('renders the viewer, updates content and destroys on unmount', () => {
    const { rerender, unmount } = render(<MarkdownViewer content="# View Title" />)
    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()

    const viewer = lastInstance()
    expect(viewer.options).toEqual(
      expect.objectContaining({ viewer: true, initialValue: '# View Title', usageStatistics: false })
    )

    rerender(<MarkdownViewer content="# Updated View Title" />)
    expect(viewer.getMarkdown()).toBe('# Updated View Title')

    unmount()
    expect(viewer.destroy).toHaveBeenCalledTimes(1)
  })

  it('falls back to empty content by default', () => {
    render(<MarkdownViewer />)
    const viewer = lastInstance()
    expect(viewer.options.initialValue).toBe('')
    expect(viewer.getMarkdown()).toBe('')
  })
})
