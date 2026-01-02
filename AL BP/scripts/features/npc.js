import { World, Player, ItemStack, EntityComponentTypes } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData } from '@minecraft/server-ui'
import OpenUI from '../extension/OpenUI'
import Score from "../extension/Score";
import Extra from "../extension/Extra";



/**
 * 
 * @param {Player} player 
 */
export function summonNpc(player) {
    let form = new ModalFormData()
    form.title('Summon NPC')
    form.textField('Nama NPC', 'Shop')
    form.textField('Tag NPC (pisahkan dengan koma dan tanpa spasi', 'sell,buy,shop')
    form.dropdown(
        'Jenis NPC',
        [
            'Normal',
            'Custom'
        ]
    )
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return;
        const [name, tagInput, typeIndex] = r.formValues;
        const entityType = [
            'minecraft:npc',
            'npc:npc_custom'
        ][typeIndex]
        spawnNPC(player, entityType, name, tagInput)
    })
}

/**
 * 
 * @param {Player} player 
 * @param {string} type 
 * @param {string} name 
 * @param {string} tagInput 
 */
function spawnNPC(player, type, name, tagInput) {
    const npc = player.dimension.spawnEntity(
        type,
        player.location
    )
    if (!npc) {
        player.sendMessage('Gagal spawn NPC!')
    }

    if (name.trim()) {
        npc.nameTag = name;
    }

    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean)
    for (const tag of tags) {
        npc.addTag(tag)
    }

    player.sendMessage(`NPC Berhasil dibuat!\nType: ${type}\nTag: ${tags.join(', ')}`)
}


/**
 * 
 * @param {Player} player 
 */
export function npcShopMenu(player) {
    let coin = Score.get(player, 'money')
    let func = []
    let form = new ActionFormData()
    form.title('Ancient Store')
    form.body(`Player: ${player.nameTag}\nCoin: ${coin}\n\nSelamat datang di Ancient Store!\nPilih kategori item yang ingin kamu beli.`)
    {
        form.button('Buy Items', 'textures/items/gold_ingot')
        func.push(() => {
            return buyItem(player)
        })
    }
    {
        form.button('Sell Items', 'textures/items/paper')
        func.push(() => {
            return sellItem(player)
        })
    }
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return
        func[r.selection]()
    })
}

/**
 * 
 * @param {Player} player 
 */
function buyItem(player) {
    let coin = Score.get(player, 'money')
    let func = []
    let form = new ActionFormData()
    form.title('Buy Items')
    form.body(`Player: ${player.nameTag}\nCoins: ${coin}\n\nPilih item yang ingin kamu beli:`)
    for (let i of itemListBuy) {
        form.button(Extra.formatName(i.id) + `\n(${i.price})`, `textures/items/${i.texture}`)
        func.push(() => {
            buyItemModal(player, i.id, i.price)
        })
    }
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return
        func[r.selection]()
    })
}

/**
 * 
 * @param {Player} player 
 * @param {string} id 
 * @param {number} price 
 */
function buyItemModal(player, id, price) {
    let coin = Score.get(player, 'money')
    let form = new ModalFormData()
    form.title('Buy Items')
    form.slider(`Berapa jumlah item yang ingin kamu beli?`, 1, 64, { defaultValue: 1 })
    form.submitButton('Buy')
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return;
        const amount = r.formValues[0]
        const totalPrice = amount * price
        if (coin < totalPrice) {
            return player.sendMessage(`[Failed]\nUang kamu tidak mencukupi untuk melakukan pembelian.`)
        }
        buyItemsConfirm(player, id, totalPrice, amount)
    })
}

/**
 * 
 * @param {Player} player 
 * @param {string} id 
 * @param {number} price 
 */
function buyItemsConfirm(player, id, price, amount) {
    let form = new MessageFormData()
    form.title('Confirmation')
    form.body(`Apakah kamu yakin ingin melakukan pembayaran?\n\nItem: ${Extra.formatName(id)}\nJumlah: ${amount}\nTotal Harga: ${price}`)
    form.button2('Cancel')
    form.button1('Confirm Payment')
    OpenUI.force(player, form).then(async r => {
        if (r.canceled || r.selection === 1) return player.sendMessage('Pembayaran telah dibatalkan')
        if (r.selection === 0) {
            let coin = Score.get(player, 'money')
            if (coin >= price) {
                let item = new ItemStack('minecraft:' + id, amount)
                player.getComponent(EntityComponentTypes.Inventory).container.addItem(item)
                player.sendMessage(`[Successfull]\nKamu berhasil membeli ${amount} ${Extra.formatName(id)} dengan harga ${price} Coins.`)
                Score.remove(player, 'money', price)
            }
        }
    })
}


