import React, { useState } from 'react'
import {
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
  IconPlus,
  IconSparkles,
} from '@tabler/icons-react'
import PostStats from './PostStats'
import { getPostDate } from '../../../helpers/toolsHelper'

export default function AuthorDashboard({
  posts,
  onCreate,
  onOpenAi,
  onDetail,
  onEdit,
  onDelete,
  onTogglePublish,
}) {
  const [openKebabId, setOpenKebabId] = useState(null)

  const published = posts.filter((post) => post.status === 'published').length
  const stats = { total: posts.length, published, draft: posts.length - published }

  return (
    <div className="w-full space-y-6" data-testid="author-dashboard">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Workspace Penulis
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola artikel Anda, terbitkan atau kembalikan ke draf, dan buat konten baru dengan bantuan AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Tambah Artikel</span>
          </button>
          <button
            type="button"
            onClick={onOpenAi}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <IconSparkles size={16} className="text-purple-600 dark:text-purple-400" />
            <span>AI Generator</span>
          </button>
        </div>
      </div>

      <PostStats stats={stats} />

      {posts.length === 0 ? (
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400"
          data-testid="author-empty"
        >
          <p className="text-base font-medium">Belum ada artikel.</p>
          <p className="text-sm mt-1">Klik tombol "Tambah Artikel" atau "AI Generator" untuk memulai.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Judul</th>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3">Publikasi</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {posts.map((post) => {
                  const isPublished = post.status === 'published'
                  const isMenuOpen = openKebabId === post.id

                  return (
                    <tr
                      key={post.id}
                      data-testid={`post-row-${post.id}`}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        isMenuOpen ? 'relative z-30' : 'relative z-0'
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{post.title}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{post.category}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isPublished}
                            aria-label={`toggle-publish-${post.id}`}
                            onClick={() => onTogglePublish(post)}
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                              isPublished ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                isPublished ? 'translate-x-5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-xs font-semibold ${
                              isPublished
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {isPublished ? 'Terbit' : 'Draf'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{getPostDate(post)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            aria-label={`kebab-${post.id}`}
                            onClick={() => setOpenKebabId(isMenuOpen ? null : post.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                          >
                            <IconDotsVertical size={18} />
                          </button>

                          {isMenuOpen && (
                            <div
                              className="absolute right-0 top-full mt-1.5 z-50 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1 text-left"
                              data-testid={`kebab-menu-${post.id}`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenKebabId(null)
                                  onDetail(post)
                                }}
                                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <IconEye size={15} className="text-primary-600 dark:text-primary-400" />
                                <span>Detail</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenKebabId(null)
                                  onEdit(post)
                                }}
                                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <IconPencil size={15} className="text-primary-600 dark:text-primary-400" />
                                <span>Ubah</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenKebabId(null)
                                  onDelete(post)
                                }}
                                className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <IconTrash size={15} />
                                <span>Hapus</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
