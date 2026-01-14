import { world, system } from '@minecraft/server'
import { PlayerDatabase } from '../extension/Database'
import Score from '../extension/Score'
import Extra from '../extension/Extra'
import { playtime } from './timeplayed'

/* =========================
   PLACEHOLDER ENGINE
========================= */
function getPlaceholder(text, data) {
    for (const item of data) {
        for (const key in item) {
            const holder = new RegExp('@' + key, 'g')
            text = text.replace(holder, item[key])
        }
    }
    return text
}

/* =========================
   SCOREBOARD TEMPLATE
========================= */
const board = {
    Line: [
        '@BLANK',
        '     Ancient Survival     ',
        '@BREAK',
        '@BLANK',
        ' §a>§r Name: @NAME',
        ' §a>§r Rank: @RANK',
        ' §a>§r Coin: @COIN',
        ' §a>§r Ping: @PINGms',
        ' §a>§r Kill Monster: @KILLMONSTER',
        '@BLANK',
        ' §a>§r Time Played: @TIMEPLAYED',
        ' §a>§r Online: @ONLINE player(s)',
        '@BLANK',
        '@BREAK',
        '@BLANK'
    ]
}

/* =========================
   MAIN SCOREBOARD LOOP
========================= */
system.runInterval(() => {
    const online = world.getPlayers().length
    
    for (const player of world.getPlayers()) {
        const data = [{
            NAME: player.name,
            RANK: new PlayerDatabase('Rank', player).get() ?? 'Newbie',
            COIN: Extra.metricNumber(Score.get(player, 'money') ?? 0),
            PING: Score.get(player, 'ping') ?? 0,
            ONLINE: online,
            KILLMONSTER: Score.get(player, 'killMonster') ?? 0,
            TIMEPLAYED: playtime(Score.get(player, 'timePlayed') ?? 0),
            BLANK: ' ',
            BREAK: runLine()
        }]
        
        player.onScreenDisplay.setTitle(
            getPlaceholder(board.Line.join('\n'), data)
        )
    }
}, 5)

/* =========================
   PING SIMULATION
========================= */
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const start = Date.now()
        
        system.run(() => {
            const ping = Date.now() - start
            Score.set(player, 'ping', ping)
        })
    }
}, 60)

/* =========================
   ANIMATED LINE
========================= */
function animatedLine(width, offset, inward) {
    let line = ''
    const left = offset
    const right = width - offset - 1
    
    for (let i = 0; i < width; i++) {
        if (i === left) line += inward ? '>' : '<'
        else if (i === right) line += inward ? '<' : '>'
        else line += '§a—§r'
    }
    return line
}

let offset = 0
let dir = 1
const width = 26
const center = Math.floor(width / 2) - 1

function runLine() {
    const inward = dir === 1
    const line = animatedLine(width, offset, inward)
    
    offset += dir
    if (offset >= center) dir = -1
    if (offset <= 0) dir = 1
    
    return line
}