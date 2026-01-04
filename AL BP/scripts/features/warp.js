import { world, Player, world } from "@minecraft/server";
import { WorldDatabase, PlayerDatabase } from "../extension/Database";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import OpenUI from "../extension/OpenUI";
import { dataId } from "../config/database";

/**
 * @typedef {import("@minecraft/server").Vector3} Vector3
 */


/**
 * 
 * @param {Player} player 
 */
export function warpUI(player) {
    let globalData = dataId.warpGlobal
    let rawStr = globalData.get() ?? '[]'
    let jsData = JSON.parse(rawStr)
    let func = []
    const warp = new ActionFormData()
    warp.title('Warp Menu')
    warp.body('')
    if (rawStr !== '[]') {
        for (let i of jsData) {
            warp.button(`${i.name}\n${i.pos.x} ${i.pos.y} ${i.pos.z}`)
            func.push(() => {
                runTeleport(player, i.name, i.dimension, {})
            })
        }
    }
    if (player.hasTag('admin')) {
        warp.button('Add Global Warp')
        if (rawStr !== '[]') {
            warp.button('Remove Global Warp')
        }
    }
    warp.divider()
    {
        warp.button('Add Warp')
    }
    OpenUI.force(player, warp).then(async r => {
        if (r.canceled) return;
        func[r.selection]()
    })
}

/**
 * 
 * @param {Player} player 
 * @param {string} name 
 * @param {Vector3} pos 
 */
function globalAddWarp(player) {
    const form = new ModalFormData()
    form.title('Add Global Warp')
    form.textField('Warp Name', 'Lobby')
    form.toggle('Input coordinate / use player live location', { defaultValue: true })
    form.textField('Input Coordinate', '103 21 -428')
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return;
        let globalData = dataId.warpGlobal;
        let rawStr = globalData.get() ?? '[]'
        let js = JSON.parse(rawStr)
        const [name, toggle, pos] = r.formValues;
        let ps = pos.trim().split(/\s+/).map(Number)
        let add;
        if (toggle == false) {
            add = {
                name: name,
                pos: {
                    x: ps[0],
                    y: ps[1],
                    z: ps[2]
                },
                dimension: player.dimension.id
            }
        } else {
            add = {
                name: name,
                pos: {
                    x: Math.floor(player.location.x),
                    y: Math.floor(player.location.y),
                    z: Math.floor(player.location.z)
                },
                dimension: player.dimension.id
            }
        }
        js.push(add)
        globalData.set(JSON.stringify(js))
    })
}

/**
 * 
 * @param {Player} player 
 * @param {string} name
 * @param {string} dim 
 * @param {Vector3} pos 
 */
function runTeleport(player, name, dim, pos) {
    const x = pos.x;
    const y = pos.y;
    const z = pos.z;

    try {
        player.tryTeleport(
            {
                x: x,
                y: y,
                z: z
            },
            {
                dimension: world.getDimension(dim)
            }
        )
        player.sendMessage('Berhasil melakukan teleportasi menuju ' + name + '!!')
    } catch (err) {
        player.sendMessage('Error saat melakukan teleportasi:\n\n' + err)
    }
}