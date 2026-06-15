import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useBlogPosts } from '../features/blog/useBlog'

function BlogCardSkeleton() {
  return (
    <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
      <Skeleton variant="rectangular" height={160} />
      <CardContent>
        <Skeleton width={80} height={24} sx={{ mb: 1 }} />
        <Skeleton width="90%" height={22} />
        <Skeleton width="70%" height={22} sx={{ mb: 2 }} />
        <Skeleton width="50%" height={16} />
      </CardContent>
    </Card>
  )
}

export default function BlogPage() {
  const { data, isLoading } = useBlogPosts()

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Chip label="Блог" color="primary" size="small" sx={{ mb: 2 }} />
        <Typography variant="h2" sx={{ fontWeight: 800 }}>AssetMaster Blog</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Поради, тренди та новини для авторів і покупців
        </Typography>
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <BlogCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {(data?.content ?? []).map(post => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Card
                component={Link}
                to={`/blog/${post.slug}`}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  transition: 'transform .18s ease, box-shadow .18s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                }}
              >
                <Box sx={{ height: 160, bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h2" sx={{ fontSize: '3rem', opacity: 0.3 }}>✍️</Typography>
                </Box>
                <CardContent sx={{ flex: 1 }}>
                  {post.tag && <Chip label={post.tag} size="small" sx={{ mb: 1.5, fontSize: '0.7rem' }} />}
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.4, color: 'text.primary' }}>
                    {post.title}
                  </Typography>
                  {post.excerpt && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {post.excerpt}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography variant="caption" color="text.disabled">
                      {new Date(post.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Typography>
                    {post.readTime && (
                      <>
                        <Typography variant="caption" color="text.disabled">·</Typography>
                        <Typography variant="caption" color="text.disabled">{post.readTime} читання</Typography>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {data?.content.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8, color: 'text.disabled' }}>
                <CircularProgress sx={{ mb: 2, opacity: 0.3 }} />
                <Typography>Статей ще немає</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  )
}
