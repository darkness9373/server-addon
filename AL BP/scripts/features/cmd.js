import { world, system } from '@minecraft/server'
import Score from '../extension/Score'

world.beforeEvents.chatSend.subscribe(data => {
    let player = data.sender;
    let msg = data.message;
    let args = msg.slice(1).split(' ')
    if (msg.startsWith('!')) {
        data.cancel = true;
        switch (args[0]) {
            case 'add':
                if (!player.hasTag('admin')) return noAdmin(player)
                Score.add(player, args[1], Number(args[2]))
                break;
            case 'set':
                if (!player.hasTag('admin')) return noAdmin(player)
                Score.set(player, args[1], Number(args[2]))
                break;
            case 'remove':
                if (!player.hasTag('admin')) return noAdmin(player)
                Score.remove(player, args[1], Number(args[2]))
                break;
            case 'get':
                if (!player.hasTag('admin')) return noAdmin(player)
                player.sendMessage(`${Score.get(player, args[1])}`)
                break;
            default:
                player.sendMessage(`Error prefix`)
                break;
        }
    }
})


function noAdmin(player) {
    player.sendMessage(`§cMenu ini hanya bisa digunakan oleh Admin!!`)
}