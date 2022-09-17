import keepassIcons from '@/assets/keepass-xc-icons.json'
export default keepassIcons.map((url) => {
  return `${import.meta.env.BASE_URL}${url}`
})
