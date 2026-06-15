import client from '../../shared/api/client'
import type { PageResponse } from '../../entities/asset/types'

export interface BlogPostDto {
  id: number
  slug: string
  tag: string | null
  title: string
  excerpt: string | null
  content: string
  published: boolean
  readTime: string | null
  authorName: string | null
  createdAt: string
  updatedAt: string
}

export const fetchBlogPosts = (page = 0, size = 12): Promise<PageResponse<BlogPostDto>> =>
  client.get('/blog', { params: { page, size } }).then(r => r.data)

export const fetchBlogPost = (slug: string): Promise<BlogPostDto> =>
  client.get(`/blog/${slug}`).then(r => r.data)
