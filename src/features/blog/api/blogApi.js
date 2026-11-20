import apiHelper from '../../../helpers/apiHelper'

const blogApi = (() => {
  // ---------- Publik (Guest) ----------
  async function getPublicPosts() {
    const res = await apiHelper.fetchData('/public/posts')
    return res.data || []
  }

  async function getPublicPostBySlug(slug) {
    const res = await apiHelper.fetchData(`/public/posts/${slug}`)
    return res.data
  }

  // ---------- Penulis (Login) ----------
  async function getPostStats() {
    const res = await apiHelper.fetchData('/api/posts/stats')
    return res.data
  }

  async function getMyPosts() {
    const res = await apiHelper.fetchData('/api/posts')
    return res.data || []
  }

  async function createPost(data) {
    const res = await apiHelper.fetchData('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.data
  }

  async function getPostById(id) {
    const res = await apiHelper.fetchData(`/api/posts/${id}`)
    return res.data
  }

  async function updatePost(id, data) {
    const res = await apiHelper.fetchData(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return res.data
  }

  async function deletePost(id) {
    const res = await apiHelper.fetchData(`/api/posts/${id}`, {
      method: 'DELETE',
    })
    return res.data
  }

  async function togglePublish(id) {
    const res = await apiHelper.fetchData(`/api/posts/${id}/toggle-publish`, {
      method: 'PATCH',
    })
    return res.data
  }

  // ---------- AI Generator + Search Engine ----------
  async function generateAiPost(data) {
    const res = await apiHelper.fetchData('/api/posts/ai-generate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return { ...res.data, search_sources: res.data.search_sources || [] }
  }

  return {
    getPublicPosts,
    getPublicPostBySlug,
    getPostStats,
    getMyPosts,
    createPost,
    getPostById,
    updatePost,
    deletePost,
    togglePublish,
    generateAiPost,
  }
})()

export default blogApi
