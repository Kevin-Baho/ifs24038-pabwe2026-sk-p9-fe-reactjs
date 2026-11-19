import React from 'react'
import { IconArrowLeft, IconClock, IconUser, IconCalendar } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { getAuthorName, getPostDate, getPostReadingTime } from '../../../helpers/toolsHelper'

export default function PublicArticleDetail({ post, loading, onBack }) {
  if (loading) {
    return (
      <p className="text-center text-slate-500 dark:text-slate-400 py-16" data-testid="detail-loading">
        Memuat artikel...
      </p>
    )
  }

  if (!post) {
    return (
      <div
        className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4"
        data-testid="detail-not-found"
      >
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Artikel tidak ditemukan</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Artikel yang Anda cari belum diterbitkan atau sudah dihapus.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-xs transition cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </div>
    )
  }

  return (
    <article className="w-full space-y-6" data-testid="article-detail">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
      >
        <IconArrowLeft size={16} />
        <span>Kembali ke daftar artikel</span>
      </button>

      <header className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
          {post.category}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <IconUser size={16} />
            {getAuthorName(post)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconCalendar size={16} />
            {getPostDate(post)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconClock size={16} />
            {getPostReadingTime(post)} menit baca
          </span>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-xs">
        <MarkdownViewer content={post.content} />
      </div>
    </article>
  )
}
