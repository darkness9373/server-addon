import { world, system, Player } from '@minecraft/server'
import Score from '../extension/Score'
import { WorldDatabase } from '../extension/Database'
import { npcShopMenu, summonNpc } from './npc'

world.beforeEvents.chatSend.subscribe(data => {
    let player = data.sender;
    let prefix = new WorldDatabase('prefix').get() ?? '!'
    let msg = data.message;
    let args = msg.slice(prefix.length).split(' ')
    if (msg.startsWith(prefix)) {
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
            case 'shop':
                system.run(() => npcShopMenu(player))
                break;
            case 'spawnnpc':
                if (!player.hasTag('admin')) return noAdmin(player)
                system.run(() => {
                    summonNpc(player)
                })
                break;
            default:
                player.sendMessage(`Error prefix`)
                break;
        }
    }
})


function noAdmin(player) {
    player.sendMessage(`[Access Denied]\n\nMenu ini hanya bisa diakses oleh Admin!!`)
}
