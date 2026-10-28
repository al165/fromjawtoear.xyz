# Website for "From Jaw to Ear, From Bone to Signal"

Webpage front-end and server for [_From Jaw to Ear_](https://fromjawtoear.xyz),
Natalia Jordanova, 2026.

Accepts sensor data to `/api/sensor` so long as `token` is included in the
body, which can be set in `/srv/config/fromjawtoear.env` (if deploying with
`pm2`), otherwise in `.env` in root.

## Starting

### Docker

```sh
cp .env.example .env
docker compose up -d --build
```

### pm2

```sh
mkdir /srv/config
cp .env.example /srv/config/fromjawtoear.env
pm2 start ecosystem.config.cjs
```

### Bare metal

```sh
cp .env.example .env
node app.js
```

## Player

If the `/player` endpoint is needed, add `SEGMENTS=/path/to/segments` to
`.env`, which is the directory containing `playlist.m3u8` and the `seg_*.ts`
files.

## Attribution

Fonts _Ortica Angular_ and _Ribes Light_ from
[Collletttivo](https://www.collletttivo.it/), licensed under [The SIL Open Font
License](https://openfontlicense.org/).

Font _IBM EGA 8x8_ created by _VileR_ of [The Oldschool PC Font
Resource](https://int10h.org/oldschool-pc-fonts/), licensed under [Creative
Commons Attribution-ShareAlike 4.0
International](https://creativecommons.org/licenses/by-sa/4.0/).
