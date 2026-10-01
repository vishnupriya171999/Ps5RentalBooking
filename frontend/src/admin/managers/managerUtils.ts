export const managerDate = (value: string) => value && !Number.isNaN(Date.parse(value))
  ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not available'
