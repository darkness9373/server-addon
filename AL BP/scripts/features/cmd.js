import { world, system, Player } from '@minecraft/server'
import Score from '../extension/Score'
import { PlayerDatabase } from '../extension/Database'
import { npcShopMenu, summonNpc } from './npc'
import { getData } from '../config/database'
import { warpUI } from './warp'
import { makeRedeem, claimRedeem } from './redeem'
import { addRankForm, setRank } from './rank'
import { healPlayer } from './heal'
import { foodPlayer } from './food'
import { text } from '../config/text'
import { checkpointCommand } from './last';
import { scoreboardSet } from './scoreboard';
import { sendMoney } from './money';
import { tpaCommand, tpAcceptCommand, tpDenyCommand } from './tpa'



system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
    customCommandRegistry.registerCommand(
        {
            name: 'as:add',
            description: 'Add score to objectives',
            permissionLevel: 1,
            optionalParameters: [
                {
                    name: 'objectives',
                    type: 'string'
                },
                {
                    name: 'value',
                    type: 'int'
                }
            ]
        }, (origin, { objective, value }) => {
            const player = origin.sourceEntity
            if (!(player instanceof Player)) return;
            Score.add(player, objective, value)
        }
    )
})




world.beforeEvents.chatSend.subscribe(ev => {
    const player = ev.sender
    const msg = ev.message.trim()
    const prefix = getData(player).chatPrefix.get() ?? '!'

    if (!msg.startsWith(prefix)) return

    ev.cancel = true

    const args = msg.slice(prefix.length).trim().split(/\s+/)
    const cmd = args.shift()?.toLowerCase()

    if (!cmd) return

    switch (cmd) {
        case 'add':
            if (!isAdmin(player)) return noAdmin(player)
            Score.add(player, args[0], Number(args[1]))
            break
        case 'set':
            if (!isAdmin(player)) return noAdmin(player)
            Score.set(player, args[0], Number(args[1]))
            break
        case 'remove':
            if (!isAdmin(player)) return noAdmin(player)
            Score.remove(player, args[0], Number(args[1]))
            break
        case 'get':
            if (!isAdmin(player)) return noAdmin(player)
            player.sendMessage(String(Score.get(player, args[0])))
            break
        case 'shop':
            system.run(() => npcShopMenu(player))
            break
        case 'spawnnpc':
            if (!isAdmin(player)) return noAdmin(player)
            system.run(() => summonNpc(player))
            break
        case 'warp':
            system.run(() => warpUI(player))
            break
        case 'mkredeem':
            if (!isAdmin(player)) return noAdmin(player)
            system.run(() => makeRedeem(player))
            break
        case 'redeem':
            system.run(() => claimRedeem(player))
            break
        case 'addrank':
            if (!isAdmin(player)) return noAdmin(player)
            system.run(() => addRankForm(player))
            break
        case 'heal':
            system.run(() => healPlayer(player))
            break
        case 'food':
            system.run(() => foodPlayer(player))
            break
        case 'setrank':
            system.run(() => {
                setRank(player)
            })
            break
        case 'checkpoint':
            system.run(() => checkpointCommand(player))
            break;
        case 'board':
            system.run(() => scoreboardSet(player))
            break;
        case 'sendcoin':
            system.run(() => sendMoney(player))
            break;
        case 'tpa':
            system.run(() => tpaCommand(player, args))
            break
        case 'tpaccept':
            system.run(() => tpAcceptCommand(player))
            break
        case 'tpadeny':
            system.run(() => tpDenyCommand(player))
            break
        default:
            player.sendMessage(
                text(`Command >${cmd}< tidak terdaftar`).System.fail
            )
            system.run(() => player.playSound('note.bass'))
            break
    }
})

/* ================= HELPER ================= */

function isAdmin(player) {
    return player.hasTag('admin')
}

function noAdmin(player) {
    player.sendMessage(
        text('Menu ini hanya bisa diakses oleh Admin!!').System.warn
    )
}