import { Howl } from 'howler'

export const isLegal = (val: string): boolean => /^[a-z_A-Z_._(_)_{_}_<_>_+_0-9'"!,='@#$%`:~^&*?\-;[\]\\/]$/.test(val)
export const isChineseSymbol = (val: string): boolean =>
  /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(
    val,
  )

export const IsDesktop = () => {
  const userAgentInfo = navigator.userAgent
  const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']

  let flag = true
  for (let v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false
      break
    }
  }
  return flag
}

export function addHowlListener(howl: Howl, ...args: Parameters<Howl['on']>) {
  howl.on(...args)

  return () => howl.off(...args)
}

export function classNames(...classNames: Array<string | void | null>) {
  const finallyClassNames: string[] = []

  for (const className of classNames) {
    if (className) {
      finallyClassNames.push(className.trim())
    }
  }

  return finallyClassNames.join(' ')
}

export type WordAtom = { name: string; startIndex: number; endIndex: number }
export function transWordAtoms(word: string) {
  const wordAtoms: WordAtom[] = []
  let prevChr = ''
  let curSubWord = ''
  let curSubWordStartIdx = 0

  if (word) {
    word.split('').forEach((chr, chrIdx) => {
      prevChr = chrIdx === 0 ? '^' : word[chrIdx - 1]

      if (/[a-zA-Z0-9']/.test(chr)) {
        if (/[^a-zA-Z0-9']/.test(prevChr)) {
          curSubWord = ''
          curSubWordStartIdx = chrIdx
        }
        curSubWord += chr

        if (chrIdx === word.length - 1) {
          wordAtoms.push({ name: curSubWord, startIndex: curSubWordStartIdx, endIndex: chrIdx - 1 })
        }
      } else if (/[a-zA-Z0-9']/.test(prevChr)) {
        wordAtoms.push({ name: curSubWord, startIndex: curSubWordStartIdx, endIndex: chrIdx - 1 })
      }
    })
  }
  return wordAtoms
}
