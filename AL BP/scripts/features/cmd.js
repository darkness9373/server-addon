import { world } from '@minecraft/server'
import Score from '../extension/Score'

world.beforeEvents.chatSend.subscribe(data => {
    let player = data.sender;
    let msg = data.message;
    let args = msg.slice(1).split(' ')
    if (msg.startsWith('!')) {
        if (args[0] == add) {
            Score.add(player, 'money', args[1])
        }
    }
})