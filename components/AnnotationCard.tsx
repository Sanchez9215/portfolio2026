import Card from './Card'
import TitleBlock from './TitleBlock'

export type AnnotationBlock = {
  label: string
  body: string
}

interface AnnotationCardProps {
  title: string
  blocks: AnnotationBlock[]
  className?: string
}

export default function AnnotationCard({ title, blocks, className }: AnnotationCardProps) {
  return (
    <Card variant="filled" label={title} labelSize="sm" gap="md" className={className}>
      {blocks.map((block, i) => (
        <TitleBlock key={i} size="sm" title={block.label} body={block.body} />
      ))}
    </Card>
  )
}
