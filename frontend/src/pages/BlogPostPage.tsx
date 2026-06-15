import { Link, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { findPost } from '../shared/data/blogPosts'

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
    if (line.startsWith('|') && line.includes('|')) {
      return null
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

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = findPost(slug ?? '')

  if (!post) {
    return (
      <Box sx={{ maxWidth: 760, mx: 'auto', px: { xs: 2, md: 4 }, py: 12, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Стаття не знайдена</Typography>
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

        <Chip label={post.tag} color="primary" size="small" sx={{ mb: 2 }} />

        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.2, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
          {post.title}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 4, color: 'text.disabled' }}>
          <Typography variant="body2">{post.date}</Typography>
          <Typography variant="body2">·</Typography>
          <Typography variant="body2">{post.readTime} читання</Typography>
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
