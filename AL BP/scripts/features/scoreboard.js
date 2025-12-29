import { world, system } from '@minecraft/server'
import { PlayerDatabase } from '../extension/Database'
import Score from '../extension/Score'
import Extra from '../extension/Extra'



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
        '       Nama Server',
        '@BREAK',
        '@BLANK',
        ' > Name    : @NAME',
        ' > Coin    : @COIN',
        ' > Rank    : @RANK',
        ' > Ping    : @PINGms',
        ' > Online  : @ONLINE player(s)',
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
                BREAK: '=========================',
                X: Math.floor(player.location.x),
                Y: Math.floor(player.location.y),
                Z: Math.floor(player.location.z),
                KILL: Score.get(player, 'killMob'),
                KILLM: Score.get(player, 'killMonster')
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