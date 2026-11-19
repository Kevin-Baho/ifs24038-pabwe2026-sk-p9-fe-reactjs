import { describe, it, expect, vi, beforeEach } from 'vitest'
import blogApi from './blogApi'
import apiHelper from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  default: {
    fetchData: vi.fn(),
  },
}))

describe('blogApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads public posts and falls back to an empty list when data is null', async () => {
    apiHelper.fetchData.mockResolvedValueOnce({ data: [{ id: 1, title: 'Post' }] })
    expect(await blogApi.getPublicPosts()).toEqual([{ id: 1, title: 'Post' }])
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/public/posts')

    apiHelper.fetchData.mockResolvedValueOnce({ data: null })
    expect(await blogApi.getPublicPosts()).toEqual([])
  })

  it('loads a public post by slug', async () => {
    apiHelper.fetchData.mockResolvedValueOnce({ data: { id: 1, slug: 'belajar-go' } })
    expect(await blogApi.getPublicPostBySlug('belajar-go')).toEqual({ id: 1, slug: 'belajar-go' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/public/posts/belajar-go')
  })

  it('loads author posts and falls back to an empty list when data is null', async () => {
    apiHelper.fetchData.mockResolvedValueOnce({ data: [{ id: 2 }] })
    expect(await blogApi.getMyPosts()).toEqual([{ id: 2 }])
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts')

    apiHelper.fetchData.mockResolvedValueOnce({ data: null })
    expect(await blogApi.getMyPosts()).toEqual([])
  })

  it('creates, updates, deletes posts and changes publication status', async () => {
    apiHelper.fetchData.mockResolvedValueOnce({ data: { id: 1, title: 'New' } })
    expect(await blogApi.createPost({ title: 'New' })).toEqual({ id: 1, title: 'New' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'New' }),
    })

    apiHelper.fetchData.mockResolvedValueOnce({ data: { id: 1, title: 'Updated' } })
    expect(await blogApi.updatePost(1, { title: 'Updated' })).toEqual({ id: 1, title: 'Updated' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts/1', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated' }),
    })

    apiHelper.fetchData.mockResolvedValueOnce({ data: { message: 'Deleted' } })
    expect(await blogApi.deletePost(1)).toEqual({ message: 'Deleted' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts/1', { method: 'DELETE' })

    apiHelper.fetchData.mockResolvedValueOnce({ data: { id: 1, status: 'draft' } })
    expect(await blogApi.setPostStatus(1, 'draft')).toEqual({ id: 1, status: 'draft' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts/1/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'draft' }),
    })
  })

  it('generates AI posts and normalizes missing search_sources to an empty array', async () => {
    apiHelper.fetchData.mockResolvedValueOnce({
      data: { title: 'AI', content: 'Isi', search_sources: ['https://id.wikipedia.org - Go'] },
    })
    expect(await blogApi.generateAiPost({ prompt: 'Go', include_web_search: true })).toEqual({
      title: 'AI',
      content: 'Isi',
      search_sources: ['https://id.wikipedia.org - Go'],
    })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts/ai-generate', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Go', include_web_search: true }),
    })

    apiHelper.fetchData.mockResolvedValueOnce({ data: { title: 'AI 2', content: 'Isi 2', search_sources: null } })
    expect(await blogApi.generateAiPost({ prompt: 'Rust' })).toEqual({
      title: 'AI 2',
      content: 'Isi 2',
      search_sources: [],
    })
  })
})
