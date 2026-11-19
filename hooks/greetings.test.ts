import { expect, test } from 'claude-code/testing'

import { GREETINGS, GREETING_MAX, pickGreeting } from './greetings'

test('a hundred different greetings', () => {
  expect(GREETINGS.length).toBe(100)
  expect(new Set(GREETINGS).size).toBe(100)
})

test('each greeting fits after the countdown in the pane', () => {
  expect(GREETINGS.filter(line => [...line].length > GREETING_MAX)).toEqual([])
})

test('picks cover the whole list', () => {
  expect(pickGreeting(0)).toBe(GREETINGS[0])
  expect(pickGreeting(0.999999)).toBe(GREETINGS[99])
})
