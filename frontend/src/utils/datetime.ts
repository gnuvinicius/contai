export function toDateTimeLocal(value: string) {
  const date = new Date(value)

  const pad = (number: number) => String(number).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function fromDateTimeLocal(value: string) {
  return new Date(value).toISOString()
}
