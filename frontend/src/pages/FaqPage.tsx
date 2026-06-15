import { useState } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Navbar from '../widgets/Navbar/Navbar'

const FAQ = [
  {
    q: 'Як купити актив?',
    a: 'Знайдіть потрібний актив у каталозі, додайте до кошика та оформіть замовлення. Після оплати файл буде доступний для завантаження в розділі «Мої покупки».',
  },
  {
    q: 'Які ліцензії доступні?',
    a: 'AssetMaster пропонує два типи ліцензій: Стандартна (для особистих та некомерційних проєктів) та Комерційна (для комерційного використання без обмежень). Детальніше — на сторінці /licenses.',
  },
  {
    q: 'Як стати автором?',
    a: 'Зареєструйтесь, перейдіть у профіль та змініть роль на "Автор". Після цього ви зможете завантажувати активи через розділ "Мої активи". Кожен актив проходить модерацію перед публікацією.',
  },
  {
    q: 'Яка комісія платформи?',
    a: 'Комісія AssetMaster складає 15–25% від ціни продажу. Відсоток знижується при досягненні вищих обсягів продажів. Це набагато нижче, ніж у Creative Market (30–40%).',
  },
  {
    q: 'Коли виплачуються роялті?',
    a: 'Виплати авторам проводяться щомісяця після досягнення мінімального порогу $50. Реквізити вказуються в розділі «Платіжні реквізити».',
  },
  {
    q: 'Чи є підтримка?',
    a: 'Так! Напишіть нам через форму на сторінці /contact. Ми відповідаємо впродовж 24 годин у робочі дні.',
  },
  {
    q: 'Чи можна отримати повернення коштів?',
    a: 'Повернення можливе протягом 7 днів після покупки, якщо файл не відповідає опису або технічним вимогам. Зверніться до служби підтримки.',
  },
]

export default function FaqPage() {
  const [expanded, setExpanded] = useState<number | false>(false)

  return (
    <>
      <Navbar />
      <Box sx={{ maxWidth: 760, mx: 'auto', px: { xs: 2, md: 4 }, py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip label="FAQ" color="primary" size="small" sx={{ mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 800 }}>Часті запитання</Typography>
        </Box>

        {FAQ.map((item, i) => (
          <Accordion
            key={i}
            expanded={expanded === i}
            onChange={(_, open) => setExpanded(open ? i : false)}
            disableGutters
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              mb: 1,
              borderRadius: '8px !important',
              '&:before': { display: 'none' },
              '&.Mui-expanded': { borderColor: 'primary.main' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3 }}>
              <Typography sx={{ fontWeight: 600 }}>{item.q}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pt: 0 }}>
              <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>{item.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </>
  )
}
