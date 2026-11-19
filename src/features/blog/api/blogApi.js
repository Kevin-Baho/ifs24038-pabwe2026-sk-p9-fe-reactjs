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
  async function getMyPosts() {
    const res = await apiHelper.fetchData('/posts')
    return res.data || []
  }

  async function createPost(data) {
    const res = await apiHelper.fetchData('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.data
  }

  async function updatePost(id, data) {
    const res = await apiHelper.fetchData(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return res.data
  }

  async function deletePost(id) {
    const res = await apiHelper.fetchData(`/posts/${id}`, {
      method: 'DELETE',
    })
    return res.data
  }

  async function setPostStatus(id, status) {
    const res = await apiHelper.fetchData(`/posts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    return res.data
  }

  // ---------- AI Generator + Search Engine ----------
  async function generateAiPost(data) {
    const res = await apiHelper.fetchData('/posts/ai-generate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return { ...res.data, search_sources: res.data.search_sources || [] }
  }

  return {
    getPublicPosts,
    getPublicPostBySlug,
    getMyPosts,
    createPost,
    updatePost,
    deletePost,
    setPostStatus,
    generateAiPost,
  }
})()

export default blogApi
