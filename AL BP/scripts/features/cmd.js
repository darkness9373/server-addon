import { world } from '@minecraft/server'
import Score from '../extension/Score'

world.beforeEvents.chatSend.subscribe(data => {
    let player = data.sender;
    let msg = data.message;
    let args = msg.slice(1).split(' ')
    if (msg.startsWith('!')) {
        data.cancel = true;
        switch (args[0]) {
            case 'add':
                Score.add(player, args[1], args[2])
                break;
            case 'set':
                Score.set(player, args[1], args[2])
                break;
            case 'remove':
                Score.remove(player, args[1], args[2])
                break;
            case 'get':
                Score.get(player, args[1])
                break;
            default:
                player.sendMessage(`Error prefix`)
                break;
        }
    }
})