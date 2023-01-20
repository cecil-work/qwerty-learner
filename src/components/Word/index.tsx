import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react'
import Letter, { LetterState } from './Letter'
import { isLegal, isChineseSymbol, IsDesktop } from '../../utils/utils'
import useSounds from 'hooks/useSounds'
import style from './index.module.css'
import WordSound from 'components/WordSound'
import { useAppState } from '../../store/AppState'

const EXPLICIT_SPACE = '␣'

const Word: React.FC<WordProps> = ({ word = 'defaultWord', onFinish, isStart, isLoop, wordVisible = true }) => {
  const originWord = word

  word = word.replace(new RegExp(' ', 'g'), EXPLICIT_SPACE)
  word = word.replace(new RegExp('…', 'g'), '..')
  word = word.replace(new RegExp('⋯', 'g'), '..')

  const [inputWord, setInputWord] = useState('')
  const [statesList, setStatesList] = useState<LetterState[]>([])
  const [isFinish, setIsFinish] = useState(false)
  const [hasWrong, setHasWrong] = useState(false)
  const [playKeySound, playBeepSound, playHintSound] = useSounds()
  const { pronunciation } = useAppState()
  const [subWord, setSubWord] = useState<string>('')

  const onKeydown = useCallback(
    (e) => {
      const char = e.key
      if (char === ' ') {
        // 防止用户惯性按空格导致页面跳动
        e.preventDefault()
        setInputWord((value) => (value += EXPLICIT_SPACE))
        playKeySound()
      }
      if (isChineseSymbol(char)) {
        alert('您正在使用中文输入法输入，请关闭输入法')
      }
      if (isLegal(char) && !e.altKey && !e.ctrlKey && !e.metaKey) {
        setInputWord((value) => (value += char))
        playKeySound()
      } else if (char === 'Backspace') setInputWord((value) => value.substr(0, value.length - 1))
    },
    [playKeySound],
  )

  useEffect(() => {
    if (isStart && (!isFinish || isLoop)) {
      setIsFinish(false)
      window.addEventListener('keydown', onKeydown)
    }
    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
  }, [isStart, isFinish, onKeydown, isLoop])

  useEffect(() => {
    if (isFinish) {
      playHintSound()
      setInputWord('')
      onFinish()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinish, hasWrong, playHintSound])

  useEffect(() => {
    if (hasWrong) {
      playBeepSound()
      const timer = setTimeout(() => {
        setInputWord('')
        setHasWrong(false)
      }, 300)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [hasWrong, isFinish, playBeepSound])

  useLayoutEffect(() => {
    let hasWrong = false,
      wordLength = word.length,
      inputWordLength = inputWord.length
    const statesList: LetterState[] = []

    for (let i = 0; i < wordLength && i < inputWordLength; i++) {
      if (word[i] === inputWord[i]) {
        statesList.push('correct')
      } else {
        hasWrong = true
        statesList.push('wrong')
        setHasWrong(true)
        break
      }
    }

    if (!hasWrong && inputWordLength >= wordLength) {
      setIsFinish(true)
    }
    setStatesList(statesList)
  }, [inputWord, word])

  const playWordSound = pronunciation !== false

  let wordXlRate = 5

  const wordCount = word.split('␣').length

  if (wordCount > 5) {
    wordXlRate = 3
  }
  if (wordCount > 7) {
    wordXlRate = 1
  }
  if (!IsDesktop()) {
    wordXlRate = 1
  }

  const subWords: { subWord: string; startIndex: number; endIndex: number }[] = []
  let prevChr = ''
  let curSubWord = ''
  let curSubWordStartIdx = 0

  word.split('').forEach((chr, chrIdx) => {
    prevChr = chrIdx === 0 ? '^' : word[chrIdx - 1]

    if (/[a-zA-Z0-9']/.test(chr)) {
      if (/[^a-zA-Z0-9']/.test(prevChr)) {
        curSubWord = ''
        curSubWordStartIdx = chrIdx
      }
      curSubWord += chr
    } else if (/[a-zA-Z0-9']/.test(prevChr)) {
      subWords.push({ subWord: curSubWord, startIndex: curSubWordStartIdx, endIndex: chrIdx - 1 })
    }
  })

  return (
    <div className="text-center pt-4 pb-1">
      <div className={`${hasWrong ? style.wrong : ''} break-all`}>
        {word.split('').map((t, index) => {
          return (
            <Letter
              key={`${index}-${t}`}
              visible={/[^a-zA-Z0-9']/.test(t) || statesList[index] === 'correct' ? true : wordVisible}
              letter={t}
              state={statesList[index]}
              fontXlRate={wordXlRate}
              onClick={(e) => {
                if (wordVisible) {
                  const subWord = subWords.find((w) => w.startIndex <= index && w.endIndex >= index)

                  if (subWord) {
                    setSubWord(subWord?.subWord)
                    console.log(subWord.subWord)
                  }
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}
            />
          )
        })}
      </div>
      <div className="relative hidden">
        {playWordSound && (wordVisible || IsDesktop()) && (
          <WordSound word={originWord} inputWord={inputWord} className={`${style['word-sound']}`} />
        )}
        {subWord ? <WordSound word={subWord} inputWord={''} className={`${style['word-sound']}`} /> : null}
      </div>
    </div>
  )
}

export type WordProps = {
  word: string
  onFinish: Function
  isStart: boolean
  wordVisible: boolean
  isLoop: boolean
}
export default Word
