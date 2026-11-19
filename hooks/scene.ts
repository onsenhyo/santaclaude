// Pure drawing: everything here turns numbers into rows of colored runs.
import type { Palette } from '../types'

export type Colors = {
  red: string
  green: string
  gold: string
  blue: string
  snow: string
  trunk: string
  orange: string
  white: string
  hat: string
  brown: string
}

const SHARED = { orange: '#d97757', white: '#f4f4f4', hat: '#5a5a5a' }

export const PALETTES: Record<Palette, Colors> = {
  classic: { ...SHARED, red: '#e5484d', green: '#3fa35a', gold: '#f5c84b', blue: '#5aa9e6', snow: '#eef4ff', trunk: '#8a5a3b', brown: '#a0703c' },
  frost: { ...SHARED, red: '#e5687a', green: '#5fb3a8', gold: '#cfd8e3', blue: '#7cc4ff', snow: '#dff1ff', trunk: '#7a6a5e', brown: '#9a8070' },
  candle: { ...SHARED, red: '#c0394c', green: '#7a9a40', gold: '#f0a830', blue: '#e08a5a', snow: '#fff1dc', trunk: '#7b4a2a', brown: '#8b5a2b' },
}

export const isPalette = (name: string): name is Palette => name in PALETTES

/** One run of text in one color over an optional background; `dim` draws it in the terminal's dim color. */
export type Run = { text: string; color?: string; bg?: string; dim?: boolean }
export type Row = Run[]

type Tone = keyof Colors | 'dim' | 'none'
type Cell = { ch: string; tone: Tone; bg?: Tone }

/** Thresholds of context fill where Santa says something, and what he says. */
export const MILESTONES: readonly (readonly [number, string])[] = [
  [50, '🎅 The snow is ankle-deep'],
  [80, '🎅 Knee-deep snow. Time to think about /compact?'],
  [95, '⛄ Blizzard warning! Auto-compact is close'],
]

/** Milestone messages crossed going from `before` to `after`. */
export const crossedMilestones = (before: number, after: number): string[] =>
  MILESTONES.filter(([at]) => before < at && after >= at).map(([, text]) => text)

/** Whole days from the given calendar date to the next December 25th. */
export const daysUntilChristmas = (year: number, month: number, day: number): number => {
  const today = Date.UTC(year, month - 1, day)
  let target = Date.UTC(year, 11, 25)

  if (today > target) {
    target = Date.UTC(year + 1, 11, 25)
  }

  return Math.round((target - today) / 86_400_000)
}

export const countdownText = (days: number): string =>
  days === 0 ? 'Merry Christmas!' : `D-${days}`

// The tree in square pixels, like Santa: G gold star, E evergreen, W garland, b a bulb.
// Three tiers, each starting narrower than the last one ended, with garland swinging across.
const TREE_PIXELS = [
  '.......G.......',
  '......GGG......',
  '.......G.......',
  '.......E.......',
  '......EEE......',
  '.....EbEEE.....',
  '....WWEEEbE....',
  '...EEEWWWEbE...',
  '.....EEEEE.....',
  '....EbEEEEE....',
  '...EEEEWWEEb...',
  '..EbEEEEWWWEb..',
  '....EEEEEEE....',
  '...EbEEEWWEE...',
  '..WWWEEEEEbEE..',
  '.EEbEEWWWWEEbE.',
  'EEEEbEEEEbEEEEE',
]
const TREE_WIDTH = 15

// Santa Claude as square pixels, two to a cell (R red, W white, O orange, . clear).
// Drawn by hand in the Santa Claude Sprite editor.
const SANTA_PIXELS = [
  '...RRRRRW.',
  '..RRRRRR..',
  '.WWWWWWWW.',
  '.OOOOOOOO.',
  '.O.OOOO.O.',
  'OOOOOOOOOO',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..O....O..',
  '..........',
]

