import cet4 from 'assets/CET4_T.json'
import new900_1 from 'assets/NEW900_1.json'
import ielts900 from 'assets/ielts900.json'
import w100_7000 from 'assets/100_7000.json'
import common_style_180 from 'assets/common_style_180.json'
import { shuffle } from 'lodash'
import { useMemo } from 'react'
import { useSelectedChapter, useSelectedDictionary, useRandomState } from 'store/AppState'
import useSWR from 'swr'

export type Word = {
  name: string
  trans: string[]
  usphone?: string
  ukphone?: string
}

export const DefaultWordsPerChapter = 20

export type UseWordListResult = {
  dictName: string
  chapter: number
  chapterListLength: number
  words: Word[]
  setChapterNumber: (index: number) => void
}

/**
 * Use word lists from the current selected dictionary.
 * When the data is loading, this returns `undefined`.
 */
export function useWordList(): UseWordListResult | undefined {
  const selectedDictionary = useSelectedDictionary()

  const [random] = useRandomState()
  const [currentChapter, setCurrentChapter] = useSelectedChapter()
  const numWordsPerChapter = selectedDictionary.chapterLength ?? DefaultWordsPerChapter
  const { data: wordList } = useSWR([selectedDictionary.id, selectedDictionary.url, numWordsPerChapter], fetchWordList)

  const words = useMemo(
    () => (wordList ? wordList.words.slice(currentChapter * numWordsPerChapter, (currentChapter + 1) * numWordsPerChapter) : []),
    [wordList, currentChapter, numWordsPerChapter],
  )
  const shuffleWords = useMemo(() => (random ? shuffle(words) : words), [random, words])
  return wordList === undefined
    ? undefined
    : {
        dictName: selectedDictionary.name,
        chapter: currentChapter,
        chapterListLength: wordList.totalChapters,
        words: shuffleWords,
        setChapterNumber: setCurrentChapter,
      }
}

type WordList = {
  words: Word[]
  totalChapters: number
}

async function fetchWordList(id: string, url: string, numWordsPerChapter: number): Promise<WordList> {
  if (id === 'cet4') {
    return { words: cet4, totalChapters: Math.ceil(cet4.length / numWordsPerChapter) }
  } else if (id === 'new900_1') {
    return { words: new900_1, totalChapters: Math.ceil(new900_1.length / numWordsPerChapter) }
  } else if (id === 'ielts900') {
    return { words: ielts900, totalChapters: Math.ceil(ielts900.length / numWordsPerChapter) }
  } else if (id === 'common_style_180') {
    return { words: common_style_180, totalChapters: Math.ceil(common_style_180.length / numWordsPerChapter) }
  } else if (id === '100_7000') {
    return { words: w100_7000, totalChapters: Math.ceil(w100_7000.length / numWordsPerChapter) }
  } else {
    const response = await fetch(url)
    const words: Word[] = await response.json()
    return { words, totalChapters: Math.ceil(words.length / numWordsPerChapter) }
  }
}
