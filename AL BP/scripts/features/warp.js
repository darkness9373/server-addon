import { world, Player } from "@minecraft/server";
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
    for (let i of jsData) {
        warp.button(`${i.name}\n${i.pos.x} ${i.pos.y} ${i.pos.z}`)
        func.push(() => {
            runTeleport(player, i.name, i.dimension, { x: i.pos.x, y: i.pos.y, z: i.pos.z })
        })
    }
    if (player.hasTag('admin')) {
        warp.button('Add Global Warp')
        func.push(() => {
            globalAddWarp(player)
        })
        if (rawStr !== '[]') {
            warp.button('Remove Global Warp')
            func.push(() => {
                globalRemoveWarp(player)
            })
        }
    }
    warp.divider()
    const privData = new PlayerDatabase('Warp', player).get() ?? '[]'
    let js = JSON.parse(privData)
    for (let y of js) {
        warp.button(`${y.name}\n${y.pos.x} ${y.pos.y} ${y.pos.z}`)
        func.push(() => {
            runTeleport(player, y.name, y.dimension, { x: y.pos.x, y: y.pos.y, z: y.pos.z })
        })
    }
    {
        warp.button('Add Warp')
        func.push(() => {
            privateAddWarp(player)
        })
        if (privData !== '[]') {
            warp.button('Remove Warp')
            func.push(() => {
                privateRemoveWarp(player)
            })
        }
    }
    OpenUI.force(player, warp).then(async r => {
        if (r.canceled) return;
        func[r.selection]()
    })
}

/**
 * 
 * @param {Player} player
 */
function privateAddWarp(player) {
    let dt = JSON.parse(new PlayerDatabase('Warp', player).get()) || []
    let lvl = new PlayerDatabase('Rank-Level', player).get() ?? 0
    if (lvl === 0) return player.sendMessage(`§r[§aSystem§r] §cMenu ini hanya tersedia untuk rank §6Rookie§c atau lebih tinggi`)
    if (lvl === 1 && dt.length >= 2) return warpLimit(player);
    if (lvl === 2 && dt.length >= 3) return warpLimit(player);
    if (lvl === 3 && dt.length >= 5) return warpLimit(player);
    if (lvl === 4 && dt.length >= 6) return warpLimit(player);
    if (lvl === 5 && dt.length >= 8) return warpLimit(player);
    const form = new ModalFormData()
    form.title('Add Private Warp')
    form.textField('Warp Name', 'House 1')
    form.toggle('Input Location (off) / Use Player Location (on)', { defaultValue: true })
    form.textField('Input Location', '103 21 -428')
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return;
        let privData = new PlayerDatabase('Warp', player)
        let rawStr = privData.get() ?? '[]'
        let js = JSON.parse(rawStr)
        const [name, toggle, pos] = r.formValues;
        let exist = js.some(ex => ex.name === name)
        if (exist === true) return player.sendMessage('Nama Warp tidak boleh sama dengan yang sudah ada!')
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
        privData.set(JSON.stringify(js))
        player.sendMessage(`§aBerhasil menambahkan §g${name} §ake dalam Private Warp`)
    })
}

function warpLimit(player) {
    player.sendMessage(`§r[§aSystem§r]\n§cLimit warp untuk rank kamu saat ini sudah tercapai`)
}

function privateRemoveWarp(player) {
    const privData = new PlayerDatabase('Warp', player)
    let raw = privData.get() ?? '[]'
    let js = JSON.parse(raw)
    let func = []
    const form = new ActionFormData()
    form.title('Remove Private Warp')
    form.body('Pilih warp yang ingin kamu hapus')
    for (let x of js) {
        form.button(`${x.name}\n${x.pos.x} ${x.pos.y} ${x.pos.z}`)
        func.push(() => {
            let index = js.findIndex(wrp => wrp.name === x.name)
            if (index === -1) return;
            js.splice(index, 1)
            privData.set(JSON.stringify(js))
            player.sendMessage(`§aBerhasil menghapus §g${x.name} §adari daftar Private Warp`)
        })
    }
    form.button('Close')
    func.push(() => {
        return;
    })
    OpenUI.force(player, form).then(async r => {
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
    form.toggle('Input Location (off) / Use Player Location (on)', { defaultValue: true })
    form.textField('Input Coordinate', '103 21 -428')
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return;
        let globalData = dataId.warpGlobal;
        let rawStr = globalData.get() ?? '[]'
        let js = JSON.parse(rawStr)
        const [name, toggle, pos] = r.formValues;
        let exist = js.some(ex => ex.name === name)
        if (exist === true) return player.sendMessage('Nama Warp tidak boleh sama dengan yang sudah ada!')
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
        player.sendMessage(`§aBerhasil menambahkan §g${name} §ake dalam Global Warp`)
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
        })
        player.sendMessage('§aBerhasil melakukan teleportasi menuju §g' + name + '§a!!')
    } catch (err) {
        player.sendMessage('Error saat melakukan teleportasi:\n\n' + err)
    }
}

function globalRemoveWarp(player) {
    const globalData = dataId.warpGlobal
    let raw = globalData.get() ?? '[]'
    let js = JSON.parse(raw)
    let func = []
    const form = new ActionFormData()
    form.title('Remove Global Warp')
    form.body('Pilih warp yang ingin kamu hapus')
    for (let x of js) {
        form.button(`${x.name}\n${x.pos.x} ${x.pos.y} ${x.pos.z}`)
        func.push(() => {
            let index = js.findIndex(wrp => wrp.name === x.name)
            if (index === -1) return;
            js.splice(index, 1)
            globalData.set(JSON.stringify(js))
            player.sendMessage(`§aBerhasil menghapus §g${x.name} §adari daftar Global Warp`)
        })
    }
    form.button('Close')
    func.push(() => {
        return;
    })
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return;
        func[r.selection]()
    })
}