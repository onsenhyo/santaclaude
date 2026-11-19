import { expect, test } from 'claude-code/testing'

import { QUESTIONS, formatQuestion, parseChoice, pickQuestion, questionById } from './quiz'

test('quiz bank: 40 questions with unique ids', () => {
  expect(QUESTIONS.length).toBe(40)
  expect(new Set(QUESTIONS.map(q => q.id)).size).toBe(40)
})

test('quiz bank: four distinct choices and an answer in range', () => {
  for (const q of QUESTIONS) {
    expect(q.choices.length).toBe(4)
    expect(new Set(q.choices).size).toBe(4)
    expect(q.choices.every(c => c.trim().length > 0)).toBe(true)
    expect(q.answer >= 0 && q.answer <= 3).toBe(true)
    expect(q.prompt.length > 0 && q.explain.length > 0).toBe(true)
  }
})

test('pickQuestion skips solved questions', () => {
  const solved = QUESTIONS.slice(0, 39).map(q => q.id)
  const last = QUESTIONS[39]?.id

  for (const roll of [0, 0.3, 0.99]) {
    expect(pickQuestion(solved, roll).id).toBe(last)
  }
})

test('pickQuestion avoids the last asked question when it can', () => {
  const solved = QUESTIONS.slice(0, 38).map(q => q.id)
  const avoid = QUESTIONS[38]?.id

  for (const roll of [0, 0.5, 0.99]) {
    expect(pickQuestion(solved, roll, avoid).id).toBe(QUESTIONS[39]?.id)
  }
})

test('pickQuestion still asks once everything is solved', () => {
  const solved = QUESTIONS.map(q => q.id)
  const q = pickQuestion(solved, 0.5)
  expect(questionById(q.id)).toBeDefined()
})

test('parseChoice reads letters and numbers', () => {
  expect(parseChoice('a')).toBe(0)
  expect(parseChoice(' D ')).toBe(3)
  expect(parseChoice('2')).toBe(1)
  expect(parseChoice('4')).toBe(3)
  expect(parseChoice('e')).toBe(null)
  expect(parseChoice('5')).toBe(null)
  expect(parseChoice('')).toBe(null)
  expect(parseChoice('ab')).toBe(null)
})

test('formatQuestion lists every choice and how to answer', () => {
  const text = formatQuestion(QUESTIONS[0]!)
  expect(text).toContain('🎄 Xmas quiz')
  for (const letter of ['a)', 'b)', 'c)', 'd)']) {
    expect(text).toContain(letter)
  }
  expect(text).toContain('Answer with /santaclaude-answer a|b|c|d')
})