// A little snowman, drawn by hand in the sprite editor: H coal eyes, O carrot nose, B twig arms.
const SNOWMAN_PIXELS = [
  '.......',
  '..WWW..',
  '..HWH..',
  '..WOW..',
  '.BWWWB.',
  '.WWWWW.',
  '.WWWWW.',
  '..WWW..',
]
const SNOWMAN_WIDTH = SNOWMAN_PIXELS[0]?.length ?? 0

// Rudolph walking right: antlers, body with his red nose in front, two leg frames.
const RUDOLPH: readonly (readonly [string, string])[] = [
  ['     YY', '     BB'],
  ['▗▄▄▄██●', 'BBBBBBR'],
]
const RUDOLPH_LEGS = [' ▌ ▌   ', '  ▌ ▌  '] as const
export const RUDOLPH_WIDTH = 7

// Santa's sleigh flying right, a reindeer in the lead.
const SLEIGH: readonly (readonly [string, string])[] = [
  [' ▄     YY ', ' R     BB '],
  ['▐█▌─▄▄▄██●', 'RRRGBBBBBR'],
  ['╘═╛ ▌ ▌   ', 'GGG B B   '],
]
export const SLEIGH_WIDTH = 10

const TONE_OF: Record<string, Tone> = {
  R: 'red',
  W: 'white',
  O: 'orange',
  H: 'hat',
  B: 'brown',
  G: 'gold',
  E: 'green',
  T: 'trunk',
  U: 'blue',
}
/** Letters a bulb cycles through: red, gold, blue, and now and then dark. */
const BULB_LETTERS = ['R', 'G', 'U'] as const
const PARTIAL = ' ▁▂▃▄▅▆▇█'
const GIFT_TONES: Tone[] = ['red', 'gold', 'green', 'blue']

export const SCENE_WIDTH = 40
export const SCENE_HEIGHT = 18

/** Milliseconds per frame of a drawing's own clock, and frames per step of the slow scene clock. */
export const FRAME_MS = 100
export const FRAMES_PER_TICK = 7

/** A hop, frame by frame: pixels off the ground, up and down with a little bounce on landing. */
const HOP = [2, 4, 5, 6, 6, 5, 4, 2, 0, 1, 1, 0]
/** Rows a drawing keeps clear above a sprite so a hop never changes its height. */
export const HOP_HEADROOM = Math.ceil(Math.max(...HOP) / 2)

/** Pixels off the ground `frame` frames into a hop that started on `start`, or null once landed. */
export const hopLift = (start: number, frame: number): number | null => HOP[frame - start] ?? null
const TREE_COL = 1
const SANTA_COL = 25
const SNOWMAN_COL = 18
const GIFT_COLS = [5, 11, 3, 13, 1, 15]
export const MAX_GIFTS = GIFT_COLS.length
const FLAKES = 24

/** A repeatable random number in [0, 1) for a pair of integers, so a frame always draws the same. */
const noise = (a: number, b: number): number => {
  let h = Math.imul(a, 374_761_393) + Math.imul(b, 668_265_263)
  h = Math.imul(h ^ (h >>> 13), 1_274_126_177)

  return ((h ^ (h >>> 16)) >>> 0) / 4_294_967_296
}

/**
 * Rows of snow at a fill, before drift: grows a little faster near the top. At 100% it stops
 * where the tree, standing on it, still fits under the top of the scene.
 */
const depthFor = (percent: number): number => Math.pow(percent / 100, 1.2) * 6.5

/** Smooth noise along x: random heights at whole steps, eased between them. Centered on 0. */
const smooth = (x: number, seed: number): number => {
  const i = Math.floor(x)
  const t = x - i
  const ease = t * t * (3 - 2 * t)

  return noise(seed, i) * (1 - ease) + noise(seed, i + 1) * ease - 0.5
}

/** Gentle drifts: long, low swells with a little ripple, slowly reshaped as `time` passes. */
const driftAt = (col: number, seed: number, time: number): number =>
  smooth(col / 11 + time, seed) * 1.1 + smooth(col / 5 - time * 0.6, seed + 1) * 0.35

/** Seconds of pane frames it takes the drifts to shift by one swell. */
const DRIFT_PERIOD = 700

