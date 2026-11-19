import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Prefs } from '../types'
import { specOf, suggest } from './commands'
import { formatQuestion, parseChoice, pickQuestion, questionById } from './quiz'
import { RunsLine } from './runs'
import type { SantaProps } from './santa-client'
import {
  PALETTES,
  SANTA_CARD_COLUMNS,
  SANTA_CARD_ROWS,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  buildScene,
  countdownText,
  crossedMilestones,
  daysUntilChristmas,
  gaugeRuns,
  isPalette,
  santaRows,
} from './scene'
import type { Row } from './scene'
import type { SceneProps } from './scene-client'
import { SPINNER_WORDS } from './words'

const PLUGIN = 'santaclaude'
const PANE = 'santaclaude'
const PANE_TITLE = '🎄 Santa Claude'
const WELCOME = 'welcome'
const PREFS_KEY = 'prefs'
const SOLVED_KEY = 'solved'
const DEFAULT_PREFS: Prefs = { isOn: true, palette: 'classic', paneAuto: false, showSnowman: false }

const snow = atom({ plugin: 'santaclaude', key: 'snow' } as const, 0)
const gifts = atom({ plugin: 'santaclaude', key: 'gifts' } as const, 0)
const days = atom({ plugin: 'santaclaude', key: 'days' } as const, 0)
const quiz = atom({ plugin: 'santaclaude', key: 'quiz' } as const, null)
const prefs = atom({ plugin: 'santaclaude', key: 'prefs' } as const, DEFAULT_PREFS)

const COMMIT = /\bgit\b[^\n|;&]*\bcommit\b/

