import moment from 'moment/moment'

export function pad2Num(num: number, len = 2) {
  return num.toString().padStart(len, '0')
}

export function formatDate(date) {
  if (!date) {
    return '-'
  }
  return moment(date).format('YYYY-MM-DD HH:mm')
}
