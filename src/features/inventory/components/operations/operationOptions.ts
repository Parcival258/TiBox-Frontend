export const priorityOptions = [
  { label: 'Baja', value: 'low' },
  { label: 'Media', value: 'medium' },
  { label: 'Alta', value: 'high' },
  { label: 'Critica', value: 'critical' },
]

export function responsibleSearchText(responsible: {
  email?: string
  jobTitle?: string | null
  name: string
}) {
  return [responsible.name, responsible.email, responsible.jobTitle].filter(Boolean).join(' ')
}
