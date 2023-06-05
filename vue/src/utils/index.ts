export function pad2Num(num: number, len = 2) {
  return num.toString().padStart(len, '0')
}

export function formatDate(date: Date) {
  if (!date) {
    return ''
  }
  const year = date.getFullYear() + '-'
  const month = pad2Num(date.getMonth() + 1) + '-'
  const day = pad2Num(date.getDate())
  const hours = ' ' + pad2Num(date.getHours()) + ':'
  const minutes = pad2Num(date.getMinutes())
  return [year, month, day, hours, minutes].join('')
}

export const copyToClipboard = (text: string) => {
  const input = document.createElement('textarea')
  input.value = text
  document.body.appendChild(input)
  input.select()
  document.execCommand('Copy')
  document.body.removeChild(input)
}

export const aLinkDownload = (src: string, name?) => {
  try {
    if ('download' in document.createElement('a')) {
      const a = document.createElement('a')
      if (name) a.download = name
      a.style.display = 'none'
      a.href = src
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(a.href) // 释放URL 对象
      document.body.removeChild(a)
    } else {
      const elemIF = document.createElement('iframe')
      elemIF.src = src
      elemIF.style.display = 'none'
      document.body.appendChild(elemIF)
    }
  } catch (e) {
    console.error(e)
    window.open(src)
  }
}

export const handleReadSelectedFile = (file, parseJson = false) => {
  // console.log(file)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        let val = reader.result
        if (parseJson && typeof val === 'string') {
          val = JSON.parse(val)
        }
        resolve(val)
      } catch (error: any) {
        reject(error)
        window.$message.error('Import Failed! ' + error.message)
      }
    }
    reader.readAsText(file)
  })
}
