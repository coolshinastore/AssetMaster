import { useQuery } from '@tanstack/react-query'
import { fetchBlogPosts, fetchBlogPost } from './blogApi'

const blogKeys = {
  list: (page: number) => ['blog', 'list', page] as const,
  post: (slug: string) => ['blog', 'post', slug] as const,
}

export function useBlogPosts(page = 0) {
  return useQuery({
    queryKey: blogKeys.list(page),
    queryFn: () => fetchBlogPosts(page),
  })
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: blogKeys.post(slug),
    queryFn: () => fetchBlogPost(slug),
    enabled: !!slug,
  })
}
