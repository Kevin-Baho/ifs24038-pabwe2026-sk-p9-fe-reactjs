import React, { useState } from 'react'
import { IconSearch, IconClock, IconUser, IconCalendar } from '@tabler/icons-react'
import {
  CATEGORIES,
  getPostExcerpt,
  getPostReadingTime,
  getAuthorName,
  getPostDate,
} from '../../../helpers/toolsHelper'

const FILTERS = ['Semua', ...CATEGORIES]

export default function PublicArticleList({ posts, loading, user, onOpenPost, onNavigate }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua')

  const query = search.trim().toLowerCase()
  const filteredPosts = posts.filter((post) => {
    const matchCategory = category === 'Semua' || post.category === category
    const matchSearch =
      query === '' ||
      `${post.title} ${getPostExcerpt(post)} ${getAuthorName(post)}`.toLowerCase().includes(query)
    return matchCategory && matchSearch
  })

  const linkTo = (path) => (e) => {
    e.preventDefault()
    onNavigate(path)
  }

  const openPost = (slug) => (e) => {
    e.preventDefault()
    onOpenPost(slug)
  }

  let body
  if (loading) {
    body = (
      <p className="text-center text-slate-500 dark:text-slate-400 py-12" data-testid="posts-loading">
        Memuat artikel...
      </p>
    )
  } else if (filteredPosts.length === 0) {
    body = (
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400"
        data-testid="public-empty"
      >
        <p className="text-base font-semibold">Belum ada artikel yang cocok.</p>
        <p className="text-sm mt-1">Coba kata kunci atau kategori yang lain.</p>
      </div>
    )
  } else {
    body = (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            data-testid={`post-card-${post.id}`}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col overflow-hidden"
          >
            <div className="p-6 flex-1 flex flex-col">
              <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 mb-3">
                {post.category}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
                <a
                  href={`/posts/${post.slug}`}
                  onClick={openPost(post.slug)}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition cursor-pointer"
                >
                  {post.title}
                </a>
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                {getPostExcerpt(post)}
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <IconUser size={14} />
                  {getAuthorName(post)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <IconCalendar size={14} />
                  {getPostDate(post)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <IconClock size={14} />
                  {getPostReadingTime(post)} menit baca
                </span>
              </div>
              <a
                href={`/posts/${post.slug}`}
                onClick={openPost(post.slug)}
                className="inline-block text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
              >
                Baca selengkapnya →
              </a>
            </div>
          </article>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full space-y-6" data-testid="public-article-list">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
            Blog Komunitas Delcom
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Jelajahi Artikel Terbaru</h1>
          <p className="mt-2 text-primary-100 text-sm sm:text-base leading-relaxed">
            Baca tulisan dari para penulis Delcom, atau mulai menulis sendiri dengan bantuan AI dan mesin pencari.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {user ? (
            <a
              href="/author"
              onClick={linkTo('/author')}
              className="px-4 py-2 bg-white text-primary-700 font-semibold text-sm rounded-xl shadow-md hover:bg-primary-50 transition cursor-pointer"
            >
              Buka Workspace Penulis
            </a>
          ) : (
            <>
              <a
                href="/login"
                onClick={linkTo('/login')}
                className="px-4 py-2 bg-white text-primary-700 font-semibold text-sm rounded-xl shadow-md hover:bg-primary-50 transition cursor-pointer"
              >
                Masuk
              </a>
              <a
                href="/register"
                onClick={linkTo('/register')}
                className="px-4 py-2 bg-white/15 text-white font-semibold text-sm rounded-xl border border-white/40 hover:bg-white/25 transition cursor-pointer"
              >
                Daftar
              </a>
            </>
          )}
        </div>
      </div>

      {/* Search + Category Pills */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari artikel..."
            aria-label="Cari artikel"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="absolute left-3.5 top-3 text-slate-400">
            <IconSearch size={18} />
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter kategori">
          {FILTERS.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                category === name
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {body}
    </div>
  )
}
