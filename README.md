# Santa Claude

A Christmas mod for Claude Code: snow piles up as your context window fills.

## What you get

- **The Christmas pane** (`/santaclaude-pane`): a pixel-art tree with twinkling bulbs standing on a snowfield that rises as your context fills, a present under it for every commit this session, and the countdown to Christmas. Santa Claude stands on the snow and hops now and then, and whenever you hover over or click him. Snow drifts down, Rudolph wanders by from time to time, and on December 25 Santa's sleigh flies over.
- **A little snowman**, hidden by default (`/santaclaude-snowman on`). He hops when hovered or clicked too.
- **A welcome card** with Santa Claude when a session starts. He hops there too, now and then and when you hover over or click him.
- **Christmas spinner words** while Claude works: about 48 of them, from "Wrapping presents…" to "Waking Rudolph…".
- **Toasts** when the snow (context) passes 50%, 80% and 95%, and when compaction melts it away.
- **A Christmas developer quiz**: 40 questions on git, C#/Unity, TypeScript and the web, and general computer science.
- **Three color themes**: classic, frost and candle.

The countdown uses your machine's local date, so it rolls over at your midnight.

## Install

At the prompt of a terminal session:

```
/plugin install santaclaude --marketplace onsenhyo/santaclaude
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```
claude plugin install santaclaude --marketplace onsenhyo/santaclaude
```

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `onsenhyo/santaclaude`, then Add plugin.

The repository is private for now, so installing needs read access to it on GitHub and a git credential for github.com on your machine (for example `gh auth login`, then `gh auth setup-git`).

## Commands

| Command | What it does |
| --- | --- |
| `/santaclaude-pane` | Open or close the Christmas pane |
| `/santaclaude-pane auto` \| `manual` | Open the pane by itself on wide terminals, or only on `/santaclaude-pane` |
| `/santaclaude-quiz` | Ask a Christmas developer quiz question |
| `/santaclaude-answer a` \| `b` \| `c` \| `d` | Answer the open question |
| `/santaclaude-color classic` \| `frost` \| `candle` | Change the decoration colors |
| `/santaclaude-snowman on` \| `off` | Show or hide the snowman |
| `/santaclaude-on` | Turn the decorations on |
| `/santaclaude-off` | Turn the decorations off |

The typeahead completes each command's arguments. Your settings are remembered across sessions.

## Optional: a status line

`extras/xmas-statusline.sh` prints one line with the countdown, and on December 25 a greeting:

```
  Merry Xmas 🎅 D-36
```

If you have no status line yet, point Claude Code at it in `~/.claude/settings.json`:

```json
"statusLine": { "type": "command", "command": "bash /path/to/xmas-statusline.sh" }
```

To add it under a status line script you already use, make a small wrapper and point `statusLine` at that instead:

```bash
input=$(cat)
printf '%s' "$input" | bash ~/.claude/your-statusline.sh
bash /path/to/xmas-statusline.sh </dev/null
```

It needs bash and GNU `date`. Git Bash on Windows works.

## Notes

- With `/santaclaude-pane auto`, the pane opens by itself only on a wide terminal. Otherwise open it with `/santaclaude-pane`.
- Claude Code's own logo can't be replaced, so the welcome card shows right under it.
- Hopping on hover and click needs a terminal that reports the mouse.

## Development

```
claude plugin validate .
claude plugin test .
```

To run it from a clone: `claude --plugin-dir <path to the clone>`.

## License

MIT
