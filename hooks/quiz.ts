// The Christmas developer quiz: a fixed bank and the pure helpers around it.

export type Choice = 0 | 1 | 2 | 3

export type Question = {
  id: string
  prompt: string
  choices: readonly [string, string, string, string]
  answer: Choice
  explain: string
}

export const QUESTIONS: readonly Question[] = [
  // git
  {
    id: 'git-reflog',
    prompt: "An elf hard-reset the workshop branch and lost Santa's commits. Which command shows where HEAD has been?",
    choices: ['git reflog', 'git log --lost', 'git stash list', 'git show-gifts'],
    answer: 0,
    explain: 'git reflog records every move of HEAD, including commits no branch points to anymore.',
  },
  {
    id: 'git-stash',
    prompt: 'An elf must switch branches without committing half-wrapped gifts. Which command shelves the changes?',
    choices: ['git commit --wip', 'git stash', 'git shelve', 'git park'],
    answer: 1,
    explain: 'git stash saves uncommitted changes and cleans the working tree; git stash pop brings them back.',
  },
  {
    id: 'git-bisect',
    prompt: 'A bug sneaked into the toy factory somewhere in 500 commits. Which command binary-searches for the bad one?',
    choices: ['git blame', 'git log -S', 'git bisect', 'git grep'],
    answer: 2,
    explain: 'git bisect halves the commit range at each step until it finds the first bad commit.',
  },
  {
    id: 'git-force-lease',
    prompt: "To rewrite the shared sleigh-route branch without clobbering another elf's new pushes, use…",
    choices: ['git push --force', 'git push --all', 'git push --tags', 'git push --force-with-lease'],
    answer: 3,
    explain: '--force-with-lease refuses to overwrite the remote if it moved since you last fetched.',
  },
  {
    id: 'git-cherry-pick',
    prompt: "Santa wants exactly one commit from the elves' branch on main. Which command copies a single commit?",
    choices: ['git cherry-pick', 'git merge --one', 'git rebase --single', 'git pick'],
    answer: 0,
    explain: 'git cherry-pick applies the changes of the given commit as a new commit on the current branch.',
  },
  {
    id: 'git-amend',
    prompt: "The last commit message says 'Merry Chrismas'. Which command rewrites the latest commit's message?",
    choices: ['git revert HEAD', 'git commit --amend', 'git reset --soft', 'git rename HEAD'],
    answer: 1,
    explain: 'git commit --amend replaces the latest commit, letting you fix its message or contents.',
  },
  {
    id: 'git-revert',
    prompt: 'A bad commit is already on the shared branch. What undoes it without rewriting history?',
    choices: ['git reset --hard HEAD~1', 'git rebase -i', 'git revert <commit>', 'git checkout HEAD~1'],
    answer: 2,
    explain: 'git revert adds a new commit that undoes the old one, so nobody else has to rewrite history.',
  },
  {
    id: 'git-detached',
    prompt: 'After `git checkout <commit-hash>`, the sleigh is flying in which state?',
    choices: ['Merge conflict', 'Rebase in progress', 'Bare repository', 'Detached HEAD'],
    answer: 3,
    explain: 'Checking out a commit directly leaves HEAD pointing at the commit, not at a branch.',
  },
  {
    id: 'git-object-name',
    prompt: 'Every gift needs a tag. By default, what does Git use to name a commit object?',
    choices: ['A SHA-1 hash of its contents', 'A timestamp', 'An incrementing number', 'A random UUID'],
    answer: 0,
    explain: 'Git names objects by a hash of their contents, SHA-1 unless the repository uses SHA-256.',
  },
  {
    id: 'git-ignore-tracked',
    prompt: 'An elf adds secrets.txt to .gitignore, but Git keeps tracking it. Why?',
    choices: [
      '.gitignore needs its own commit first',
      '.gitignore only affects untracked files',
      '.gitignore is case-sensitive on Windows',
      'It must live in .git/info',
    ],
    answer: 1,
    explain: 'Ignore rules only apply to untracked files; run git rm --cached to stop tracking one.',
  },
  // C#, .NET and Unity
  {
    id: 'cs-struct-copy',
    prompt: 'Gift is a struct. After `Gift g2 = g1; g2.Name = "Sled";` what happens to g1.Name?',
    choices: ['It changes too', 'It throws', 'It stays the same', 'It becomes null'],
    answer: 2,
    explain: 'Structs are value types, so assignment copies them and g1 is untouched.',
  },
  {
    id: 'cs-async-void',
    prompt: "Outside event handlers, which return type should an elf avoid on async methods, since callers can't await it?",
    choices: ['Task', 'ValueTask', 'Task<T>', 'void'],
    answer: 3,
    explain: "async void can't be awaited and its exceptions crash the process instead of reaching the caller.",
  },
  {
    id: 'cs-linq-deferred',
    prompt: '`var nice = kids.Where(k => k.IsNice);` When does the filter actually run?',
    choices: ['When the result is enumerated', 'Immediately', 'At compile time', 'When the GC runs'],
    answer: 0,
    explain: 'LINQ queries are deferred: they run each time the sequence is enumerated.',
  },
  {
    id: 'cs-using',
    prompt: "Which C# statement guarantees Dispose() is called on the sleigh's radio, even when an exception is thrown?",
    choices: ['lock', 'using', 'fixed', 'checked'],
    answer: 1,
    explain: 'using calls Dispose() in a finally block when the scope ends.',
  },
  {
    id: 'cs-string-immutable',
    prompt: 'Building a 10,000-line naughty list with `+=` on a string is slow because .NET strings are…',
    choices: ['Stored on the stack', 'Always interned', 'Immutable', 'UTF-32'],
    answer: 2,
    explain: 'Each += allocates a new string; StringBuilder appends in place.',
  },
  {
    id: 'unity-fixed-update',
    prompt: "In Unity, which callback should apply physics forces to the reindeer's Rigidbody?",
    choices: ['Update', 'LateUpdate', 'OnGUI', 'FixedUpdate'],
    answer: 3,
    explain: 'FixedUpdate runs in step with the physics simulation, so forces apply consistently.',
  },
  {
    id: 'unity-awake',
    prompt: 'Which Unity callback runs first on a MonoBehaviour when its scene loads?',
    choices: ['Awake', 'Start', 'Update', 'OnDestroy'],
    answer: 0,
    explain: 'Awake runs first, then OnEnable, then Start before the first frame.',
  },
  {
    id: 'unity-fake-null',
    prompt: "Why can `sleigh == null` be true in Unity after Destroy(sleigh), though the C# reference isn't null?",
    choices: ['The GC already ran', 'UnityEngine.Object overloads ==', 'Unity uses nullable structs', 'Destroy sets it to null'],
    answer: 1,
    explain: 'UnityEngine.Object overrides == to report destroyed native objects as null.',
  },
  {
    id: 'cs-null-conditional',
    prompt: 'In C#, what does `gift?.Wrap()` do when gift is null?',
    choices: ['Throws NullReferenceException', 'Creates a new gift', 'Skips the call', 'Waits for a gift'],
    answer: 2,
    explain: 'The null-conditional operator skips the call and yields null when the left side is null.',
  },
  {
    id: 'unity-coroutine-frame',
    prompt: 'A Unity coroutine wants to pause the sleigh for exactly one frame. What does it `yield return`?',
    choices: ['new WaitForSeconds(1)', 'break', 'Task.Delay(16)', 'null'],
    answer: 3,
    explain: 'yield return null resumes the coroutine on the next frame.',
  },
  // TypeScript, JavaScript and the web
  {
    id: 'js-loose-equality',
    prompt: 'In JavaScript, which of these comparisons is true?',
    choices: ['null == undefined', 'null === undefined', 'NaN === NaN', '[] === []'],
    answer: 0,
    explain: 'Loose equality treats null and undefined as equal to each other and to nothing else.',
  },
  {
    id: 'ts-unknown',
    prompt: 'In TypeScript, which type makes Santa narrow a value before using it?',
    choices: ['any', 'unknown', 'never', 'object'],
    answer: 1,
    explain: 'unknown accepts anything but allows no use until the value is narrowed.',
  },
  {
    id: 'js-typeof-null',
    prompt: 'What does `typeof null` return in JavaScript?',
    choices: ['"null"', '"undefined"', '"object"', '"symbol"'],
    answer: 2,
    explain: 'A historical quirk: typeof null is "object".',
  },
  {
    id: 'js-microtask',
    prompt: '`setTimeout(f, 0)` and `Promise.resolve().then(g)` are scheduled together. Which runs first?',
    choices: ['f', 'Random', 'Both at once', 'g'],
    answer: 3,
    explain: 'Promise callbacks are microtasks, which run before the next timer task.',
  },
  {
    id: 'http-304',
    prompt: "The browser asks for a cached gift list that hasn't changed. Which status says 'use your copy'?",
    choices: ['304 Not Modified', '204 No Content', '302 Found', '410 Gone'],
    answer: 0,
    explain: '304 tells the client its cached copy is still valid, so no body is sent.',
  },
  {
    id: 'js-const-object',
    prompt: '`const sleigh = { reindeer: 8 }; sleigh.reindeer = 9;` What happens?',
    choices: ['TypeError', 'It works', 'Silently ignored', 'SyntaxError'],
    answer: 1,
    explain: 'const fixes the binding, not the object, so its properties can still change.',
  },
  {
    id: 'ts-never',
    prompt: 'In TypeScript, what is the return type of a function that always throws?',
    choices: ['void', 'undefined', 'never', 'null'],
    answer: 2,
    explain: 'never is the type of something that never produces a value, like a function that always throws.',
  },
  {
    id: 'web-cors',
    prompt: "A page on elves.example fetches santa.example's API. What lets santa.example allow it?",
    choices: ['A Content-Security-Policy', 'A cookie', 'An HSTS header', 'CORS headers'],
    answer: 3,
    explain: 'The server opts in to cross-origin reads with headers such as Access-Control-Allow-Origin.',
  },
  // General computer science
  {
    id: 'cs-binary-search',
    prompt: "Santa's sorted list holds 1,000,000 names. About how many checks does binary search need at most?",
    choices: ['About 20', 'About 1,000', 'About 500,000', 'About 1,000,000'],
    answer: 0,
    explain: 'Binary search halves the range each step, and 2^20 is just over a million.',
  },
  {
    id: 'ds-queue',
    prompt: 'Kids line up to see Santa: first come, first served. Which data structure is that?',
    choices: ['Stack', 'Queue', 'Heap', 'Trie'],
    answer: 1,
    explain: 'A queue is first in, first out.',
  },
  {
    id: 'ds-hash-set',
    prompt: 'Checking whether a name is on the nice list in O(1) time on average calls for a…',
    choices: ['Linked list', 'Sorted array', 'Hash set', 'Binary tree'],
    answer: 2,
    explain: 'A hash set finds an item in constant time on average.',
  },
  {
    id: 'float-point-one',
    prompt: 'Why is `0.1 + 0.2 === 0.3` false in JavaScript and most languages?',
    choices: ['Integer overflow', 'Rounding always goes down', 'A JIT bug', '0.1 has no exact binary form'],
    answer: 3,
    explain: 'Binary floating point cannot represent 0.1 exactly, so the sum is 0.30000000000000004.',
  },
  {
    id: 'unicode-surrogates',
    prompt: "What is `'🎄'.length` in JavaScript?",
    choices: ['2', '1', '4', '0'],
    answer: 0,
    explain: 'JavaScript strings count UTF-16 code units, and 🎄 takes a surrogate pair.',
  },
  {
    id: 'http-post',
    prompt: "Which HTTP method is not idempotent, so a double-click on 'Send gift' might send two?",
    choices: ['PUT', 'POST', 'DELETE', 'GET'],
    answer: 1,
    explain: 'Repeating a POST can create a second resource; PUT, DELETE and GET are idempotent.',
  },
  {
    id: 'regex-greedy',
    prompt: "The regex `<.+>` runs on '<b>Ho</b>'. What does it match?",
    choices: ['<b>', 'Ho', '<b>Ho</b>', 'Nothing'],
    answer: 2,
    explain: '.+ is greedy and backtracks only to the last >; <.+?> would match just <b>.',
  },
  {
    id: 'big-o-pairs',
    prompt: 'Comparing every gift with every other gift among n gifts takes…',
    choices: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'],
    answer: 3,
    explain: 'There are n(n-1)/2 pairs, which grows as n².',
  },
  {
    id: 'stack-overflow',
    prompt: 'A recursive chimney descent with no base case eventually causes…',
    choices: ['A stack overflow', 'Heap fragmentation', 'A deadlock', 'A race condition'],
    answer: 0,
    explain: 'Each call adds a stack frame until the call stack runs out of room.',
  },
  {
    id: 'dns',
    prompt: 'Before the sleigh can connect to santa.example, which system turns the name into an IP address?',
    choices: ['DHCP', 'DNS', 'NAT', 'ARP'],
    answer: 1,
    explain: 'DNS resolves domain names to IP addresses.',
  },
  {
    id: 'deadlock',
    prompt: "Two elves each hold one wrapping tool and wait forever for the other's. That's a…",
    choices: ['Race condition', 'Memory leak', 'Deadlock', 'Starvation'],
    answer: 2,
    explain: 'A deadlock is a cycle of workers each waiting on a resource another one holds.',
  },
  {
    id: 'utf8-ascii',
    prompt: "In UTF-8, how many bytes does the letter 'S' (for Santa) take?",
    choices: ['4', '2', '3', '1'],
    answer: 3,
    explain: 'UTF-8 encodes every ASCII character in a single byte.',
  },
]

