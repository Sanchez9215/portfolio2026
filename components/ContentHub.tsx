'use client'
import { useLayoutEffect, useRef } from 'react'
import {
  forceSimulation, forceLink, forceManyBody,
  forceCenter, forceCollide, forceX, forceY,
} from 'd3-force'
import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force'
import styles from './ContentHub.module.css'

export interface HubNode {
  name: string
  children?: HubNode[]
  // Degrees clockwise from right (0=right, 45=down-right, 90=down, 270=up).
  // When set, all descendants are placed at this angle from their parent post-simulation.
  childrenAngleDeg?: number
}

interface Props {
  title: string
  nodes: HubNode[]
}

interface SimNode extends SimulationNodeDatum {
  id: string
  name: string
  isHub: boolean
  isIntermediate: boolean
  fixedAngleDeg?: number  // inherited from ancestor's childrenAngleDeg
}

type SimLink = SimulationLinkDatum<SimNode>

function buildGraph(title: string, nodes: HubNode[]) {
  const simNodes: SimNode[] = [
    { id: '__hub__', name: title, isHub: true, isIntermediate: false },
  ]
  const rawLinks: { source: string; target: string }[] = []

  function traverse(node: HubNode, parentId: string, inheritedAngle?: number) {
    const id = `node__${node.name}`
    const hasChildren = !!(node.children?.length)
    simNodes.push({ id, name: node.name, isHub: false, isIntermediate: hasChildren, fixedAngleDeg: inheritedAngle })
    rawLinks.push({ source: parentId, target: id })
    if (hasChildren) {
      const childAngle = node.childrenAngleDeg ?? inheritedAngle
      for (const child of node.children!) traverse(child, id, childAngle)
    }
  }

  for (const node of nodes) traverse(node, '__hub__', undefined)
  return { simNodes, rawLinks }
}

function wrapWords(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length > maxChars && line) { lines.push(line); line = word }
    else line = next
  }
  if (line) lines.push(line)
  return lines
}

function bboxEdge(box: DOMRect, dx: number, dy: number): { x: number; y: number } {
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return { x: cx, y: cy }
  const tx = Math.abs(dx) > 0.001 ? (box.width / 2) / Math.abs(dx) : Infinity
  const ty = Math.abs(dy) > 0.001 ? (box.height / 2) / Math.abs(dy) : Infinity
  const t = Math.min(tx, ty)
  return { x: cx + dx * t, y: cy + dy * t }
}

const NS = 'http://www.w3.org/2000/svg'
const el = (tag: string) => document.createElementNS(NS, tag)

