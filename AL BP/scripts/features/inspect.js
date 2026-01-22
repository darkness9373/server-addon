import { Player, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import OpenUI from "../extension/OpenUI";

/**
 * 
 * @param {Player} player 
 */
export function inspectPlayer(player) {
    const players = world.getAllPlayers()
    const names = players.map(p => p.name)

    if (names.length <= 1) {
        return player.sendMessage(
            text('Tidak ada player lain yang online').System.fail
        )
    }
    const form = new ModalFormData()
        .title('Inspect Player')
        .dropdown('Select Players', names)
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return
    })
}