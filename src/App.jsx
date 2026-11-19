import React, { useState, useEffect } from 'react'
import apiHelper from './helpers/apiHelper'
import authApi from './features/auth/api/authApi'
import blogApi from './features/blog/api/blogApi'
import adminApi from './features/admin/api/adminApi'
import useTheme from './hooks/useTheme'
import { showErrorAlert, showConfirmDialog, showToast } from './helpers/toolsHelper'
import StickyNavbar from './features/blog/components/StickyNavbar'
import PublicArticleList from './features/blog/components/PublicArticleList'
import PublicArticleDetail from './features/blog/components/PublicArticleDetail'
import AuthorDashboard from './features/blog/components/AuthorDashboard'
import PostModal from './features/blog/modals/PostModal'
import AiPostGeneratorModal from './features/blog/modals/AiPostGeneratorModal'
import AdminDashboard from './features/admin/components/AdminDashboard'
import AuthPage from './features/auth/components/AuthPage'
import AuthModal from './features/auth/modals/AuthModal'

// Promise yang gagal diganti nilai cadangan agar UI tidak pernah crash karena API.
const safe = (promise, fallback) => promise.catch(() => fallback)

const homeFor = (user) => (user.role === 'admin' ? '/admin' : '/author')

export default function App() {
  const { mode, accent, toggleMode, changeAccent, accents } = useTheme()
  const [currentUser, setCurrentUser] = useState(() => apiHelper.getUser())
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)

  const [publicPosts, setPublicPosts] = useState([])
  const [publicLoading, setPublicLoading] = useState(true)
  const [detail, setDetail] = useState({ slug: '', post: null })
  const [myPosts, setMyPosts] = useState([])
  const [adminUsers, setAdminUsers] = useState([])
  const [adminPosts, setAdminPosts] = useState([])

  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [postSeed, setPostSeed] = useState(null)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const isAdmin = !!currentUser && currentUser.role === 'admin'

  // ---------- SPA routing (pushState + popstate) ----------
  const navigate = (path) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
  }

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // ---------- Data loading ----------
  const loadPublicPosts = async () => {
    setPublicPosts(await safe(blogApi.getPublicPosts(), []))
    setPublicLoading(false)
  }

  const loadMyPosts = async () => {
    setMyPosts(await safe(blogApi.getMyPosts(), []))
  }

  const loadAdminData = async () => {
    const [users, posts] = await Promise.all([safe(adminApi.getUsers(), []), safe(adminApi.getPosts(), [])])
    setAdminUsers(users)
    setAdminPosts(posts)
  }

  const loadPrivateData = () => Promise.all([loadMyPosts(), isAdmin && loadAdminData()])

  const refreshAll = () => Promise.all([loadPublicPosts(), loadPrivateData()])

  useEffect(() => {
    loadPublicPosts()
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadPrivateData()
    }
  }, [currentUser])

  // ---------- Rute baca artikel: /posts/:slug ----------
  const slugMatch = currentPath.match(/^\/posts\/([^/]+)\/?$/)
  const routeSlug = slugMatch ? slugMatch[1] : ''

  useEffect(() => {
    if (!routeSlug) return
    blogApi
      .getPublicPostBySlug(routeSlug)
      .then((post) => setDetail({ slug: routeSlug, post }))
      .catch(() => setDetail({ slug: routeSlug, post: null }))
  }, [routeSlug])

  // ---------- Auth handlers ----------
  const handleLogin = async ({ username, password }) => {
    const data = await authApi.login(username, password)
    apiHelper.putAccessToken(data.token)
    apiHelper.putUser(data.user)
    setCurrentUser(data.user)
    showToast('Berhasil masuk!')
    navigate(homeFor(data.user))
  }

  const handleRegister = async ({ username, email, password, role }) => {
    await authApi.register(username, email, password, role)
    await handleLogin({ username, password })
  }

  const handleLogout = async () => {
    await safe(authApi.logout(), null)
    apiHelper.putAccessToken('')
    apiHelper.putUser(null)
    setCurrentUser(null)
    setMyPosts([])
    setAdminUsers([])
    setAdminPosts([])
    showToast('Berhasil keluar.')
    navigate('/')
  }

  // ---------- Post handlers ----------
  const closePostModal = () => {
    setIsPostModalOpen(false)
    setEditingPost(null)
    setPostSeed(null)
  }

  const openCreatePost = () => {
    setEditingPost(null)
    setPostSeed(null)
    setIsPostModalOpen(true)
  }

  const openEditPost = (post) => {
    setEditingPost(post)
    setPostSeed(null)
    setIsPostModalOpen(true)
  }

  const handleSavePost = async (data) => {
    try {
      if (editingPost) {
        await blogApi.updatePost(editingPost.id, data)
        showToast('Artikel berhasil diperbarui!')
      } else {
        await blogApi.createPost(data)
        showToast('Artikel baru berhasil ditambahkan!')
      }
      closePostModal()
      await refreshAll()
    } catch (err) {
      showErrorAlert(err.message)
    }
  }

  const handleDeletePost = async (post) => {
    const confirmed = await showConfirmDialog(`Apakah Anda yakin ingin menghapus artikel "${post.title}"?`)
    if (!confirmed) return
    try {
      await blogApi.deletePost(post.id)
      showToast('Artikel berhasil dihapus.')
      await refreshAll()
    } catch (err) {
      showErrorAlert(err.message)
    }
  }

  const handleTogglePublish = async (post) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published'
    try {
      await blogApi.setPostStatus(post.id, nextStatus)
      showToast(nextStatus === 'published' ? 'Artikel diterbitkan.' : 'Artikel dikembalikan ke draf.')
      await refreshAll()
    } catch (err) {
      showErrorAlert(err.message)
    }
  }

  // ---------- AI handlers ----------
  const handleGenerateAi = async (params) => {
    setAiLoading(true)
    try {
      return await blogApi.generateAiPost(params)
    } catch (err) {
      showErrorAlert(err.message)
      return null
    } finally {
      setAiLoading(false)
    }
  }

  const handleApplyAi = (draft) => {
    setEditingPost(null)
    setPostSeed(draft)
    setIsPostModalOpen(true)
  }

  // ---------- Render ----------
  if (currentPath === '/login' || currentPath === '/register') {
    return (
      <div data-testid="app-container">
        <AuthPage
          mode={currentPath === '/login' ? 'login' : 'register'}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onNavigate={navigate}
        />
      </div>
    )
  }

  // Rute terproteksi tanpa login -> daftar publik ditampilkan dengan modal login di atasnya
  const needsLogin = (currentPath === '/author' || currentPath === '/admin') && !currentUser

  const detailReady = detail.slug === routeSlug

  let content
  if (currentPath === '/author' && currentUser) {
    content = (
      <AuthorDashboard
        posts={myPosts}
        onCreate={openCreatePost}
        onOpenAi={() => setIsAiModalOpen(true)}
        onDetail={(post) => navigate(`/posts/${post.slug}`)}
        onEdit={openEditPost}
        onDelete={handleDeletePost}
        onTogglePublish={handleTogglePublish}
      />
    )
  } else if (currentPath === '/admin' && currentUser) {
    content = isAdmin ? (
      <AdminDashboard users={adminUsers} posts={adminPosts} />
    ) : (
      <div
        className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4"
        data-testid="forbidden"
      >
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Akses Ditolak</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Halaman ini hanya dapat diakses oleh pengguna dengan peran admin.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-xs transition cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </div>
    )
  } else if (slugMatch) {
    content = (
      <PublicArticleDetail
        post={detailReady ? detail.post : null}
        loading={!detailReady}
        onBack={() => navigate('/')}
      />
    )
  } else {
    content = (
      <PublicArticleList
        posts={publicPosts}
        loading={publicLoading}
        user={currentUser}
        onOpenPost={(slug) => navigate(`/posts/${slug}`)}
        onNavigate={navigate}
      />
    )
  }

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors"
      data-testid="app-container"
    >
      <StickyNavbar
        user={currentUser}
        currentPath={currentPath}
        onNavigate={navigate}
        onLogout={handleLogout}
        mode={mode}
        accent={accent}
        accents={accents}
        onToggleMode={toggleMode}
        onChangeAccent={changeAccent}
      />

      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">{content}</main>

      <AuthModal
        isOpen={needsLogin}
        onClose={() => {
          // Dipanggil juga setelah login sukses (token sudah ada) -> jangan menimpa navigasi role.
          if (!apiHelper.getAccessToken()) navigate('/')
        }}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <PostModal
        isOpen={isPostModalOpen}
        onClose={closePostModal}
        onSave={handleSavePost}
        post={editingPost}
        initialData={postSeed}
      />

      <AiPostGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerate={handleGenerateAi}
        onApply={handleApplyAi}
        loading={aiLoading}
      />
    </div>
  )
}
