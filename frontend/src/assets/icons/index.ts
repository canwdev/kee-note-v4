const keepassIcons = import.meta.glob('./keepass-xc/*.svg')

export default Object.values(keepassIcons).map((i) => {
  return new URL(i.name, import.meta.url)
})
