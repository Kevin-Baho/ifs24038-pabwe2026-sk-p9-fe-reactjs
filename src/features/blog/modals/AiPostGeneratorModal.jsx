import React, { useState } from 'react'
import { IconSparkles, IconWorld, IconX, IconSearch } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { CATEGORIES } from '../../../helpers/toolsHelper'

function AiPostGeneratorForm({ onClose, onGenerate, onApply, loading }) {
  const [prompt, setPrompt] = useState('')
  const [category, setCategory] = useState('Umum')
  const [includeWebSearch, setIncludeWebSearch] = useState(true)
  const [result, setResult] = useState(null)

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return
    const res = await onGenerate({
      prompt: prompt.trim(),
      category,
      include_web_search: includeWebSearch,
    })
    if (res) {
      setResult(res)
    }
  }

  const handleApply = () => {
    onApply({ title: result.title, content: result.content, category })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 animate-fadeIn"
      data-testid="ai-modal"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-[96vw] h-[96vh] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 sm:px-8 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <IconSparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">AI Post Generator</h2>
              <p className="text-xs text-primary-100">
                Hasilkan draf artikel otomatis, dikombinasikan dengan penelusuran mesin pencari
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Modal"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Body: form di kiri, pratinjau di kanan */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <form
              onSubmit={handleGenerate}
              className="lg:col-span-2 bg-white dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-4 self-start"
            >
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Topik / Prompt Artikel
                </label>
                <input
                  type="text"
                  required
                  aria-label="Prompt Artikel AI"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Contoh: Pengantar React Hooks untuk pemula"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Kategori
                </label>
                <select
                  aria-label="Kategori AI"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
                >
                  {CATEGORIES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 rounded-xl bg-primary-50/70 dark:bg-primary-950/40 border border-primary-200/80 dark:border-primary-800/60 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="toggle-search-engine"
                  checked={includeWebSearch}
                  onChange={(e) => setIncludeWebSearch(e.target.checked)}
                  disabled={loading}
                  data-testid="ai-toggle-search"
                  className="mt-1 w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                />
                <label
                  htmlFor="toggle-search-engine"
                  className="text-xs text-primary-950 dark:text-primary-200 cursor-pointer select-none"
                >
                  <span className="font-bold text-sm flex items-center gap-1.5 mb-0.5">
                    <IconWorld className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    Integrasi Mesin Pencari
                  </span>
                  AI akan menelusuri fakta lewat search engine open-source dan menyertakan daftar sumber rujukan
                  pada artikel yang dihasilkan.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm shadow-md hover:shadow-lg transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Sedang Menghasilkan...' : 'Hasilkan via AI'}
              </button>
            </form>

            <div className="lg:col-span-3 space-y-4">
              {result ? (
                <>
                  <div
                    className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-4"
                    data-testid="ai-result-preview"
                  >
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{result.title}</h3>
                    <MarkdownViewer content={result.content} />
                  </div>

                  {result.search_sources.length > 0 && (
                    <div
                      className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2"
                      data-testid="ai-search-sources"
                    >
                      <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                        <IconSearch size={14} className="text-blue-600 dark:text-blue-400" />
                        <span>Sumber Rujukan Mesin Pencari:</span>
                      </h4>
                      <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc ml-5">
                        {result.search_sources.map((src, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {src}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full min-h-48 flex items-center justify-center text-center text-sm text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8">
                  Pratinjau artikel hasil AI akan tampil di sini.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer kontras, aksi di kanan */}
        <div className="bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 sm:px-8 py-4 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-medium text-sm transition cursor-pointer"
          >
            Tutup
          </button>
          {result && (
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-md transition cursor-pointer"
            >
              Terapkan ke Editor
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AiPostGeneratorModal({ isOpen, onClose, onGenerate, onApply, loading }) {
  if (!isOpen) return null
  return <AiPostGeneratorForm onClose={onClose} onGenerate={onGenerate} onApply={onApply} loading={loading} />
}
