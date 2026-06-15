import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
const SUBJECTS = [
  'Технічна проблема',
  'Питання щодо ліцензії',
  'Питання щодо виплат',
  'Скарга на актив',
  'Пропозиції щодо покращення',
  'Інше',
]

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 4 }, py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip label="Підтримка" color="primary" size="small" sx={{ mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>Зв'язатися з нами</Typography>
          <Typography color="text.secondary">
            Маєте питання або пропозиції? Ми відповідаємо впродовж 24 годин у робочі дні.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[
                { icon: <EmailOutlinedIcon color="primary" />, title: 'Email', text: 'support@assetmaster.com' },
                { icon: <ScheduleOutlinedIcon color="primary" />, title: 'Час відповіді', text: 'До 24 годин у будні' },
                { icon: <HelpOutlineIcon color="primary" />, title: 'FAQ', text: 'Часті запитання на /faq' },
              ].map(item => (
                <Paper key={item.title} variant="outlined" sx={{ p: 2.5, borderRadius: 2, display: 'flex', gap: 2 }}>
                  {item.icon}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.text}</Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
              {sent ? (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  Дякуємо! Ваше повідомлення надіслано. Ми зв'яжемося з вами найближчим часом.
                </Alert>
              ) : (
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField label="Ваше ім'я" value={form.name} onChange={e => set('name', e.target.value)} fullWidth required />
                    <TextField label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} fullWidth required />
                  </Box>
                  <TextField
                    select label="Тема" value={form.subject} onChange={e => set('subject', e.target.value)} fullWidth required
                  >
                    {SUBJECTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                  <TextField
                    label="Повідомлення"
                    value={form.message}
                    onChange={e => set('message', e.target.value)}
                    multiline rows={5} fullWidth required
                  />
                  <Button type="submit" variant="contained" size="large">
                    Надіслати повідомлення
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
  )
}
