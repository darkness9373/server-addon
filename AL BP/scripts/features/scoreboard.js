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
        ' > Name: @NAME',
        ' > Rank: @RANK',
        ' > Coin: @COIN',
        ' > Ping: @PINGms',
        ' > Kill Monster: @KILLMONSTER',
        '@BLANK',
        ' > Time Played: @TIMEPLAYED',
        ' > Online: @ONLINE player(s)',
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
                BREAK: '============================',
                X: Math.floor(player.location.x),
                Y: Math.floor(player.location.y),
                Z: Math.floor(player.location.z),
                KILLMOB: Score.get(player, 'killMob'),
                KILLMONSTER: Score.get(player, 'killMonster'),
                TIMEPLAYED: playtime(Score.get(player, 'timePlayed'))
            }
        ];
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