const LETTERS = ['a', 'b', 'c', 'd'] as const

/** A question not in `solved`, picked by `roll` in [0,1); any question once all are solved. Never `avoid` when another choice exists. */
export const pickQuestion = (solved: readonly string[], roll: number, avoid?: string): Question => {
  const unsolved = QUESTIONS.filter(q => !solved.includes(q.id))
  const pool = unsolved.length > 0 ? unsolved : QUESTIONS
  const fresh = pool.length > 1 ? pool.filter(q => q.id !== avoid) : pool
  const index = Math.min(fresh.length - 1, Math.max(0, Math.floor(roll * fresh.length)))

  return fresh[index] ?? (QUESTIONS[0] as Question)
}

export const questionById = (id: string): Question | undefined => QUESTIONS.find(q => q.id === id)

/** 'a'-'d' or '1'-'4', case-insensitive, trimmed; anything else null. */
export const parseChoice = (text: string): Choice | null => {
  const t = text.trim().toLowerCase()
  const letter = LETTERS.indexOf(t as (typeof LETTERS)[number])

  if (letter >= 0) {
    return letter as Choice
  }

  if (/^[1-4]$/.test(t)) {
    return (Number(t) - 1) as Choice
  }

  return null
}

export const formatQuestion = (q: Question): string =>
  [
    '🎄 Xmas quiz',
    q.prompt,
    ...q.choices.map((choice, i) => `  ${LETTERS[i]}) ${choice}`),
    'Answer with /santaclaude-answer a|b|c|d',
  ].join('\n')
