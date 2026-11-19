// One drawn line of colored runs, shared by the hooks module and the surface modules.
import type { ElementConstructor, TextProps } from 'claude-code'

import type { Row } from './scene'

export const RunsLine = ({ Text, runs }: { Text: ElementConstructor<TextProps>; runs: Row }) => (
  <Text>
    {runs.map(run => (
      <Text color={run.color} backgroundColor={run.bg} dimColor={run.dim}>
        {run.text}
      </Text>
    ))}
  </Text>
)