export type SceneInput = {
  percent: number
  tick: number
  gifts: number
  isChristmas: boolean
  width: number
  colors: Colors
  /** Rudolph's left column while he walks across, or null when he is away. */
  rudolph: number | null
  /** The sleigh's left column while it flies across, or null. */
  sleigh: number | null
  /** Shapes the drifts: a new seed is a new snowfield. */
  seed: number
  /** Pixels Santa and the snowman are off the ground, mid-hop; null leaves the snowman out. */
  lift: { santa: number; snowman: number | null }
}

/** Cells of the scene, as rows and columns from its top left, ends included. */
export type Rect = { top: number; left: number; bottom: number; right: number }

export type Scene = {
  rows: Row[]
  /** Where Santa and the snowman stand at rest: what a pointer touches to make them hop. */
  hits: { santa: Rect; snowman: Rect | null }
}

export const isInside = (rect: Rect | null, row: number, col: number): boolean =>
  rect !== null && row >= rect.top && row <= rect.bottom && col >= rect.left && col <= rect.right

export const buildScene = ({
  percent,
  tick,
  gifts,
  isChristmas,
  width,
  colors,
  rudolph,
  sleigh,
  seed,
  lift,
}: SceneInput): Scene => {
  const W = Math.max(1, Math.min(SCENE_WIDTH, width))
  const H = SCENE_HEIGHT
  const grid: Cell[][] = Array.from({ length: H }, () => Array.from({ length: W }, () => ({ ch: ' ', tone: 'none' as Tone })))
  const put = (row: number, col: number, ch: string, tone: Tone, bg?: Tone) => {
    const line = grid[row]

    if (line !== undefined && col >= 0 && col < W) {
      line[col] = bg === undefined ? { ch, tone } : { ch, tone, bg }
    }
  }
  const depth = depthFor(percent)
  const time = tick / DRIFT_PERIOD
  const depthAt = (col: number): number => 0.5 + depth + driftAt(col, seed, time) * Math.min(1, depth / 2)
  const sprite =(art: readonly (readonly [string, string])[], top: number, left: number) => {
    art.forEach(([text, map], i) => {
      Array.from(text).forEach((ch, j) => {
        if (ch !== ' ') {
          put(top + i, left + j, ch, TONE_OF[map[j] ?? ''] ?? 'none')
        }
      })
    })
  }
  /**
   * The row something stands in over these columns: the snow's top cell when it is at most half
   * full (feet sink into the thin snow there), else the row above it. The highest of the columns wins.
   */
  const standRow = (cols: readonly number[]): number =>
    Math.min(
      H - 1,
      ...cols.map(col => {
        const local = depthAt(col)
        const full = Math.floor(local)

        return H - 1 - full - (Math.round((local - full) * 8) > 4 ? 1 : 0)
      }),
    )
  /** The row just above the snow's top cell over these columns: standing on the snow, not in it. */
  const perchRow = (cols: readonly number[]): number =>
    Math.min(
      H - 1,
      ...cols.map(col => {
        const local = depthAt(col)
        const full = Math.floor(local)

        return H - 1 - full - (Math.round((local - full) * 8) > 0 ? 1 : 0)
      }),
    )
  /** Draws pixel cells; where a cell's lower half is clear and snow lies under it, the snow shows there. */
  const drawCells = (cells: readonly (readonly (Cell | null)[])[], top: number, left: number) => {
    cells.forEach((line, i) => {
      line.forEach((cell, j) => {
        if (cell === null) {
          return
        }
        const under = grid[top + i]?.[left + j]
        const isOnSnow = cell.ch === '▀' && cell.bg === undefined && under?.tone === 'snow' && under.ch !== ' '
        put(top + i, left + j, cell.ch, cell.tone, isOnSnow ? 'snow' : cell.bg)
      })
    })
  }
  const span = (col: number, width: number): number[] => Array.from({ length: width }, (_, k) => col + k)

  // Flakes drift down above the pile, each at its own pace, swaying, in a new lane every fall.
  for (let i = 0; i < FLAKES; i++) {
    const fall = tick * (0.3 + noise(i, 0) * 0.5) + noise(i, 1) * H * 4
    const lap = Math.floor(fall / H)
    const row = Math.floor(fall) % H
    const sway = Math.round(Math.sin(fall * (0.4 + noise(i, 2) * 0.5) + i) * 1.2)
    const col = (((Math.floor(noise(i, lap + 3) * W) + sway) % W) + W) % W

    if (row < H - 1 - Math.ceil(depthAt(col))) {
      put(row, col, noise(i, lap + 9) < 0.25 ? '*' : '·', 'snow')
    }
  }

  for (let col = 0; col < W; col++) {
    const local = depthAt(col)
    const full = Math.floor(local)

    for (let k = 0; k < full; k++) {
      put(H - 1 - k, col, '█', 'snow')
    }
    const part = Math.round((local - full) * 8)

    if (part > 0) {
      put(H - 1 - full, col, PARTIAL[part] ?? '█', 'snow')
    }
  }

  // The tree rises with the snow, its lowest boughs on the pile and the presents in front of them.
  // Each bulb steps through the colors on its own phase; one in four rests dark each frame.
  let bulb = 0
  const lit = TREE_PIXELS.map(line =>
    line.replace(/b/g, () => {
      const k = bulb++

      return (k + tick) % 4 === 0 ? 'H' : (BULB_LETTERS[(k * 2 + tick) % BULB_LETTERS.length] ?? 'R')
    }),
  )
  const treeCells = standingCells(lit)
  const treeBottom = standRow(span(TREE_COL, TREE_WIDTH))
  const treeTop = treeBottom - (treeCells.length - 1)
  drawCells(treeCells, treeTop, TREE_COL)

  if (isChristmas) {
    const star = TREE_COL + Math.floor(TREE_WIDTH / 2)
    const isOdd = tick % 2 === 1
    put(treeTop, star - 2, isOdd ? '✦' : '·', 'gold')
    put(treeTop, star + 2, isOdd ? '·' : '✦', 'gold')
    put(treeTop - 1, star, '✦', 'gold')
  }

  for (let k = 0; k < Math.min(gifts, MAX_GIFTS); k++) {
    put(treeBottom, GIFT_COLS[k] ?? 0, '■', GIFT_TONES[k % GIFT_TONES.length] ?? 'red')
  }

  // A little snowman keeps watch between the tree and Santa, when he is asked for.
  const snowmanBottom = perchRow(span(SNOWMAN_COL, SNOWMAN_WIDTH))

  if (lift.snowman !== null) {
    const cells = standingCells(SNOWMAN_PIXELS, lift.snowman)
    drawCells(cells, snowmanBottom - (cells.length - 1), SNOWMAN_COL)
  }

  if (rudolph !== null) {
    const bottom = standRow(span(rudolph, RUDOLPH_WIDTH))
    sprite(RUDOLPH, bottom - 2, rudolph)
    Array.from(RUDOLPH_LEGS[tick % 2] ?? '').forEach((ch, j) => {
      if (ch !== ' ') {
        put(bottom, rudolph + j, ch, 'brown')
      }
    })
  }

  // Santa stands on top of the pile, over the snow under his feet.
  const santaBottom = perchRow(SANTA_FEET.map(col => SANTA_COL + col))
  const santaCells = standingCells(SANTA_PIXELS, lift.santa)
  drawCells(santaCells, santaBottom - (santaCells.length - 1), SANTA_COL)

  if (sleigh !== null) {
    sprite(SLEIGH, 1, sleigh)
  }

  return {
    rows: grid.map(line => toRuns(line, colors)),
    hits: {
      santa: restingRect(SANTA_CELLS, santaBottom, SANTA_COL),
      snowman: lift.snowman === null ? null : restingRect(SNOWMAN_CELLS, snowmanBottom, SNOWMAN_COL),
    },
  }
}