const todayCountdown = async ($: EngineInterface): Promise<number> => {
  const now = new Date(await $.clock.now())

  return daysUntilChristmas(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

const savePrefs = async ($: EngineInterface, change: (p: Prefs) => Prefs): Promise<Prefs> => {
  const next = change(await read($, prefs))
  await update($, prefs, () => next)
  await $.store.set(PREFS_KEY, next)

  return next
}

/** Quiz ids answered right, across sessions: new questions come first. */
const loadSolved = async ($: EngineInterface): Promise<string[]> => {
  const stored = await $.store.get(SOLVED_KEY)

  return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : []
}

const answerQuiz = async ($: EngineInterface, arg: string): Promise<string> => {
  const open = await read($, quiz)
  const question = open === null ? undefined : questionById(open)

  if (question === undefined) {
    return 'No question is open. Ask one with /santaclaude-quiz'
  }
  const choice = parseChoice(arg)

  if (choice === null) {
    return 'Answer with /santaclaude-answer a, b, c or d'
  }
  await update($, quiz, () => null)

  if (choice !== question.answer) {
    const right = `${'abcd'[question.answer]}) ${question.choices[question.answer]}`

    return `❌ Not quite. It was ${right}\n${question.explain}\nTry another with /santaclaude-quiz`
  }
  const solved = await loadSolved($)

  if (!solved.includes(question.id)) {
    await $.store.set(SOLVED_KEY, [...solved, question.id])
  }

  return `🎉 Correct! ${question.explain}`
}

const firstWord = (args: string): string => args.trim().toLowerCase().split(/\s+/)[0] ?? ''

export const register: Register = on => {
  let word = SPINNER_WORDS[0] ?? 'Wrapping presents'

  on('session.start', async ($, e, next) => {
    const stored = (await $.store.get(PREFS_KEY)) as Partial<Prefs> | undefined
    const loaded: Prefs = { ...DEFAULT_PREFS, ...stored }
    await update($, prefs, () => loaded)
    const countdown = await todayCountdown($)
    await update($, days, () => countdown)
    const usage = await $.session.usage()
    await update($, snow, () => usage.context.percent ?? 0)

    await $.command.register({ name: 'santaclaude-pane', ...specOf('santaclaude-pane') })
    await $.command.register({ name: 'santaclaude-quiz', ...specOf('santaclaude-quiz') })
    await $.command.register({ name: 'santaclaude-answer', ...specOf('santaclaude-answer') })
    await $.command.register({ name: 'santaclaude-color', ...specOf('santaclaude-color') })
    await $.command.register({ name: 'santaclaude-snowman', ...specOf('santaclaude-snowman') })
    await $.command.register({ name: 'santaclaude-on', ...specOf('santaclaude-on') })
    await $.command.register({ name: 'santaclaude-off', ...specOf('santaclaude-off') })

    if (loaded.isOn) {
      await $.ui.place({ id: WELCOME })

      if (loaded.paneAuto) {
        void $.ui.open({ id: PANE, title: PANE_TITLE })
      }
    }

    // The countdown turns over at midnight.
    $.clock.every(60_000, async () => {
      const latest = await todayCountdown($)

      if (latest !== (await read($, days))) {
        await update($, days, () => latest)
      }
    })

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    const before = await read($, snow)
    const after = e.context.percent ?? 0

    if (after !== before) {
      await update($, snow, () => after)

      if ((await read($, prefs)).isOn) {
        for (const text of crossedMilestones(before, after)) {
          $.ui.toast(text)
        }
      }
    }

    return next(e)
  })

  on('session.compact', async ($, e, next) => {
    const result = await next(e)

    if (e.agentId === undefined && e.trigger !== 'precompute' && 'messages' in result) {
      await update($, snow, () => 0)

      if ((await read($, prefs)).isOn) {
        $.ui.toast('☀ Compacted. The snow melted away')
      }
    }

    return result
  }).catch(($, e, next) => next(e))

  on('tool.call', async ($, e, next) => {
    const result = await next(e)
    const isShell = e.tool === 'Bash' || String(e.tool) === 'PowerShell'
    const command = isShell ? String((e as { command?: unknown }).command ?? '') : ''

    if (COMMIT.test(command) && !('deny' in result && result.deny !== undefined) && result.isError !== true) {
      await update($, gifts, n => n + 1)

      if ((await read($, prefs)).isOn) {
        $.ui.toast('🎁 Committed! One more present under the tree')
      }
    }

    return result
  }).catch(($, e, next) => next(e))

  on('turn.start', async ($, e, next) => {
    word = SPINNER_WORDS[Math.floor(Math.random() * SPINNER_WORDS.length)] ?? word

    return next(e)
  })

  on('prompt.autocomplete', async ($, e, next) => {
    const beneath = await next(e)
    const open = await read($, quiz)
    const choices = open === null ? undefined : questionById(open)?.choices
    const mine = suggest(e.text, e.start, e.token, choices)

    return mine.length === 0 ? beneath : { suggestions: [...beneath.suggestions, ...mine] }
  })

  on('command.run', { command: 'santaclaude-pane' }, async ($, e) => {
    const arg = firstWord(e.args)

    if (arg === 'auto' || arg === 'manual') {
      const paneAuto = arg === 'auto'
      await savePrefs($, p => ({ ...p, paneAuto }))

      return { text: paneAuto ? 'The pane opens by itself on wide terminals' : 'The pane opens only on /santaclaude-pane' }
    }

    if ((await $.ui.panes()).some(pane => pane.id === PANE)) {
      await $.ui.close({ id: PANE })

      return { text: 'Closed the Christmas pane' }
    }
    await savePrefs($, p => ({ ...p, isOn: true }))
    await $.ui.open({ id: PANE, title: PANE_TITLE })

    return { text: '🎄 Opened the Christmas pane' }
  })

  on('command.run', { command: 'santaclaude-quiz' }, async $ => {
    const question = pickQuestion(await loadSolved($), Math.random(), (await read($, quiz)) ?? undefined)
    await update($, quiz, () => question.id)

    return { text: formatQuestion(question) }
  })

  on('command.run', { command: 'santaclaude-answer' }, async ($, e) => ({ text: await answerQuiz($, firstWord(e.args)) }))

  on('command.run', { command: 'santaclaude-color' }, async ($, e) => {
    const arg = firstWord(e.args)

    if (!isPalette(arg)) {
      return { text: 'Colors: classic, frost, candle. Try /santaclaude-color frost' }
    }
    await savePrefs($, p => ({ ...p, palette: arg }))

    return { text: `🎨 Colors set to ${arg}` }
  })

  on('command.run', { command: 'santaclaude-snowman' }, async ($, e) => {
    const arg = firstWord(e.args)

    if (arg !== 'on' && arg !== 'off') {
      return { text: 'Show or hide the snowman: /santaclaude-snowman on or off' }
    }
    const showSnowman = arg === 'on'
    await savePrefs($, p => ({ ...p, showSnowman }))

    return { text: showSnowman ? '⛄ The snowman is out in the snow' : 'The snowman went inside' }
  })

  on('command.run', { command: 'santaclaude-on' }, async $ => {
    await savePrefs($, p => ({ ...p, isOn: true }))

    return { text: '🎄 Santa Claude is back' }
  })

  on('command.run', { command: 'santaclaude-off' }, async $ => {
    await savePrefs($, p => ({ ...p, isOn: false }))
    await $.ui.close({ id: PANE })

    return { text: 'Santa Claude is resting. /santaclaude-on brings him back' }
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    if (e.props.message !== null || !(await read($, prefs)).isOn) {
      return next(e)
    }

    return next({ ...e, props: { ...e.props, word } })
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const p = await read($, prefs)

    if (!p.isOn || e.props.hasSurvey) {
      return next(e)
    }
    const colors = PALETTES[p.palette]
    const percent = await read($, snow)
    const count = await read($, gifts)
    const { Box, Text } = $.ui.resolve(e)
    const runs: Row = [
      { text: '🎅 🎄 ' },
      { text: countdownText(await read($, days)), color: colors.red },
      { text: '   ❄ ' },
      ...gaugeRuns(percent, 20, colors),
      { text: ` ${percent}%` },
      { text: `   🎁 ${count} ${count === 1 ? 'commit' : 'commits'}` },
    ]

    return (
      <Box>
        <RunsLine Text={Text} runs={runs} />
      </Box>
    )
  })

  on('ui.render', { component: 'Placed' }, async ($, e, next) => {
    if (e.props.plugin !== PLUGIN || e.props.id !== WELCOME) {
      return next(e)
    }
    const p = await read($, prefs)

    if (!p.isOn) {
      return next(e)
    }
    const colors = PALETTES[p.palette]
    const left = await read($, days)
    const elements = $.ui.resolve(e)
    const { Box, Text } = elements
    const line = left === 0 ? 'Merry Christmas!' : `${countdownText(left)} until Christmas`
    const santa: SantaProps = { colors }

    return (
      <Box flexDirection="row" borderStyle="round" paddingX={1} gap={2}>
        {'Client' in elements ? (
          <elements.Client
            key="santa"
            module="./santa-client.tsx"
            props={santa}
            width={SANTA_CARD_COLUMNS}
            height={SANTA_CARD_ROWS}
          />
        ) : (
          <Box flexDirection="column">
            {santaRows(colors).map(row => (
              <RunsLine Text={Text} runs={row} />
            ))}
          </Box>
        )}
        <Box flexDirection="column" justifyContent="center">
          <Text bold>Ho ho ho, Santa Claude is here.</Text>
          <Text>
            <Text color={colors.red}>{line}</Text>
            <Text dimColor> · type /santaclaude- for commands</Text>
          </Text>
        </Box>
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const p = await read($, prefs)
    const colors = PALETTES[p.palette]
    const percent = await read($, snow)
    const left = await read($, days)
    const elements = $.ui.resolve(e)
    const { Box, Text } = elements
    const scene: SceneProps = {
      percent,
      gifts: await read($, gifts),
      isChristmas: left === 0,
      showSnowman: p.showSnowman,
      colors,
    }
    const width = Math.min(SCENE_WIDTH, e.props.bodyColumns)

    return (
      <Box flexDirection="column">
        <Text>
          <Text bold color={colors.red}>
            {countdownText(left)}
          </Text>
          {left === 0 ? null : <Text dimColor> until Christmas</Text>}
        </Text>
        {'Client' in elements ? (
          <elements.Client key="scene" module="./scene-client.tsx" props={scene} width={width} height={SCENE_HEIGHT} />
        ) : (
          // A surface without surface modules gets the scene as a still frame.
          buildScene({
            ...scene,
            tick: 0,
            width,
            rudolph: null,
            sleigh: null,
            seed: 0,
            lift: { santa: 0, snowman: p.showSnowman ? 0 : null },
          }).rows.map(row => <RunsLine Text={Text} runs={row} />)
        )}
        <Text dimColor>❄ context {percent}%</Text>
      </Box>
    )
  })
}
