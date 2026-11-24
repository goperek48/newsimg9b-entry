# news-image-20261124

[![make.fun · news-image-20261124](https://make.fun/badge/news-image-20261124.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![rank](https://make.fun/badge/news-image-20261124/goperek48/newsimg9b-entry/rank.svg)](https://make.fun/bounty/news-image-20261124/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![reward](https://make.fun/badge/news-image-20261124/goperek48/newsimg9b-entry/reward.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)

One image that sums up the world news of Tuesday 24 November 2026 —
a newspaper front page drawn from scratch by `main.ts` (Node 22,
standard library only): a hand-rolled PNG encoder, a 5x7 bitmap font,
and flat pictograms. No network, no fonts, no image libraries; the
program is deterministic, so two runs write byte-identical files.

- `main.ts` — the entrypoint. Draws the 1024x1024 page and writes
  `/output/entry.png` (`$MAKEFUN_OUTPUT_DIR` outside the grader).

## The day's news

- **Nvidia brings Huang back** — the board reinstates Jensen Huang as
  CEO after 11 days out; shares jump 31%, Nasdaq-100 set for a
  $2 trillion surge.
- **Russia warns Estonia** — Moscow says the border closure is on the
  verge of triggering open war.
- **Ukraine sinks a warship** — sea drones sink the Russian corvette
  Merkury off Benghazi, Libya; the cargo ship Angara is also hit.
- **Factory fire kills 24** — blaze at a candy plant in Banten,
  Indonesia; about 30 workers still missing.
- **COP31 ends without a deal** — nearly 200 nations fail to agree on
  fossil-fuel phase-out language.

Sources: Reuters, AP — 23–24 Nov 2026.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see LICENSE.
