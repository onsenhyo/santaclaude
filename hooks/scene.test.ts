import { expect, test } from 'claude-code/testing'

import {
  HOP_HEADROOM,
  PALETTES,
  SANTA_CARD_ROWS,
  buildScene,
  countdownText,
  crossedMilestones,
  daysUntilChristmas,
  gaugeRuns,
  hopLift,
  isInside,
  santaRows,
} from './scene'
import type { Row, SceneInput } from './scene'

const colors = PALETTES.classic
const text = (row: Row): string => row.map(run => run.text).join('')
const build = (over: Partial<SceneInput>) =>
  buildScene({
    percent: 0,
    tick: 0,
    gifts: 0,
    isChristmas: false,
    width: 40,
    colors,
    rudolph: null,
    sleigh: null,
    seed: 7,
    lift: { santa: 0, snowman: null },
    ...over,
  })
const scene = (over: Partial<SceneInput>) => build(over).rows
const all = (rows: Row[]): string => rows.map(text).join('\n')
const countSnow = (rows: Row[]): number =>
  rows
    .slice(-10)
    .flatMap(row => row)
    .filter(run => run.color === colors.snow)
    .reduce((sum, run) => sum + Array.from(run.text).filter(ch => '▁▂▃▄▅▆▇█'.includes(ch)).length, 0)
const count = (s: string, ch: string): number => Array.from(s).filter(c => c === ch).length
/** Each cell of a row as its foreground and background colors. */
const cells = (row: Row) => row.flatMap(run => Array.from(run.text).map(() => ({ color: run.color, bg: run.bg })))
const isColored = (cell: { color?: string; bg?: string }, color: string) => cell.color === color || cell.bg === color
/** The first row holding `color` within columns [from, to). */
const firstRowWith = (rows: Row[], color: string, from: number, to: number) =>
  rows.findIndex(row => cells(row).slice(from, to).some(cell => isColored(cell, color)))

test('days until Christmas', () => {
  expect(daysUntilChristmas(2026, 11, 19)).toBe(36)
  expect(daysUntilChristmas(2026, 12, 25)).toBe(0)
  expect(daysUntilChristmas(2026, 12, 26)).toBe(364)
  expect(daysUntilChristmas(2027, 1, 1)).toBe(358)
})

test('countdown text', () => {
  expect(countdownText(0)).toBe('Merry Christmas!')
  expect(countdownText(36)).toBe('D-36')
})

test('milestones crossed', () => {
  expect(crossedMilestones(40, 55)).toEqual(['🎅 The snow is ankle-deep'])
  expect(crossedMilestones(79, 96).length).toBe(2)
  expect(crossedMilestones(79, 96)[0]).toContain('Knee-deep')
  expect(crossedMilestones(79, 96)[1]).toContain('Blizzard')
  expect(crossedMilestones(60, 10)).toEqual([])
})

test('scene is 18 rows of the given width', () => {
  for (const width of [40, 60, 20]) {
    const rows = scene({ width, percent: 42, gifts: 2, tick: 3, rudolph: 8, sleigh: 5, lift: { santa: 6, snowman: 6 } })
    expect(rows.length).toBe(18)
    for (const row of rows) {
      expect(Array.from(text(row)).length).toBe(Math.min(40, width))
    }
  }
})

test('more context, more snow', () => {
  expect(countSnow(scene({ percent: 90 }))).toBeGreaterThan(countSnow(scene({ percent: 0 })))
})

test('the tree stands on the snow, never under it', () => {
  // The star is the top of the tree: its gold shows at every depth, and rises with the snow.
  for (const percent of [0, 50, 100]) {
    expect(firstRowWith(scene({ percent }), colors.gold, 0, 40)).toBeGreaterThanOrEqual(0)
  }
  expect(firstRowWith(scene({ percent: 100 }), colors.gold, 0, 40)).toBeLessThan(
    firstRowWith(scene({ percent: 0 }), colors.gold, 0, 40),
  )
})

test('the tree has no trunk', () => {
  expect(firstRowWith(scene({}), colors.trunk, 0, 40)).toBe(-1)
})

test('the snowman stays inside unless asked for', () => {
  // His carrot nose is the only orange between the tree (cols 1-15) and Santa (from col 25).
  const noses = (snowman: number | null, percent: number) =>
    scene({ percent, lift: { santa: 0, snowman } }).flatMap(row =>
      cells(row)
        .slice(16, 25)
        .filter(cell => isColored(cell, colors.orange)),
    ).length
  for (const percent of [0, 50, 100]) {
    expect(noses(0, percent)).toBe(1)
    expect(noses(null, percent)).toBe(0)
  }
  expect(build({}).hits.snowman).toBeNull()
})

test('a hop lifts Santa off the snow and lands him back', () => {
  const santaTop = (lift: number) => firstRowWith(scene({ lift: { santa: lift, snowman: null } }), colors.red, 25, 40)
  expect(santaTop(6)).toBe(santaTop(0) - 3)
  expect(santaTop(1)).toBe(santaTop(0))
  expect(hopLift(10, 10)).toBeGreaterThan(0)
  expect(hopLift(10, 1000)).toBeNull()
})

test('the pointer finds Santa where he stands', () => {
  const { santa } = build({ percent: 40 }).hits
  expect(isInside(santa, santa.top, santa.left)).toBe(true)
  expect(isInside(santa, santa.bottom, santa.right)).toBe(true)
  expect(isInside(santa, santa.top - 1, santa.left)).toBe(false)
  expect(isInside(santa, santa.top, santa.left - 1)).toBe(false)
  expect(isInside(null, 0, 0)).toBe(false)
})

test('presents under the tree', () => {
  expect(count(all(scene({ gifts: 3 })), '■')).toBe(3)
})

test('Christmas day sparkles', () => {
  expect(all(scene({ isChristmas: true }))).toContain('✦')
  expect(all(scene({ isChristmas: false }))).not.toContain('✦')
})

test('gauge', () => {
  const runs = gaugeRuns(50, 20, colors)
  expect(Array.from(text(runs)).length).toBe(20)
  expect(count(text(runs), '█')).toBe(10)
})

test('the welcome card Santa keeps one height through a hop', () => {
  expect(santaRows(colors).length).toBe(SANTA_CARD_ROWS)
  expect(santaRows(colors, 6).length).toBe(SANTA_CARD_ROWS)
  expect(HOP_HEADROOM).toBe(3)
})

const hasColor = (rows: Row[], color: string): boolean =>
  rows.some(row => row.some(run => run.color === color && run.text.trim() !== ''))

test('Rudolph walks by with his red nose', () => {
  const rows = scene({ rudolph: 10, percent: 30 })
  expect(hasColor(rows, colors.brown)).toBe(true)
  const noses = rows.flatMap(row => row).filter(run => run.text.includes('●') && run.color === colors.red)
  expect(noses.length).toBe(1)
})

test('no Rudolph when he is away or off screen', () => {
  expect(hasColor(scene({ rudolph: null }), colors.brown)).toBe(false)
  expect(hasColor(scene({ rudolph: -20 }), colors.brown)).toBe(false)
  expect(hasColor(scene({ rudolph: 60 }), colors.brown)).toBe(false)
})

test('the sleigh flies only when sent', () => {
  expect(all(scene({ sleigh: 5 }))).toContain('╘═╛')
  expect(all(scene({ sleigh: null }))).not.toContain('╘═╛')
})