/**
 * 
 * @param {Player} player 
 */
function sellItem(player) {
    let coin = Score.get(player, 'money')
    let func = []
    const form = new ActionFormData()
    form.title('Sell Items')
    form.body(`Coin: ${coin}\n\nPilih item yang ingin kamu jual:`)
    for (let i of itemListSell) {
        form.button(Extra.formatName(i.id) + `\n(${i.price}) Coin`, 'textures/items/' + i.texture)
        func.push(() => {
            sellItemModal(player, i.id, i.price)
        })
    }
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return;
        func[r.selection]()
    })
}

/**
 * 
 * @param {Player} player 
 * @param {string} id 
 * @param {number} price 
 */
function sellItemModal(player, id, price) {
    const form = new ModalFormData()
    form.title('Sell Items')
    form.slider('Berapa jumlah item yang ingin kamu jual?', 1, 64, { defaultValue: 1 })
    form.submitButton('Sell')
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return;
        const amount = r.formValues[0]
        let totalCoin = amount * price
        let itemGet = countItem(player, id)
        if (itemGet < amount) return player.sendMessage('[Failed]\nItem yang kamu miliki tidak mencukupi.');
        sellItemConfirm(player, id, amount, totalCoin)
    })
}

/**
 * 
 * @param {Player} player 
 * @param {string} id 
 * @param {number} amount 
 * @param {number} price 
 */
function sellItemConfirm(player, id, amount, price) {
    const form = new MessageFormData()
    form.title('Confirmation')
    form.body(`Apakah kamu yakin ingin menjual?\n\nItem: ${Extra.formatName(id)}\nJumlah: ${amount}\nTotal Harga: ${price}`)
    form.button2('Cancel')
    form.button1('Confirm Sell')
    OpenUI.force(player, form).then(async r => {
        if (r.canceled || r.selection === 1) return player.sendMessage('Penjualan telah dibatalkan.');
        if (r.selection === 0) {
            const itemGet = countItem(player, id);
            if (itemGet < amount) return player.sendMessage('[Failed]\nItem yang kamu miliki tidak mencukupi.');
            Score.add(player, 'money', price)
            removeItem(player, id, amount)
            player.sendMessage(`[Successfull]\nBerhasil menjual ${amount} ${Extra.formatName(id)} dengan harga ${price} Coin.`)
        }
    })
}

/**
 * 
 * @param {Player} player 
 * @param {string} id 
 */
function countItem(player, id) {
    const inv = player.getComponent(EntityComponentTypes.Inventory).container
    let total = 0

    for (let i = 0; i < inv.size; i++) {
        const item = inv.getItem(i)
        if (item && item.typeId === 'minecraft:' + id) {
            total += item.amount
        }
    }
    return total;
}

/**
 * 
 * @param {Player} player 
 * @param {string} id 
 * @param {number} amount 
 */
function removeItem(player, id, amount) {
    const inv = player.getComponent(EntityComponentTypes.Inventory).container;
    let remaining = amount;

    for (let i = 0; i < inv.size && remaining > 0; i++) {
        const item = inv.getItem(i);
        if (!item || item.typeId !== 'minecraft:' + id) continue;
        if (item.amount <= remaining) {
            remaining -= item.amount;
            inv.setItem(i, null);
        } else {
            item.amount -= remaining;
            inv.setItem(i, item);
            remaining = 0;
        }
    }
}



const itemListBuy = [
    {
        id: 'diamond',
        price: 40,
        texture: 'diamond'
    },
    {
        id: 'netherite_ingot',
        price: 75,
        texture: 'netherite_ingot'
    },
    {
        id: 'nether_star',
        price: 450,
        texture: 'nether_star'
    }
]

const itemListSell = [
    {
        id: 'rotten_flesh',
        price: 4,
        texture: 'rotten_flesh'
    },
    {
        id: 'string',
        price: 5,
        texture: 'string'
    },
    {
        id: 'spider_eye',
        price: 7,
        texture: 'spider_eye'
    },
    {
        id: 'bone',
        price: 6,
        texture: 'bone'
    },
    {
        id: 'ender_pearl',
        price: 12,
        texture: 'ender_pearl'
    }
]