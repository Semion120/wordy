export default function todayMSK() {
  const now = new Date()
  const hoursMSK = now.getHours() + 3
  now.setHours(hoursMSK)
  return now
}
