import React from 'react'
import { range } from 'lodash'
import { useSelectedChapter, useSelectedDictionary } from 'store/AppState'
import ChapterButton from './ChapterButton'
import { DefaultWordsPerChapter } from 'pages/Typing/hooks/useWordList'

const ChapterGroup: React.FC<ChapterGroupProps> = ({ totalWords }) => {
  const [selectedChapter, setSelectedChapter] = useSelectedChapter()
  const selectedDictionary = useSelectedDictionary()
  const numWordsPerChapter = selectedDictionary.chapterLength ?? DefaultWordsPerChapter
  const chapterCount = Math.ceil(totalWords / numWordsPerChapter)
  return (
    <main className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mr-4">
      {range(chapterCount).map((index) =>
        index + 1 === chapterCount ? (
          <ChapterButton
            wordCount={totalWords % numWordsPerChapter || numWordsPerChapter}
            key={index}
            selected={selectedChapter === index}
            index={index}
            onClick={() => setSelectedChapter(index)}
          />
        ) : (
          <ChapterButton
            wordCount={numWordsPerChapter}
            key={index}
            selected={selectedChapter === index}
            index={index}
            onClick={() => setSelectedChapter(index)}
          />
        ),
      )}
    </main>
  )
}

export default ChapterGroup

export type ChapterGroupProps = {
  totalWords: number
}
