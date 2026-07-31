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

// Gap between a label and the spokes touching it — the box is inflated by `pad`
// so the spoke endpoint lands `pad` px outside the text (--spacing-md = 16px).
const LABEL_PAD = 16

function bboxEdge(box: DOMRect, dx: number, dy: number, pad = 0): { x: number; y: number } {
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return { x: cx, y: cy }
  const halfW = box.width / 2 + pad
  const halfH = box.height / 2 + pad
  const tx = Math.abs(dx) > 0.001 ? halfW / Math.abs(dx) : Infinity
  const ty = Math.abs(dy) > 0.001 ? halfH / Math.abs(dy) : Infinity
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
            .distance((l: SimLink) => (l.source as SimNode)?.isHub ? hubRadius : 52)
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
      for (const lnk of links as SimLink[]) {
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

      // Draw the labels + spokes at the current node positions. Returned map
      // (node id → label element) lets us measure the real label boxes so the
      // fit below can guarantee nothing clips.
      function paint(svg: SVGSVGElement): Map<string, SVGElement> {
        while (svg.firstChild) svg.removeChild(svg.firstChild)
        svg.setAttribute('width', String(W))
        svg.setAttribute('height', String(H))

        // Pass 1 — render labels
        const labelGroup = el('g') as SVGGElement
        svg.appendChild(labelGroup)
        const els = new Map<string, SVGElement>()

        for (const node of simNodes) {
          const x = node.x!
          const y = node.y!

          if (node.isHub) {
            const words = node.name.split(' ')
            const lineH = 30 // --text-label-xl-lh, matches the enlarged hub type
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
            els.set(node.id, g)
          } else {
            const isLeft = x < cx - 4
            const anchor = isLeft ? 'end' : 'start'
            const offsetX = isLeft ? -10 : 10
            const lines = wrapWords(node.name, 18)
            const lineH = 24 // --text-body-lg-lh, matches the enlarged leaf type
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
            els.set(node.id, t)
          }
        }

        // Pass 2 — draw spokes from bbox edge to bbox edge
        const spokeGroup = el('g') as SVGGElement
        svg.insertBefore(spokeGroup, labelGroup)

        for (const lnk of links as SimLink[]) {
          const srcId = typeof lnk.source === 'object' ? (lnk.source as SimNode).id : lnk.source as string
          const tgtId = typeof lnk.target === 'object' ? (lnk.target as SimNode).id : lnk.target as string
          const srcEl = els.get(srcId)
          const tgtEl = els.get(tgtId)
          if (!srcEl || !tgtEl) continue

          const srcBox = (srcEl as SVGGraphicsElement).getBBox()
          const tgtBox = (tgtEl as SVGGraphicsElement).getBBox()

          const srcCx = srcBox.x + srcBox.width / 2
          const srcCy = srcBox.y + srcBox.height / 2
          const tgtCx = tgtBox.x + tgtBox.width / 2
          const tgtCy = tgtBox.y + tgtBox.height / 2

          const dx = tgtCx - srcCx
          const dy = tgtCy - srcCy

          const p1 = bboxEdge(srcBox, dx, dy, LABEL_PAD)
          const p2 = bboxEdge(tgtBox, -dx, -dy, LABEL_PAD)

          const line = el('line') as SVGLineElement
          line.setAttribute('x1', String(p1.x))
          line.setAttribute('y1', String(p1.y))
          line.setAttribute('x2', String(p2.x))
          line.setAttribute('y2', String(p2.y))
          line.setAttribute('class', styles.spoke)
          spokeGroup.appendChild(line)
        }

        return els
      }

      // Paint once at the raw simulation scale to MEASURE each label's real box,
      // then scale the node POSITIONS (never the text — so the type stays at its
      // set size and legible) so the whole web + its labels fills the container
      // while staying inside a 32px inset. This spreads the web to the edges yet
      // guarantees no label clips at the (scroll-clipped) container bounds.
      // sx≠sy so it still fills wider than tall on the 2:1 box.
      const INSET = 32
      const nodeEls = paint(svg)

      let sx = Infinity; let sy = Infinity
      for (const node of simNodes) {
        if (node.isHub) continue
        const box = (nodeEls.get(node.id) as SVGGraphicsElement).getBBox()
        const nx = node.x!; const ny = node.y!
        const dx = nx - cx; const dy = ny - cy
        const relLeft = box.x - nx
        const relRight = box.x + box.width - nx
        const relTop = box.y - ny
        const relBottom = box.y + box.height - ny
        // Largest scale that still keeps this label's far edge inside the inset.
        if (dx > 0.5) sx = Math.min(sx, (W - INSET - cx - relRight) / dx)
        else if (dx < -0.5) sx = Math.min(sx, (INSET - cx - relLeft) / dx)
        if (dy > 0.5) sy = Math.min(sy, (H - INSET - cy - relBottom) / dy)
        else if (dy < -0.5) sy = Math.min(sy, (INSET - cy - relTop) / dy)
      }
      if (!Number.isFinite(sx) || sx <= 0) sx = 1
      if (!Number.isFinite(sy) || sy <= 0) sy = 1

      if (Math.abs(sx - 1) > 0.001 || Math.abs(sy - 1) > 0.001) {
        simNodes.forEach(n => {
          if (n.isHub) return
          n.x = cx + ((n.x ?? cx) - cx) * sx
          n.y = cy + ((n.y ?? cy) - cy) * sy
        })
        paint(svg)
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
