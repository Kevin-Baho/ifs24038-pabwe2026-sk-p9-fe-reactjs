import React from 'react'
import { IconSun, IconMoon, IconLogout } from '@tabler/icons-react'

const navLinkClass = (active) =>
  `px-3 py-1.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
    active
      ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300'
      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
  }`

export default function StickyNavbar({
  user,
  currentPath,
  onNavigate,
  onLogout,
  mode,
  accent,
  accents,
  onToggleMode,
  onChangeAccent,
}) {
  const isHome =
    currentPath === '/' || currentPath === '/public' || currentPath.startsWith('/posts/')
  const isAdmin = !!user && user.role === 'admin'
  const isDark = mode === 'dark'

  return (
    <header
      className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-xs"
      data-testid="sticky-navbar"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center space-x-3 select-none cursor-pointer"
          >
            <span className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              D
            </span>
            <span className="text-left">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight block leading-tight">
                Delcom Blog
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                Multi-Tier &amp; AI Generator
              </span>
            </span>
          </button>

          <nav className="flex items-center gap-1" aria-label="Navigasi utama">
            <button type="button" onClick={() => onNavigate('/')} className={navLinkClass(isHome)}>
              Artikel
            </button>
            {user && (
              <button
                type="button"
                onClick={() => onNavigate('/author')}
                className={navLinkClass(currentPath === '/author')}
              >
                Workspace Penulis
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => onNavigate('/admin')}
                className={navLinkClass(currentPath === '/admin')}
              >
                Panel Admin
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMode}
            aria-label="Toggle Mode Gelap Terang"
            title={`Ganti ke Mode ${isDark ? 'Terang' : 'Gelap'}`}
            className="p-1.5 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
            {accents.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeAccent(item.id)}
                aria-label={`Tema ${item.name}`}
                title={`Tema ${item.name}`}
                className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                  accent === item.id ? 'scale-125 ring-2 ring-primary-500' : 'opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: item.hex }}
              />
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="text-right leading-tight">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{user.username}</p>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isAdmin
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {user.role.toUpperCase()}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              >
                <IconLogout size={16} />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="px-3.5 py-1.5 rounded-xl text-sm font-semibold border border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition cursor-pointer"
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/register')}
                className="px-3.5 py-1.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition cursor-pointer"
              >
                Daftar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
