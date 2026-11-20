import React from 'react'
import { IconShield, IconUsers, IconFileText } from '@tabler/icons-react'
import { getAuthorName, getPostDate } from '../../../helpers/toolsHelper'

export default function AdminDashboard({ users, posts }) {
  return (
    <div className="w-full space-y-8" data-testid="admin-dashboard">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-start gap-3">
        <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
          <IconShield size={22} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Panel Pengawasan Administrator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Memantau seluruh pengguna sistem dan mengarsipkan seluruh artikel yang ada di platform.
          </p>
        </div>
      </div>

      {/* Monitoring Pengguna */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <IconUsers size={18} />
          <span>Pengguna Sistem ({users.length})</span>
        </h2>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-sm divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Pengguna</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Peran</th>
                <th className="px-6 py-3 text-center">Total Artikel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800" data-testid="admin-users-body">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada data pengguna.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{u.username}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          u.role === 'admin'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {u.total_posts}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Arsip Seluruh Artikel */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <IconFileText size={18} />
          <span>Arsip Seluruh Artikel ({posts.length})</span>
        </h2>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-sm divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Judul</th>
                <th className="px-6 py-3">Penulis</th>
                <th className="px-6 py-3">Kategori</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800" data-testid="admin-posts-body">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Belum ada artikel.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{post.title}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{getAuthorName(post)}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{post.category}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          post.status === 'published'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300'
                        }`}
                      >
                        {post.status === 'published' ? 'Terbit' : 'Draf'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{getPostDate(post)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
