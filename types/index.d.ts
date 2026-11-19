export type Palette = 'classic' | 'frost' | 'candle'

export type Prefs = {
  isOn: boolean
  palette: Palette
  paneAuto: boolean
  showSnowman: boolean
}

declare module 'claude-code' {
  interface PluginState {
    santaclaude: {
      /** Context window fill, 0-100: how deep the snow is. */
      snow: number
      /** Commits made in this session: presents under the tree. */
      gifts: number
      /** Days until the next Christmas, 0 on the day. */
      days: number
      /** The quiz question waiting for /santaclaude-answer, by id. */
      quiz: string | null
      prefs: Prefs
    }
  }
}
