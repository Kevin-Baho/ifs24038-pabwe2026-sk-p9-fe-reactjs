import apiHelper from '../../../helpers/apiHelper'

const adminApi = (() => {
  async function getUsers() {
    const res = await apiHelper.fetchData('/admin/users')
    return res.data || []
  }

  async function getPosts() {
    const res = await apiHelper.fetchData('/admin/posts')
    return res.data || []
  }

  return {
    getUsers,
    getPosts,
  }
})()

export default adminApi
