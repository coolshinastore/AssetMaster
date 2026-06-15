import { Link, useParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useBlogPost } from '../features/blog/useBlog'

function renderContent(md: string) {
  return md.split('\n').map((line, i) => {
    if (line.startsWith('## ')) {
      return <Typography key={i} variant="h5" sx={{ fontWeight: 700, mt: 4, mb: 1.5 }}>{line.slice(3)}</Typography>
    }
    if (line.startsWith('### ')) {
      return <Typography key={i} variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>{line.slice(4)}</Typography>
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return <Typography key={i} variant="body1" sx={{ fontWeight: 700, mt: 1 }}>{line.slice(2, -2)}</Typography>
    }
    if (line.startsWith('- ')) {
      return <Typography key={i} variant="body1" component="li" sx={{ ml: 3, mb: 0.5, color: 'text.secondary' }}>{line.slice(2)}</Typography>
    }
    if (line.trim() === '---') {
      return <Divider key={i} sx={{ my: 3 }} />
    }
    if (line.trim() === '') {
      return <Box key={i} sx={{ mb: 1 }} />
    }
    return (
      <Typography key={i} variant="body1" sx={{ mb: 1, lineHeight: 1.8, color: 'text.secondary' }}>
        {line}
      </Typography>
    )
  })
}

function PostSkeleton() {
  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', px: { xs: 2, md: 4 }, py: 8 }}>
      <Skeleton width={120} height={32} sx={{ mb: 4 }} />
      <Skeleton width={80} height={24} sx={{ mb: 2 }} />
      <Skeleton width="90%" height={40} />
      <Skeleton width="70%" height={40} sx={{ mb: 2 }} />
      <Skeleton width={160} height={20} sx={{ mb: 4 }} />
      <Divider sx={{ mb: 4 }} />
      {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height={24} sx={{ mb: 1 }} />)}
    </Box>
  )
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading, isError } = useBlogPost(slug ?? '')

  if (isLoading) return <PostSkeleton />

  if (isError || !post) {
    return (
      <Box sx={{ maxWidth: 760, mx: 'auto', px: { xs: 2, md: 4 }, py: 12, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Стаття не знайдена</Typography>
        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
          Можливо, стаття була видалена або ще не опублікована.
        </Alert>
        <Button component={Link} to="/blog" variant="contained" startIcon={<ArrowBackIcon />}>
          Повернутись до блогу
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', px: { xs: 2, md: 4 }, py: 8 }}>
      <Button
        component={Link}
        to="/blog"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 4, color: 'text.secondary' }}
      >
        Назад до блогу
      </Button>

      {post.tag && <Chip label={post.tag} color="primary" size="small" sx={{ mb: 2 }} />}

      <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.2, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
        {post.title}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, color: 'text.disabled' }}>
        <Typography variant="body2">
          {new Date(post.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Typography>
        {post.readTime && (
          <>
            <Typography variant="body2">·</Typography>
            <Typography variant="body2">{post.readTime} читання</Typography>
          </>
        )}
        {post.authorName && (
          <>
            <Typography variant="body2">·</Typography>
            <Typography variant="body2">{post.authorName}</Typography>
          </>
        )}
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Box sx={{ '& li': { listStyle: 'disc' } }}>
        {renderContent(post.content)}
      </Box>

      <Divider sx={{ mt: 6, mb: 4 }} />

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button component={Link} to="/blog" variant="outlined" startIcon={<ArrowBackIcon />}>
          Ще статті
        </Button>
      </Box>
    </Box>
  )
}
