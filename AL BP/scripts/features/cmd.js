import { world, system, Player } from '@minecraft/server'
import Score from '../extension/Score'
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import OpenUI from '../extension/OpenUI';
import { WorldDatabase } from '../extension/Database'

world.beforeEvents.chatSend.subscribe(data => {
    let player = data.sender;
    let prefix = new WorldDatabase('prefix').get() ?? '!'
    let msg = data.message;
    let args = msg.slice(prefix.length).split(' ')
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
            case 'test':
                system.run(() => actionTest(player))
                break;
            case 'test2':
                actionTest(player)
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

/**
 * 
 * @param {Player} player 
 */
function actionTest(player) {
    let form = new ActionFormData()
    .title('Title Test')
    .body('Body Test')
    .header('Header Test')
    .button('Button 1 Test')
    .divider()
    .button('Button 2 Test')
    .label('Label Test')
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return;
        if (r.selection == 0) return player.sendMessage('Button 1 Test')
        if (r.selection == 1) return player.sendMessage('Button 2 Test')
    })
}