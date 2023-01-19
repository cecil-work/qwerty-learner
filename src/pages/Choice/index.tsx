import Main from 'components/Main'
import Phonetic from 'components/Phonetic'
import Word from 'components/Word'
import useSwitcherState from 'pages/Typing/hooks/useSwitcherState'
import Progress from 'pages/Typing/Progress'
import React, { useEffect, useState } from 'react'
import { useDictionaries, useSelectedDictionary, useSetDictionary } from 'store/AppState'
import { useChoiceWordList } from './hooks/useChoiceWordList'
import random from 'random'

export function ChoiceApp() {
  const [order, setOrder] = useState<number>(0)

  const [switcherState] = useSwitcherState({ wordVisible: true, phonetic: false })
  const wordList = useChoiceWordList()
  const dictionaries = useDictionaries()
  const setDictionary = useSetDictionary()
  const selectedDictionary = useSelectedDictionary()

  const [visible, setVisible] = useState(false)

  const word = wordList?.words[order]

  useEffect(() => {
    let handleTimer: NodeJS.Timeout
    let handleTimer2: NodeJS.Timeout
    function read() {
      const rndOrder = random.int(0, (wordList?.words.length ?? 1) - 1)

      const word = wordList?.words[rndOrder]
      document.title = word?.trans[0] ?? ''

      handleTimer2 = setTimeout(() => {
        document.title = word?.name ?? ''
      }, Math.max(2000, (word?.name + '').split(' ').length * 1000))

      console.log(rndOrder, wordList)

      handleTimer = setTimeout(read, Math.max(3000, (word?.name + '').split(' ').length * 1500))
    }

    if (wordList) {
      read()
    }
    return () => {
      clearTimeout(handleTimer)
      clearTimeout(handleTimer2)
    }
  }, [wordList])

  return (
    <Main>
      <div className="container h-full relative flex mx-auto flex-col items-center">
        <div className="w-full text-center">
          <span className="text-xs text-gray-500">温馨提示: 使用电脑食用风味更佳</span>
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

        <div className="pb-20">
          <select
            value={wordList?.chapterRange.start}
            onChange={(e) => {
              const num = parseInt(e.currentTarget.selectedOptions[0].value)
              wordList?.setChapterNumberRange({ start: num, end: num })
              setOrder(0)
            }}
          >
            {Array.from({ length: Math.ceil(selectedDictionary.length / 20) }).map((_, idx) => {
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
            }}
          >
            {Array.from({ length: Math.ceil(selectedDictionary.length / 20) }).map((_, idx) => {
              return (wordList?.chapterRange.start ?? 0) > idx ? null : (
                <option key={idx} value={idx}>
                  第{idx + 1}章
                </option>
              )
            })}
          </select>
        </div>
        {word ? (
          <div
            className="container h-full"
            onClick={(e) => {
              let isNext = true
              if (e.clientX / window.screen.availWidth < 0.5) {
                isNext = false
              }
              if (isNext) {
                if (visible) {
                  setVisible(false)
                  setOrder(Math.min(Math.max(0, order + 1), wordList?.words?.length ?? 0))
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
            <div className="pt-20 text-center">{word.trans[0]}</div>

            <div className="pb-20">
              <Word
                key={`word-${word.name}-${order}`}
                word={word.name}
                onFinish={() => {}}
                isStart={true}
                isLoop={false}
                wordVisible={visible}
              />
            </div>
            {switcherState.phonetic && (word.usphone || word.ukphone) && <Phonetic usphone={word.usphone} ukphone={word.ukphone} />}

            <div className="pt-20 pb-10">
              <Progress order={order} wordsLength={wordList?.words?.length ?? 0} />
            </div>
          </div>
        ) : null}
      </div>
    </Main>
  )
}
