import { world, system } from '@minecraft/server'
import { PlayerDatabase } from '../extension/Database'
import Score from '../extension/Score'
import Extra from '../extension/Extra'
import { playtime } from './timeplayed'



/**
 * 
 * @param {string} text 
 * @param {any} data 
 */
function getPlaceholder(text, data) {
    for (const item of data) {
        for (const key in item) {
            if (item.hasOwnProperty(key)) {
                const holder = new RegExp('@' + key, 'g')
                text = text.replace(holder, item[key])
            }
        }
    }
    return text;
}

const board = {
    Line: [
        '@BLANK',
        '      Ya Allah lindungi Bilqis',
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

system.run(function tick() {
    system.runTimeout(tick, 20)
    
    world.getPlayers().forEach(player => {
        const Placeholder = [
        {
            NAME: player.nameTag,
            COIN: Extra.metricNumber(Score.get(player, 'money')),
            RANK: new PlayerDatabase('Rank', player).get() ?? 'Newbie',
            PING: Score.get(player, 'ping'),
            ONLINE: Array.from(world.getPlayers()).length,
            BLANK: ' ',
            BREAK: runLine(),
            X: Math.floor(player.location.x),
            Y: Math.floor(player.location.y),
            Z: Math.floor(player.location.z),
            KILLMOB: Score.get(player, 'killMob'),
            KILLMONSTER: Score.get(player, 'killMonster'),
            TIMEPLAYED: playtime(Score.get(player, 'timePlayed'))
        }];
        player.onScreenDisplay.setTitle(
            getPlaceholder(board.Line.join('\n'), Placeholder)
        )
    })
})


system.run(function tick() {
    system.runTimeout(tick, 60)
    
    world.getPlayers().forEach(player => {
        const start = Date.now()
        system.run(() => {
            const end = Date.now()
            const ping = end - start;
            
            Score.set(player, 'ping', ping)
        })
    })
})

function animatedLine(width, offset, inward) {
    let line = ""
    const left = offset
    const right = width - offset - 1
    for (let i = 0; i < width; i++) {
        if (i === left) {
            line += inward ? ">" : "<"
        } else if (i === right) {
            line += inward ? "<" : ">"
        } else {
            line += "§a—§r"
        }
    }
    return line
}

let offset = 0
let dir = 1
const width = 25
const center = Math.floor(width / 2) - 1

function runLine() {
    const inward = dir === 1
    const line = animatedLine(width, offset, inward)
    offset += dir
    if (offset >= center) dir = -1
    if (offset <= 0) dir = 1
    return line;
}