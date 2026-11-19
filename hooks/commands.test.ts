import { expect, test } from 'claude-code/testing'

import { specOf, suggest } from './commands'

const texts = (rows: { text: string }[]) => rows.map(row => row.text)

test('arguments complete after their command', () => {
  expect(texts(suggest('/santaclaude-color f', 19, 'f'))).toEqual(['frost'])
  expect(texts(suggest('/santaclaude-pane a', 18, 'a'))).toEqual(['auto'])
  expect(texts(suggest('/santaclaude-snowman o', 21, 'o'))).toEqual(['on', 'off'])
})

test('commands without arguments complete nothing', () => {
  expect(suggest('/santaclaude-on x', 16, 'x')).toEqual([])
})

test('other prompts get nothing', () => {
  expect(suggest('fix the bug', 4, 'the')).toEqual([])
  expect(suggest('/help me', 6, 'me')).toEqual([])
  expect(suggest('/xmas color f', 12, 'f')).toEqual([])
})

test('argument hints', () => {
  expect(specOf('santaclaude-pane').argumentHint).toBe('[auto|manual]')
  expect(specOf('santaclaude-color').argumentHint).toBe('classic|frost|candle')
  expect(specOf('santaclaude-on').argumentHint).toBeUndefined()
})
