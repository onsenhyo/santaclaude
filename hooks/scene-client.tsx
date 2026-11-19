// The pane's scene, drawn on the surface itself: its own frame clock moves the snow, the bulbs,
// Rudolph and the sleigh, and the pointer sets Santa moving and the snowman hopping.
import type { ClientModule } from 'claude-code'

import {
  FRAME_MS,
  FRAMES_PER_TICK,
  RUDOLPH_WIDTH,
  SCENE_WIDTH,
  SLEIGH_WIDTH,
  STANDING,
  buildScene,
  isInside,
  poseAt,
  randomMove,
} from './scene'
import type { Colors, Move, Rect } from './scene'
import { RunsLine } from './runs'

export type SceneProps = {
  percent: number
  gifts: number
  isChristmas: boolean
  showSnowman: boolean
  colors: Colors
}

type State = {
  /** The props of the latest draw, which the frame clock reads: they change while it runs. */
  props: SceneProps
  frame: number
  seed: number
  /** What each one is doing, or null while standing. The snowman only hops. */
  moves: { santa: Move | null; snowman: Move | null }
  rudolph: number | null
  sleigh: number | null
}

// Per frame: Santa moves by himself about every 20 seconds, the snowman hops every 25; Rudolph wanders
// by about every three minutes, and on the day the sleigh flies over about every forty seconds.
const SANTA_MOVE_CHANCE = FRAME_MS / 20_000
const SNOWMAN_HOP_CHANCE = FRAME_MS / 25_000
const RUDOLPH_CHANCE = FRAME_MS / 180_000
const SLEIGH_CHANCE = FRAME_MS / 40_000

/** Santa's next move, any of them; the snowman's, a hop. */
const santaMove = (frame: number): Move => randomMove(frame, Math.random())
const snowmanMove = (frame: number): Move => ({ motion: 'hop', start: frame })

/** A move still under way at `frame`, a new one by chance, or null. */
const moving = (move: Move | null, frame: number, chance: number, next: (frame: number) => Move): Move | null =>
  move !== null && poseAt(move, frame) !== null ? move : Math.random() < chance ? next(frame) : null

const step = (s: State): State => {
  const { props } = s
  const frame = s.frame + 1
  let { rudolph, sleigh } = s

  if (rudolph !== null) {
    rudolph = rudolph > SCENE_WIDTH ? null : rudolph + 1 / FRAMES_PER_TICK
  } else if (Math.random() < RUDOLPH_CHANCE) {
    rudolph = -RUDOLPH_WIDTH
  }

  if (sleigh !== null) {
    sleigh = sleigh > SCENE_WIDTH ? null : sleigh + 2 / FRAMES_PER_TICK
  } else if (props.isChristmas && Math.random() < SLEIGH_CHANCE) {
    sleigh = -SLEIGH_WIDTH
  }

  return {
    ...s,
    frame,
    moves: {
      santa: moving(s.moves.santa, frame, SANTA_MOVE_CHANCE, santaMove),
      snowman: props.showSnowman ? moving(s.moves.snowman, frame, SNOWMAN_HOP_CHANCE, snowmanMove) : null,
    },
    rudolph,
    sleigh,
  }
}

const SceneClient: ClientModule<SceneProps, State> = (props, surface) => {
  const { Box, Text } = surface.elements
  const s: State = surface.state ?? {
    props,
    frame: 0,
    seed: Math.floor(Math.random() * 1_000_000),
    moves: { santa: null, snowman: null },
    rudolph: null,
    sleigh: null,
  }
  s.props = props

  if (surface.state === undefined) {
    surface.setState(s)
    surface.every(FRAME_MS, () => surface.setState(step(surface.state ?? s)))
  }

  const pose = (move: Move | null) => (move === null ? STANDING : (poseAt(move, s.frame) ?? STANDING))
  const scene = buildScene({
    percent: props.percent,
    tick: Math.floor(s.frame / FRAMES_PER_TICK),
    gifts: props.gifts,
    isChristmas: props.isChristmas,
    width: Math.min(SCENE_WIDTH, surface.columns || SCENE_WIDTH),
    colors: props.colors,
    rudolph: s.rudolph === null ? null : Math.floor(s.rudolph),
    sleigh: s.sleigh === null ? null : Math.floor(s.sleigh),
    seed: s.seed,
    pose: { santa: pose(s.moves.santa), snowman: props.showSnowman ? pose(s.moves.snowman) : null },
  })

  // A region shorter than the scene shows its lower rows: the sky goes first, the ground stays.
  const hidden = Math.max(0, scene.rows.length - (surface.rows || scene.rows.length))

  // Hovering over or clicking Santa sets him moving, and the snowman hopping.
  surface.onPointer(event => {
    const now = surface.state ?? s
    const start = (current: Move | null, rect: Rect | null, next: (frame: number) => Move) =>
      current === null && isInside(rect, event.y + hidden, event.x) ? next(now.frame) : current
    const santa = start(now.moves.santa, scene.hits.santa, santaMove)
    const snowman = start(now.moves.snowman, scene.hits.snowman, snowmanMove)

    if (santa !== now.moves.santa || snowman !== now.moves.snowman) {
      surface.setState({ ...now, moves: { santa, snowman } })
    }
  })

  return (
    <Box flexDirection="column">
      {scene.rows.slice(hidden).map(row => (
        <RunsLine Text={Text} runs={row} />
      ))}
    </Box>
  )
}

export default SceneClient