export default function ContentHub({ title, nodes }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useLayoutEffect(() => {
    function render() {
      const container = containerRef.current
      const svg = svgRef.current
      if (!container || !svg) return

      const W = container.clientWidth
      const H = container.clientHeight
      if (!W || !H) return

      const cx = W / 2
      const cy = H / 2

      const { simNodes, rawLinks } = buildGraph(title, nodes)
      const leafCount = simNodes.filter(n => !n.isHub).length

      const hub = simNodes.find(n => n.isHub)!
      hub.fx = cx; hub.fy = cy; hub.x = cx; hub.y = cy

      const nonHub = simNodes.filter(n => !n.isHub)
      nonHub.forEach((n, i) => {
        const angle = (i / nonHub.length) * 2 * Math.PI
        const r = Math.min(cx, cy) * 0.6
        n.x = cx + Math.cos(angle) * r
        n.y = cy + Math.sin(angle) * r
      })

      const links = rawLinks.map(l => ({ ...l }))
      const hubRadius = Math.max(72, Math.min(110, leafCount * 14))

      const simulation = forceSimulation<SimNode>(simNodes)
        .force(
          'link',
          forceLink<SimNode, SimLink>(links as SimLink[])
            .id(d => d.id)
            .distance((l: any) => (l.source as SimNode)?.isHub ? hubRadius : 52)
            .strength(1),
        )
        .force('charge', forceManyBody<SimNode>().strength(-220))
        .force('center', forceCenter<SimNode>(cx, cy))
        .force('collide', forceCollide<SimNode>(28))
        .force('boundX', forceX<SimNode>(cx).strength(0.05))
        .force('boundY', forceY<SimNode>(cy).strength(0.05))
        .stop()

      simulation.tick(400)

      const byId = new Map(simNodes.map(n => [n.id, n]))

      // Build parent map and group fixed-angle children per parent
      const parentOf = new Map<string, SimNode>()
      for (const lnk of links as any[]) {
        const src = typeof lnk.source === 'object' ? lnk.source as SimNode : byId.get(lnk.source as string)
        const tgt = typeof lnk.target === 'object' ? lnk.target as SimNode : byId.get(lnk.target as string)
        if (src && tgt) parentOf.set(tgt.id, src)
      }

      const fixedChildrenOf = new Map<string, SimNode[]>()
      for (const node of simNodes) {
        if (node.fixedAngleDeg === undefined) continue
        const parent = parentOf.get(node.id)
        if (!parent) continue
        if (!fixedChildrenOf.has(parent.id)) fixedChildrenOf.set(parent.id, [])
        fixedChildrenOf.get(parent.id)!.push(node)
      }

      // Place fixed-angle subtrees post-simulation
      const STEP = 60
      function placeAtAngle(parentId: string, angleDeg: number) {
        const children = fixedChildrenOf.get(parentId) ?? []
        if (!children.length) return
        const parent = byId.get(parentId)!
        const rad = (angleDeg * Math.PI) / 180
        const dx = Math.cos(rad) * STEP
        const dy = Math.sin(rad) * STEP
        // Perp axis for spreading siblings
        const perpX = Math.cos(rad + Math.PI / 2)
        const perpY = Math.sin(rad + Math.PI / 2)
        const spread = 44
        children.forEach((child, i) => {
          const offset = children.length > 1 ? (i - (children.length - 1) / 2) * spread : 0
          child.x = parent.x! + dx + perpX * offset
          child.y = parent.y! + dy + perpY * offset
          placeAtAngle(child.id, angleDeg)
        })
      }

      Array.from(fixedChildrenOf.keys()).forEach(parentId => {
        const parent = byId.get(parentId)!
        if (parent.fixedAngleDeg === undefined) {
          const firstChild = fixedChildrenOf.get(parentId)![0]
          placeAtAngle(parentId, firstChild.fixedAngleDeg!)
        }
      })

      // Clamp all non-hub nodes
      const padX = 80; const padY = 28
      simNodes.forEach(n => {
        if (!n.isHub) {
          n.x = Math.max(padX, Math.min(W - padX, n.x ?? cx))
          n.y = Math.max(padY, Math.min(H - padY, n.y ?? cy))
        }
      })

      while (svg.firstChild) svg.removeChild(svg.firstChild)
      svg.setAttribute('width', String(W))
      svg.setAttribute('height', String(H))

      // Pass 1 — render labels
      const labelGroup = el('g') as SVGGElement
      svg.appendChild(labelGroup)
      const nodeEls = new Map<string, SVGElement>()

      for (const node of simNodes) {
        const x = node.x!
        const y = node.y!

        if (node.isHub) {
          const words = node.name.split(' ')
          const lineH = 20
          const g = el('g') as SVGGElement
          words.forEach((word, i) => {
            const t = el('text') as SVGTextElement
            t.setAttribute('x', String(cx))
            t.setAttribute('y', String(cy + (i - (words.length - 1) / 2) * lineH))
            t.setAttribute('class', styles.hubText)
            t.setAttribute('dominant-baseline', 'middle')
            t.textContent = word
            g.appendChild(t)
          })
          labelGroup.appendChild(g)
          nodeEls.set(node.id, g)
        } else {
          const isLeft = x < cx - 4
          const anchor = isLeft ? 'end' : 'start'
          const offsetX = isLeft ? -10 : 10
          const lines = wrapWords(node.name, 18)
          const lineH = 15
          const totalH = (lines.length - 1) * lineH

          const t = el('text') as SVGTextElement
          t.setAttribute('text-anchor', anchor)
          t.setAttribute('class', node.isIntermediate ? styles.intermediateText : styles.leafText)

          lines.forEach((lineText, i) => {
            const ts = el('tspan') as SVGTSpanElement
            ts.setAttribute('x', String(x + offsetX))
            ts.setAttribute('y', String(y - totalH / 2 + i * lineH))
            ts.setAttribute('dominant-baseline', 'middle')
            ts.textContent = lineText
            t.appendChild(ts)
          })

          labelGroup.appendChild(t)
          nodeEls.set(node.id, t)
        }
      }

      // Pass 2 — draw spokes from bbox edge to bbox edge
      const spokeGroup = el('g') as SVGGElement
      svg.insertBefore(spokeGroup, labelGroup)

      for (const lnk of links as any[]) {
        const srcId = typeof lnk.source === 'object' ? lnk.source.id : lnk.source
        const tgtId = typeof lnk.target === 'object' ? lnk.target.id : lnk.target
        const srcEl = nodeEls.get(srcId)
        const tgtEl = nodeEls.get(tgtId)
        if (!srcEl || !tgtEl) continue

        const srcBox = (srcEl as SVGGraphicsElement).getBBox()
        const tgtBox = (tgtEl as SVGGraphicsElement).getBBox()

        const srcCx = srcBox.x + srcBox.width / 2
        const srcCy = srcBox.y + srcBox.height / 2
        const tgtCx = tgtBox.x + tgtBox.width / 2
        const tgtCy = tgtBox.y + tgtBox.height / 2

        const dx = tgtCx - srcCx
        const dy = tgtCy - srcCy

        const p1 = bboxEdge(srcBox, dx, dy)
        const p2 = bboxEdge(tgtBox, -dx, -dy)

        const line = el('line') as SVGLineElement
        line.setAttribute('x1', String(p1.x))
        line.setAttribute('y1', String(p1.y))
        line.setAttribute('x2', String(p2.x))
        line.setAttribute('y2', String(p2.y))
        line.setAttribute('class', styles.spoke)
        spokeGroup.appendChild(line)
      }
    }

    render()
    const ro = new ResizeObserver(render)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [title, nodes])

  return (
    <div ref={containerRef} className={styles.container}>
      <svg ref={svgRef} aria-hidden="true" />
    </div>
  )
}
