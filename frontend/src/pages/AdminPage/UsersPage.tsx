import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import TablePagination from '@mui/material/TablePagination'
import { useAdminUsers, useUpdateUserRole } from '../../features/admin-panel/useAdmin'
import type { AdminUserDto } from '../../entities/asset/types'

const ROLE_LABELS: Record<AdminUserDto['role'], string> = {
  ROLE_USER: 'Покупець',
  ROLE_AUTHOR: 'Автор',
  ROLE_ADMIN: 'Адмін',
}

const ROLE_COLORS: Record<AdminUserDto['role'], 'default' | 'primary' | 'error'> = {
  ROLE_USER: 'default',
  ROLE_AUTHOR: 'primary',
  ROLE_ADMIN: 'error',
}

export default function UsersPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useAdminUsers(page)
  const updateRole = useUpdateUserRole()

  const handleRoleChange = (user: AdminUserDto, role: string) => {
    if (role === user.role) return
    updateRole.mutate({ id: user.id, role })
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Користувачі
      </Typography>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.paper' }}>
                <TableCell sx={{ fontWeight: 600 }}>Користувач</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Роль</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Верифікований</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Зареєстрований</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.content.map(user => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.displayName ?? '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        #{user.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={user.role}
                        onChange={e => handleRoleChange(user, e.target.value)}
                        disabled={updateRole.isPending}
                        sx={{ minWidth: 130 }}
                        renderValue={val => (
                          <Chip
                            label={ROLE_LABELS[val as AdminUserDto['role']]}
                            size="small"
                            color={ROLE_COLORS[val as AdminUserDto['role']]}
                            sx={{ cursor: 'pointer' }}
                          />
                        )}
                      >
                        <MenuItem value="ROLE_USER">Покупець</MenuItem>
                        <MenuItem value="ROLE_AUTHOR">Автор</MenuItem>
                        <MenuItem value="ROLE_ADMIN">Адмін</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.verified ? 'Так' : 'Ні'}
                        size="small"
                        color={user.verified ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(user.createdAt).toLocaleDateString('uk-UA')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={data?.totalElements ?? 0}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={20}
          rowsPerPageOptions={[20]}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} з ${count}`}
        />
      </Paper>
    </Box>
  )
}
