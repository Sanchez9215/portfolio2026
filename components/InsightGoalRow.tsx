'use client'
import { useLayoutEffect, useRef } from 'react'
import Card from './Card'
import Block from './Block'
import styles from './InsightGoalRow.module.css'

interface Item {
  label: string
  title: string
  body: string
}

interface Props {
  items: [Item, Item]
  className?: string
}

export default function InsightGoalRow({ items, className }: Props) {
  const rowRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<SVGLineElement>(null)

  useLayoutEffect(() => {
    function measure() {
      const row = rowRef.current
      const line = lineRef.current
      if (!row || !line) return

      const headings = row.querySelectorAll<HTMLElement>('[data-tb-heading]')
      if (headings.length < 2) return

      const rc = row.getBoundingClientRect()
      const ih = headings[0].getBoundingClientRect()
      const gh = headings[1].getBoundingClientRect()

      line.setAttribute('x1', String(ih.right - rc.left))
      line.setAttribute('y1', String(ih.bottom - rc.top))
      line.setAttribute('x2', String(gh.left - rc.left))
      line.setAttribute('y2', String(gh.bottom - rc.top))
    }

    measure()

    const observer = new ResizeObserver(measure)
    if (rowRef.current) observer.observe(rowRef.current)
    return () => observer.disconnect()
  }, [])

  const [first, second] = items

  return (
    <div
      ref={rowRef}
      className={`${styles.row}${className ? ` ${className}` : ''}`}
    >
      <Card
        variant="ghost"
        label={first.label}
        labelSize="xs"
        title={first.title}
        titleSize="md"
        separator
        className={styles.item}
      >
        <Block size="md" color="tertiary">{first.body}</Block>
      </Card>
      <Card
        variant="ghost"
        label={second.label}
        labelSize="xs"
        title={second.title}
        titleSize="md"
        separator
        className={`${styles.item} ${styles.itemOffset}`}
      >
        <Block size="md" color="tertiary">{second.body}</Block>
      </Card>
      <svg className={styles.connector} aria-hidden="true">
        <line ref={lineRef} className={styles.connectorLine} />
      </svg>
    </div>
  )
}
