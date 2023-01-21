import cet4 from 'assets/CET4_T.json'
import new900_1 from 'assets/NEW900_1.json'
import { shuffle } from 'lodash'
import { useMemo } from 'react'
import { useSelectedDictionary, useRandomState, useSelectedChapterRange, SelectedChapterRange } from 'store/AppState'
import useSWR from 'swr'
import { WordAtom, transWordAtoms } from 'utils/utils'

export type Word = {
  name: string
  trans: string[]
  wordAtoms?: WordAtom[]
  usphone?: string
  ukphone?: string
}

const DefaultWordsPerChapter = 20

export type UseChoiceWordListResult = {
  dictName: string
  chapterRange: SelectedChapterRange
  chapterListLength: number
  words: Word[]
  setChapterNumberRange: (range: SelectedChapterRange) => void
}

/**
 * Use word lists from the current selected dictionary.
 * When the data is loading, this returns `undefined`.
 */
export function useChoiceWordList(): UseChoiceWordListResult | undefined {
  const selectedDictionary = useSelectedDictionary()
  const [random] = useRandomState()
  const [currentChapterRange, setCurrentChapterRange] = useSelectedChapterRange()
  const numWordsPerChapter = selectedDictionary.chapterLength ?? DefaultWordsPerChapter
  const { data: wordList } = useSWR([selectedDictionary.id, selectedDictionary.url, numWordsPerChapter], fetchWordList)
  const words = useMemo(
    () =>
      wordList
        ? wordList.words.slice(currentChapterRange.start * numWordsPerChapter, (currentChapterRange.end + 1) * numWordsPerChapter)
        : [],
    [wordList, currentChapterRange, numWordsPerChapter],
  )
  words.forEach((word) => {
    word.wordAtoms = transWordAtoms(word.name)
  })
  const shuffleWords = useMemo(() => (random ? shuffle(words) : words), [random, words])
  return wordList === undefined
    ? undefined
    : {
        dictName: selectedDictionary.name,
        chapterRange: currentChapterRange,
        chapterListLength: wordList.totalChapters,
        words: shuffleWords,
        setChapterNumberRange: setCurrentChapterRange,
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
  } else {
    const response = await fetch(url)
    const words: Word[] = await response.json()
    return { words, totalChapters: Math.ceil(words.length / numWordsPerChapter) }
  }
}
