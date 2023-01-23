import Main from 'components/Main'
import Phonetic from 'components/Phonetic'
import useSwitcherState from 'pages/Typing/hooks/useSwitcherState'
import Progress from 'pages/Typing/Progress'
import React, { useEffect, useState } from 'react'
import { useDictionaries, useSelectedDictionary, useSetDictionary } from 'store/AppState'
import { useChoiceWordList } from './hooks/useChoiceWordList'
import { DefaultWordsPerChapter } from 'pages/Typing/hooks/useWordList'
import Word from 'components/Word'
import { shuffle } from 'lodash'

export function ChoiceApp() {
  const [order, setOrder] = useState<number>(0)

  const [switcherState] = useSwitcherState({ wordVisible: true, phonetic: false })
  const wordList = useChoiceWordList()
  const dictionaries = useDictionaries()
  const setDictionary = useSetDictionary()
  const selectedDictionary = useSelectedDictionary()
  const numWordsPerChapter = selectedDictionary.chapterLength ?? DefaultWordsPerChapter

  const [visible, setVisible] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)

  const word = wordList?.words[order]

  useEffect(() => {
    if (visible) {
      document.title = word?.name ?? ''
    } else {
      document.title = word?.trans[0] ?? ''
    }
  }, [visible, word])

  useEffect(() => {
    let handleTimer: NodeJS.Timeout | undefined = undefined
    let handleTimer2: NodeJS.Timeout | undefined = undefined
    function nextWord() {
      let curword = word

      setOrder((order) => {
        const newWordIdx = Math.max(0, order + 1)
        const newOrder = newWordIdx >= (wordList?.words?.length ?? 0) ? 0 : newWordIdx
        curword = wordList?.words[newOrder]

        return newOrder
      })

      handleTimer = setTimeout(nextWord, 2000 * (curword?.wordAtoms?.length ?? 1))
      handleTimer2 = setTimeout(() => {
        setVisible(true)
      }, 1000 * (curword?.wordAtoms?.length ?? 1))
      setVisible(false)
    }

    if (autoPlay) {
      nextWord()
    } else {
      handleTimer && clearTimeout(handleTimer)
      handleTimer2 && clearTimeout(handleTimer2)
    }

    return () => {
      handleTimer && clearTimeout(handleTimer)
      handleTimer2 && clearTimeout(handleTimer2)
    }
  }, [autoPlay])

  return (
    <Main>
      <div className="container h-full relative flex mx-auto flex-col items-center">
        <div className="w-full text-center">
          <span className="text-xs text-gray-500 dark:text-gray-300">温馨提示: 使用电脑食用风味更佳</span>
        </div>
        <div className="p-4">
          <select
            defaultValue={selectedDictionary.id}
            onChange={(e) => {
              setDictionary(e.currentTarget.selectedOptions[0].value)
              setOrder(0)
            }}
          >
            {dictionaries.map((dic) => (
              <option key={dic.id} value={dic.id}>
                {dic.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pb-10">
          <select
            value={wordList?.chapterRange.start}
            onChange={(e) => {
              const num = parseInt(e.currentTarget.selectedOptions[0].value)
              wordList?.setChapterNumberRange({ start: num, end: num })
              setOrder(0)
              setVisible(false)
            }}
          >
            {Array.from({ length: Math.ceil(selectedDictionary.length / numWordsPerChapter) }).map((_, idx) => {
              return (
                <option key={idx} value={idx}>
                  第{idx + 1}章
                </option>
              )
            })}
          </select>
          <span> 至 </span>
          <select
            value={wordList?.chapterRange.end}
            onChange={(e) => {
              const num = parseInt(e.currentTarget.selectedOptions[0].value)
              wordList?.setChapterNumberRange({ start: wordList.chapterRange.start, end: num })
              setOrder(0)
              setVisible(false)
            }}
          >
            {Array.from({ length: Math.ceil(selectedDictionary.length / numWordsPerChapter) }).map((_, idx) => {
              return (wordList?.chapterRange.start ?? 0) > idx ? null : (
                <option key={idx} value={idx}>
                  第{idx + 1}章
                </option>
              )
            })}
          </select>
        </div>
        {word ? (
          <div className="container h-full p-2">
            <div
              className="pt-20"
              onClick={(e) => {
                let isNext = true
                if (e.clientX / window.screen.availWidth < 0.5) {
                  isNext = false
                }
                if (isNext) {
                  if (visible) {
                    setVisible(false)
                    const newWordIdx = Math.max(0, order + 1)
                    setOrder(newWordIdx >= (wordList?.words?.length ?? 0) ? 0 : newWordIdx)
                  } else {
                    setVisible(true)
                  }
                } else {
                  if (visible) {
                    setVisible(false)
                  } else {
                    setOrder(Math.min(Math.max(0, order - 1), wordList?.words?.length ?? 0))
                  }
                }
              }}
            >
              <div className="pt-5 text-center dark:text-white">{word.trans[0]}</div>

              <div className="pb-20">
                <Word
                  key={`word-${word.name}-${order}`}
                  word={word.name}
                  onFinish={() => {}}
                  isStart={true}
                  isLoop={false}
                  wordVisible={visible}
                  WordAtoms={word.wordAtoms}
                />
              </div>
              {visible && switcherState.phonetic && (word.usphone || word.ukphone) && (
                <Phonetic usphone={word.usphone} ukphone={word.ukphone} />
              )}
            </div>
            <div className="pt-10 pb-10">
              <Progress order={order} wordsLength={wordList?.words?.length ?? 0} />
            </div>
            <div className="flex items-center mb-4 justify-center">
              <input
                id="auto-play"
                type="checkbox"
                checked={autoPlay}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                onChange={() => {
                  setAutoPlay(!autoPlay)
                }}
              />
              <label htmlFor="auto-play" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                自动播放
              </label>
            </div>

            {false && selectedDictionary.sentence && (
              <div>
                <h4 className="text-center dark:text-white">提示</h4>
                <div className="flex flex-wrap justify-center">
                  {shuffle(word?.wordAtoms)?.map((wordAtom, idx) => {
                    return (
                      <span className={`dark:text-white bg-gray-500 p-1 m-1 rounded-md `} key={`${wordAtom.name}-${idx}`}>
                        {wordAtom.name}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Main>
  )
}
