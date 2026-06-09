import client from '../../shared/api/client'
import type { AuthorAssetDto, AssetDetailDto } from '../../entities/asset/types'

export interface AssetFormData {
  title: string
  description?: string
  categoryId: number
  price: number
  licenseType: 'STANDARD' | 'COMMERCIAL'
  tags?: string
  previewUrls?: string
  file?: FileList | null
}

function buildFormData(data: AssetFormData): FormData {
  const fd = new FormData()
  fd.append('title', data.title)
  if (data.description) fd.append('description', data.description)
  fd.append('categoryId', String(data.categoryId))
  fd.append('price', String(data.price))
  fd.append('licenseType', data.licenseType)
  if (data.tags) fd.append('tags', data.tags)
  if (data.previewUrls) fd.append('previewUrls', data.previewUrls)
  if (data.file?.[0]) fd.append('file', data.file[0])
  return fd
}

export async function fetchMyAssets(): Promise<AuthorAssetDto[]> {
  const { data } = await client.get<AuthorAssetDto[]>('/assets/mine')
  return data
}

export async function createAsset(formData: AssetFormData): Promise<AssetDetailDto> {
  const { data } = await client.post<AssetDetailDto>('/assets', buildFormData(formData))
  return data
}

export async function updateAsset(id: number, formData: Partial<AssetFormData>): Promise<AssetDetailDto> {
  const fd = new FormData()
  if (formData.title)        fd.append('title', formData.title)
  if (formData.description !== undefined) fd.append('description', formData.description ?? '')
  if (formData.categoryId)   fd.append('categoryId', String(formData.categoryId))
  if (formData.price)        fd.append('price', String(formData.price))
  if (formData.licenseType)  fd.append('licenseType', formData.licenseType)
  if (formData.tags !== undefined) fd.append('tags', formData.tags ?? '')
  if (formData.previewUrls !== undefined) fd.append('previewUrls', formData.previewUrls ?? '')
  if (formData.file?.[0])    fd.append('file', formData.file[0])

  const { data } = await client.put<AssetDetailDto>(`/assets/${id}`, fd)
  return data
}

export async function deleteAsset(id: number): Promise<void> {
  await client.delete(`/assets/${id}`)
}
