// Santa Claude on the welcome card: he hops, flips or sways now and then, and when the pointer touches him.
import type { ClientModule } from 'claude-code'

import { RunsLine } from './runs'
import { FRAME_MS, STANDING, poseAt, randomMove, santaRows } from './scene'
import type { Colors, Move } from './scene'

export type SantaProps = { colors: Colors }

type State = { frame: number; move: Move | null }

/** Per frame: about one move by himself every 15 seconds. */
const MOVE_CHANCE = FRAME_MS / 15_000

const SantaClient: ClientModule<SantaProps, State> = (props, surface) => {
  const { Box, Text } = surface.elements
  const s: State = surface.state ?? { frame: 0, move: null }

  if (surface.state === undefined) {
    surface.setState(s)
    surface.every(FRAME_MS, () => {
      const now = surface.state ?? s
      const frame = now.frame + 1
      const isMoving = now.move !== null && poseAt(now.move, frame) !== null
      surface.setState({ frame, move: isMoving ? now.move : Math.random() < MOVE_CHANCE ? randomMove(frame, Math.random()) : null })
    })
  }

  surface.onPointer(() => {
    const now = surface.state ?? s

    if (now.move === null) {
      surface.setState({ ...now, move: randomMove(now.frame, Math.random()) })
    }
  })

  const pose = s.move === null ? STANDING : (poseAt(s.move, s.frame) ?? STANDING)

  return (
    <Box flexDirection="column">
      {santaRows(props.colors, pose).map(row => (
        <RunsLine Text={Text} runs={row} />
      ))}
    </Box>
  )
}

export default SantaClient
