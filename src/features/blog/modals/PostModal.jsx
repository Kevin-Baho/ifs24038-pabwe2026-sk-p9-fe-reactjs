import React, { useState } from 'react'
import { IconFileText, IconX } from '@tabler/icons-react'
import MarkdownEditor from '../../../components/MarkdownEditor'
import { CATEGORIES } from '../../../helpers/toolsHelper'

const EMPTY_POST = { title: '', content: '', category: 'Umum', status: 'draft' }

function PostModalForm({ onClose, onSave, post, initialData }) {
  // post = mode ubah; initialData = benih konten (mis. hasil AI) untuk mode tambah
  const source = { ...EMPTY_POST, ...post, ...initialData }
  const [title, setTitle] = useState(source.title)
  const [category, setCategory] = useState(source.category)
  const [status, setStatus] = useState(source.status)
  const [content, setContent] = useState(source.content)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ title: title.trim(), category, status, content })
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 animate-fadeIn"
      data-testid="post-modal"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-[96vw] h-[96vh] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header kontras */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 sm:px-8 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/10 rounded-xl backdrop-blur-sm flex items-center justify-center">
              <IconFileText size={24} />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">{post ? 'Ubah Artikel' : 'Tambah Artikel Baru'}</h2>
              <p className="text-xs text-primary-100">
                Atur judul, kategori, status publikasi, dan tulis konten dalam format Markdown
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Modal"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
          <form id="post-form" onSubmit={handleSubmit} className="w-full space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Judul Artikel <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                aria-label="Judul Artikel"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Membangun SPA dengan React dan Vite"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm shadow-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kategori
                </label>
                <select
                  aria-label="Kategori"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm shadow-xs"
                >
                  {CATEGORIES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status Publikasi
                </label>
                <select
                  aria-label="Status Publikasi"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm shadow-xs"
                >
                  <option value="draft">Draf</option>
                  <option value="published">Terbit</option>
                </select>
              </div>
            </div>

            <div className="w-full">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Konten Artikel (Markdown)
              </label>
              <MarkdownEditor
                value={content}
                onChange={(val) => setContent(val)}
                height="520px"
                placeholder="Tulis artikel Anda di sini. Gunakan tab Preview untuk melihat hasilnya..."
              />
              <textarea
                aria-label="Konten Markdown"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="sr-only"
                tabIndex={-1}
              />
            </div>
          </form>
        </div>

        {/* Footer kontras, aksi di kanan */}
        <div className="bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 sm:px-8 py-4 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-medium text-sm transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form="post-form"
            className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm shadow-md hover:shadow-lg transition cursor-pointer"
          >
            Simpan Artikel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PostModal({ isOpen, onClose, onSave, post, initialData }) {
  if (!isOpen) return null
  return <PostModalForm onClose={onClose} onSave={onSave} post={post} initialData={initialData} />
}
