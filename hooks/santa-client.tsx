// Santa Claude on the welcome card: he hops now and then, and when the pointer touches him.
import type { ClientModule } from 'claude-code'

import { RunsLine } from './runs'
import { FRAME_MS, hopLift, santaRows } from './scene'
import type { Colors } from './scene'

export type SantaProps = { colors: Colors }

type State = { frame: number; hop: number | null }

/** Per frame: about one hop by himself every 15 seconds. */
const HOP_CHANCE = FRAME_MS / 15_000

const SantaClient: ClientModule<SantaProps, State> = (props, surface) => {
  const { Box, Text } = surface.elements
  const s: State = surface.state ?? { frame: 0, hop: null }

  if (surface.state === undefined) {
    surface.setState(s)
    surface.every(FRAME_MS, () => {
      const now = surface.state ?? s
      const frame = now.frame + 1
      const isUp = now.hop !== null && hopLift(now.hop, frame) !== null
      surface.setState({ frame, hop: isUp ? now.hop : Math.random() < HOP_CHANCE ? frame : null })
    })
  }

  surface.onPointer(() => {
    const now = surface.state ?? s

    if (now.hop === null) {
      surface.setState({ ...now, hop: now.frame })
    }
  })

  const lift = s.hop === null ? 0 : (hopLift(s.hop, s.frame) ?? 0)

  return (
    <Box flexDirection="column">
      {santaRows(props.colors, lift).map(row => (
        <RunsLine Text={Text} runs={row} />
      ))}
    </Box>
  )
}

export default SantaClient
