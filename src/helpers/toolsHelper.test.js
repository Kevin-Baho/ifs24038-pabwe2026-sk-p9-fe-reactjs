import { describe, it, expect, vi, afterEach } from 'vitest'
import Swal from 'sweetalert2'
import {
  CATEGORIES,
  formatDate,
  stripMarkdown,
  makeExcerpt,
  calculateReadingTime,
  getPostExcerpt,
  getPostReadingTime,
  getAuthorName,
  getPostDate,
  showErrorAlert,
  showSuccessAlert,
  showToast,
  showConfirmDialog,
} from './toolsHelper'

describe('toolsHelper', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exposes the blog categories', () => {
    expect(CATEGORIES).toEqual(['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum'])
  })

  it('formats dates properly and handles invalid dates', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate('invalid-date')).toBe('-')
    expect(formatDate('2026-03-15')).toContain('2026')
  })

  it('strips markdown syntax down to plain text', () => {
    expect(stripMarkdown(undefined)).toBe('')
    const md = '# Judul\n\n**tebal** dan [tautan](https://x.id) ![img](a.png)\n- item\n```js\ncode\n```\n<b>html</b>'
    expect(stripMarkdown(md)).toBe('Judul tebal dan tautan item html')
  })

  it('builds excerpts, truncating long text only', () => {
    expect(makeExcerpt('Halo **dunia**')).toBe('Halo dunia')
    expect(makeExcerpt('a'.repeat(200), 10)).toBe(`${'a'.repeat(10)}…`)
    const long = makeExcerpt('x'.repeat(300))
    expect(long).toHaveLength(141)
    expect(long.endsWith('…')).toBe(true)
  })

  it('calculates reading time with a minimum of one minute', () => {
    expect(calculateReadingTime('')).toBe(1)
    expect(calculateReadingTime('satu kata')).toBe(1)
    expect(calculateReadingTime('kata '.repeat(450))).toBe(3)
  })

  it('prefers explicit excerpt and reading time, otherwise derives them from content', () => {
    expect(getPostExcerpt({ excerpt: 'Ringkasan', content: 'Isi' })).toBe('Ringkasan')
    expect(getPostExcerpt({ content: '## Isi artikel' })).toBe('Isi artikel')

    expect(getPostReadingTime({ reading_time: 7, content: 'Isi' })).toBe(7)
    expect(getPostReadingTime({ content: 'Isi' })).toBe(1)
  })

  it('resolves the author name from the nested author, author_name or a fallback', () => {
    expect(getAuthorName({ author: { username: 'budi' } })).toBe('budi')
    expect(getAuthorName({ author_name: 'siti' })).toBe('siti')
    expect(getAuthorName({ author: {} })).toBe('Anonim')
  })

  it('formats the post date from published_at with created_at as fallback', () => {
    expect(getPostDate({ published_at: '2026-03-15T00:00:00Z' })).toContain('2026')
    expect(getPostDate({ created_at: '2025-01-10T00:00:00Z' })).toContain('2025')
  })

  it('triggers Swal.fire for alerts, toast and confirm dialog', async () => {
    const swalSpy = vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true })

    showErrorAlert('Error happened')
    expect(swalSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ icon: 'error', title: 'Terjadi Kesalahan', text: 'Error happened' })
    )
    showErrorAlert('Custom', 'Judul Kustom')
    expect(swalSpy).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Judul Kustom' }))

    showSuccessAlert('Success happened')
    expect(swalSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ icon: 'success', title: 'Berhasil!', text: 'Success happened' })
    )
    showSuccessAlert('Custom', 'Sukses Kustom')
    expect(swalSpy).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Sukses Kustom' }))

    showToast('Tersimpan')
    expect(swalSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ toast: true, icon: 'success', title: 'Tersimpan', timer: 3000 })
    )

    expect(await showConfirmDialog('Are you sure?')).toBe(true)
    expect(swalSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ icon: 'warning', title: 'Konfirmasi', text: 'Are you sure?' })
    )
    await showConfirmDialog('Hapus?', 'Judul Konfirmasi')
    expect(swalSpy).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Judul Konfirmasi' }))

    swalSpy.mockResolvedValue({ isConfirmed: false })
    expect(await showConfirmDialog('Batalkan?')).toBe(false)
  })
})
