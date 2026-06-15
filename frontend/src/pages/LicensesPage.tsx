import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DoNotDisturbAltOutlinedIcon from '@mui/icons-material/DoNotDisturbAltOutlined'
import Navbar from '../widgets/Navbar/Navbar'

const YES = <CheckCircleOutlineIcon fontSize="small" color="success" />
const NO = <DoNotDisturbAltOutlinedIcon fontSize="small" color="error" />

const ROWS = [
  { use: 'Особисте або навчальне використання',       standard: YES, commercial: YES },
  { use: 'Веб-сайти та застосунки',                   standard: YES, commercial: YES },
  { use: 'Комерційні проєкти / клієнтська робота',    standard: NO,  commercial: YES },
  { use: 'Соціальні мережі та реклама',               standard: YES, commercial: YES },
  { use: 'Друкована продукція',                       standard: YES, commercial: YES },
  { use: 'Перепродаж активу (raw)',                   standard: NO,  commercial: NO  },
  { use: 'Вбудування у шаблони для перепродажу',      standard: NO,  commercial: YES },
  { use: 'Необмежена кількість проєктів',             standard: NO,  commercial: YES },
]

export default function LicensesPage() {
  return (
    <>
      <Navbar />
      <Box sx={{ maxWidth: 860, mx: 'auto', px: { xs: 2, md: 4 }, py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip label="Ліцензування" color="primary" size="small" sx={{ mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>Умови ліцензування</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
            Усі активи на AssetMaster поставляються з однією з двох ліцензій.
            Перед покупкою переконайтесь, що обрана ліцензія відповідає вашому використанню.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, mb: 6, flexWrap: 'wrap' }}>
          <Paper variant="outlined" sx={{ flex: 1, p: 3, borderRadius: 3, minWidth: 220 }}>
            <Chip label="Стандартна" size="small" sx={{ mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Standard License</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
              Дозволяє використовувати актив в одному кінцевому продукті для особистих
              або комерційних цілей. Не дозволяє перепродаж або включення у шаблони.
            </Typography>
          </Paper>
          <Paper variant="outlined" sx={{ flex: 1, p: 3, borderRadius: 3, minWidth: 220, borderColor: 'primary.main', bgcolor: 'primary.light' }}>
            <Chip label="Комерційна" color="primary" size="small" sx={{ mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark' }}>Commercial License</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
              Розширені права для необмеженого комерційного використання, включення у
              продукти для перепродажу та роботу з клієнтами.
            </Typography>
          </Paper>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Порівняння ліцензій</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 700 }}>Використання</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Стандартна</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Комерційна</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ROWS.map(row => (
                <TableRow key={row.use} hover>
                  <TableCell>{row.use}</TableCell>
                  <TableCell align="center">{row.standard}</TableCell>
                  <TableCell align="center">{row.commercial}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            <strong>Важливо:</strong> Ліцензія поширюється лише на цифровий файл активу.
            Авторські права на твір залишаються за автором. AssetMaster не несе відповідальності
            за порушення ліцензійних умов покупцем.
            Якщо у вас є сумніви щодо відповідності ліцензії — зверніться до нас через /contact.
          </Typography>
        </Box>
      </Box>
    </>
  )
}
