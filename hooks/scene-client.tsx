// The pane's scene, drawn on the surface itself: its own frame clock moves the snow, the bulbs,
// Rudolph and the sleigh, and the pointer makes Santa and the snowman hop.
import type { ClientModule } from 'claude-code'

import {
  FRAME_MS,
  FRAMES_PER_TICK,
  RUDOLPH_WIDTH,
  SCENE_WIDTH,
  SLEIGH_WIDTH,
  buildScene,
  hopLift,
  isInside,
} from './scene'
import type { Colors, Rect } from './scene'
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
  /** The frame each one's hop started on, or null while standing. */
  hops: { santa: number | null; snowman: number | null }
  rudolph: number | null
  sleigh: number | null
}

// Per frame: Santa hops by himself about every 20 seconds, the snowman every 25; Rudolph wanders
// by about every three minutes, and on the day the sleigh flies over about every forty seconds.
const SANTA_HOP_CHANCE = FRAME_MS / 20_000
const SNOWMAN_HOP_CHANCE = FRAME_MS / 25_000
const RUDOLPH_CHANCE = FRAME_MS / 180_000
const SLEIGH_CHANCE = FRAME_MS / 40_000

/** A hop still in the air at `frame`, a new one by chance, or null. */
const hopping = (start: number | null, frame: number, chance: number): number | null =>
  start !== null && hopLift(start, frame) !== null ? start : Math.random() < chance ? frame : null

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
    hops: {
      santa: hopping(s.hops.santa, frame, SANTA_HOP_CHANCE),
      snowman: props.showSnowman ? hopping(s.hops.snowman, frame, SNOWMAN_HOP_CHANCE) : null,
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
    hops: { santa: null, snowman: null },
    rudolph: null,
    sleigh: null,
  }
  s.props = props

  if (surface.state === undefined) {
    surface.setState(s)
    surface.every(FRAME_MS, () => surface.setState(step(surface.state ?? s)))
  }

  const lift = (start: number | null) => (start === null ? 0 : (hopLift(start, s.frame) ?? 0))
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
    lift: { santa: lift(s.hops.santa), snowman: props.showSnowman ? lift(s.hops.snowman) : null },
  })

  // Hovering over or clicking Santa or the snowman makes them hop.
  surface.onPointer(event => {
    const now = surface.state ?? s
    const start = (current: number | null, rect: Rect | null) =>
      current === null && isInside(rect, event.y, event.x) ? now.frame : current
    const santa = start(now.hops.santa, scene.hits.santa)
    const snowman = start(now.hops.snowman, scene.hits.snowman)

    if (santa !== now.hops.santa || snowman !== now.hops.snowman) {
      surface.setState({ ...now, hops: { santa, snowman } })
    }
  })

  return (
    <Box flexDirection="column">
      {scene.rows.map(row => (
        <RunsLine Text={Text} runs={row} />
      ))}
    </Box>
  )
}

export default SceneClient
