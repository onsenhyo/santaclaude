// The /santaclaude-* commands, written once: registration and the typeahead both read this table.
import type { PromptAutocompleteSuggestion } from 'claude-code'

type Arg = { name: string; about: string }
type Command = { description: string; args?: readonly Arg[]; isArgOptional?: true }

export type CommandName =
  | 'santaclaude-pane'
  | 'santaclaude-quiz'
  | 'santaclaude-answer'
  | 'santaclaude-color'
  | 'santaclaude-snowman'
  | 'santaclaude-on'
  | 'santaclaude-off'

const ON_OFF: readonly Arg[] = [
  { name: 'on', about: 'Show the snowman' },
  { name: 'off', about: 'Hide the snowman' },
]

export const COMMANDS: Record<CommandName, Command> = {
  'santaclaude-pane': {
    description: 'Santa Claude: open or close the Christmas pane',
    isArgOptional: true,
    args: [
      { name: 'auto', about: 'Open the pane by itself on wide terminals' },
      { name: 'manual', about: 'Open the pane only on /santaclaude-pane' },
    ],
  },
  'santaclaude-quiz': { description: 'Santa Claude: a Christmas dev quiz question' },
  'santaclaude-answer': {
    description: 'Santa Claude: answer the open quiz question',
    args: ['a', 'b', 'c', 'd'].map(name => ({ name, about: `Answer ${name}` })),
  },
  'santaclaude-color': {
    description: 'Santa Claude: change the decoration colors',
    args: [
      { name: 'classic', about: 'Red, green and gold' },
      { name: 'frost', about: 'Ice blue and silver' },
      { name: 'candle', about: 'Burgundy and amber' },
    ],
  },
  'santaclaude-snowman': { description: 'Santa Claude: show or hide the snowman', args: ON_OFF },
  'santaclaude-on': { description: 'Santa Claude: turn the decorations on' },
  'santaclaude-off': { description: 'Santa Claude: turn the decorations off' },
}

/** What `$.command.register` takes for a command, its name aside. */
export const specOf = (name: CommandName): { description: string; argumentHint?: string } => {
  const { description, args, isArgOptional } = COMMANDS[name]

  if (args === undefined) {
    return { description }
  }
  const choices = args.map(arg => arg.name).join('|')

  return { description, argumentHint: isArgOptional ? `[${choices}]` : choices }
}

const isCommandName = (name: string): name is CommandName => name in COMMANDS

/**
 * Typeahead rows for the argument at the cursor: `token` starts at `start` in `text`.
 * `choices` labels the answer rows with the open quiz question's choices.
 */
export const suggest = (
  text: string,
  start: number,
  token: string,
  choices?: readonly string[],
): PromptAutocompleteSuggestion[] => {
  const named = text.slice(0, start).match(/^\/(\S+)\s+$/)?.[1]?.toLowerCase() ?? ''

  if (!isCommandName(named)) {
    return []
  }
  const word = token.toLowerCase()

  return (COMMANDS[named].args ?? [])
    .map((arg, i) => ({
      text: arg.name,
      description: named === 'santaclaude-answer' ? (choices?.[i] ?? arg.about) : arg.about,
    }))
    .filter(row => row.text.startsWith(word))
}