const restingRect = (cells: readonly (readonly unknown[])[], bottom: number, left: number): Rect => ({
  top: bottom - (cells.length - 1),
  left,
  bottom,
  right: left + (cells[0]?.length ?? 1) - 1,
})

const toRuns = (cells: Cell[], colors: Colors): Row => {
  const runs: Row = []

  for (const { ch, tone, bg } of cells) {
    const last = runs[runs.length - 1]
    const run = runOf(tone, colors)

    if (bg !== undefined && bg !== 'none' && bg !== 'dim') {
      run.bg = colors[bg]
    }

    if (last !== undefined && last.color === run.color && last.bg === run.bg && last.dim === run.dim) {
      last.text += ch
    } else {
      runs.push({ ...run, text: ch })
    }
  }

  return runs
}

const runOf = (tone: Tone, colors: Colors): Omit<Run, 'text'> => {
  if (tone === 'none') {
    return {}
  }

  if (tone === 'dim') {
    return { dim: true }
  }

  return { color: colors[tone] }
}

/**
 * Folds pixel rows two at a time into cells: one color fills the cell, a top or bottom pixel alone
 * is a half block, and two colors are an upper half block over the lower color. A clear cell is null.
 */
const pixelCells = (pixels: readonly string[]): (Cell | null)[][] => {
  const cells: (Cell | null)[][] = []

  for (let r = 0; r < pixels.length; r += 2) {
    const top = Array.from(pixels[r] ?? '')
    const bottom = Array.from(pixels[r + 1] ?? '')
    cells.push(
      top.map((t, c) => {
        const upper = TONE_OF[t]
        const lower = TONE_OF[bottom[c] ?? '.']

        if (upper === undefined && lower === undefined) {
          return null
        }

        if (upper === undefined) {
          return { ch: '▄', tone: lower ?? 'none' }
        }

        if (lower === undefined) {
          return { ch: '▀', tone: upper }
        }

        return upper === lower ? { ch: '█', tone: upper } : { ch: '▀', tone: upper, bg: lower }
      }),
    )
  }

  return cells
}

