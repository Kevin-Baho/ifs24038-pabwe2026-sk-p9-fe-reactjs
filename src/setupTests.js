import '@testing-library/jest-dom'

// Base URL default untuk unit test (Backend port 8081 via prefix /api)
import.meta.env.VITE_API_BASE_URL = 'http://localhost:8081/api'

/**
 * Polyfill JSDOM untuk @toast-ui/editor (ProseMirror + CodeMirror).
 * JSDOM tidak mengimplementasikan layout, sehingga API pengukuran DOM berikut harus disediakan.
 */
const emptyRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  toJSON() {
    return this
  },
}

const emptyRectList = () => {
  const list = []
  list.item = () => null
  return list
}

// Range: ProseMirror memanggil getBoundingClientRect / getClientRects saat menghitung posisi kursor
if (typeof Range !== 'undefined') {
  Range.prototype.getBoundingClientRect = () => emptyRect
  Range.prototype.getClientRects = emptyRectList
}

// Element.getClientRects & scrollIntoView
Element.prototype.getClientRects = emptyRectList
Element.prototype.scrollIntoView = () => {}

// document.execCommand dipakai editor untuk beberapa perintah (copy/paste/format)
document.execCommand = () => false

// window.matchMedia (dipakai untuk deteksi preferensi tampilan)
window.matchMedia =
  window.matchMedia ||
  ((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }))

// window.scrollTo tidak diimplementasikan JSDOM
window.scrollTo = () => {}

// Observer API yang tidak ada di JSDOM
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
window.ResizeObserver = window.ResizeObserver || NoopObserver
window.IntersectionObserver = window.IntersectionObserver || NoopObserver
