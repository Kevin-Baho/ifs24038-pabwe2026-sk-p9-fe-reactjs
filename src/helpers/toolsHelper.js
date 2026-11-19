import Swal from 'sweetalert2'

export const CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

export function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** Menghapus sintaks Markdown sehingga tersisa teks polos (untuk excerpt & hitung kata). */
export function stripMarkdown(text) {
  return String(text || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^[\s>#*+-]+/gm, ' ')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function makeExcerpt(text, maxLength = 140) {
  const plain = stripMarkdown(text)
  if (plain.length <= maxLength) return plain
  return `${plain.slice(0, maxLength).trimEnd()}…`
}

/** Estimasi waktu baca dalam menit (200 kata/menit, minimal 1 menit). */
export function calculateReadingTime(text) {
  const plain = stripMarkdown(text)
  const words = plain ? plain.split(' ').length : 0
  return Math.max(1, Math.ceil(words / 200))
}

export function getPostExcerpt(post) {
  return post.excerpt || makeExcerpt(post.content)
}

export function getPostReadingTime(post) {
  return post.reading_time || calculateReadingTime(post.content)
}

export function getAuthorName(post) {
  if (post.author && post.author.username) return post.author.username
  return post.author_name || 'Anonim'
}

export function getPostDate(post) {
  return formatDate(post.published_at || post.created_at)
}

export function showErrorAlert(message, title = 'Terjadi Kesalahan') {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonColor: '#4f46e5',
  })
}

export function showSuccessAlert(message, title = 'Berhasil!') {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    confirmButtonColor: '#4f46e5',
  })
}

export function showToast(message) {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  })
}

export function showConfirmDialog(message, title = 'Konfirmasi') {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Lanjutkan',
    cancelButtonText: 'Batal',
  }).then((result) => result.isConfirmed)
}