/**
 * A sprite's cells with its feet `lift` pixels off the ground. Clear rows under the drawing are
 * dropped and the top padded to an even count, so at rest the lowest pixels sit in the bottom half
 * of the last cell: feet touch the ground instead of hanging half a cell up.
 */
const standingCells = (pixels: readonly string[], lift = 0): (Cell | null)[][] => {
  const blank = '.'.repeat(pixels[0]?.length ?? 0)
  const rows = [...pixels]

  while (rows.length > 0 && /^\.*$/.test(rows[rows.length - 1] ?? '')) {
    rows.pop()
  }
  rows.push(...Array.from({ length: Math.max(0, Math.round(lift)) }, () => blank))

  return pixelCells(rows.length % 2 === 1 ? [blank, ...rows] : rows)
}

const SANTA_CELLS = standingCells(SANTA_PIXELS)
const SNOWMAN_CELLS = standingCells(SNOWMAN_PIXELS)
/** Columns of Santa's lowest cell row that hold something: where his feet are. */
const SANTA_FEET = (SANTA_CELLS[SANTA_CELLS.length - 1] ?? []).flatMap((cell, col) => (cell === null ? [] : [col]))

/** Santa Claude alone, for the welcome card, `lift` pixels into a hop under a fixed headroom. */
export const santaRows = (colors: Colors, lift = 0): Row[] => {
  const cells = standingCells(SANTA_PIXELS, lift)
  const blank = (SANTA_CELLS[0] ?? []).map(() => null)
  const padded = [...Array.from({ length: SANTA_CELLS.length + HOP_HEADROOM - cells.length }, () => blank), ...cells]

  return padded.map(line => toRuns(line.map(cell => cell ?? { ch: ' ', tone: 'none' }), colors))
}

/** Rows `santaRows` draws, whatever the lift. */
export const SANTA_CARD_ROWS = SANTA_CELLS.length + HOP_HEADROOM
export const SANTA_CARD_COLUMNS = SANTA_CELLS[0]?.length ?? 0
