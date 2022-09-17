const Fs = require('fs')
const Path = require('path')

const list = Fs.readdirSync(Path.join(__dirname, './keepass-xc'))

Fs.writeFileSync(
  Path.join(__dirname, 'keepass-xc-icons.json'),
  JSON.stringify(
    list.map((i) => {
      return `images/keepass-xc/${i}`
    })
  )
)
