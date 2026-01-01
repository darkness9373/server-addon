import { World, Player, ItemStack, EntityComponentTypes } from "@minecraft/server";
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'
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
            'Custom',
            'Custom Slim'
        ]
    )
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return;
        const [name, tagInput, typeIndex] = r.formValues;
        const entityType = [
            'minecraft:npc',
            'npc:npc_custom_addtion_1',
            'npc:npc_custom_slim_addtion_1'
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
            return;
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
        const item = new ItemStack('minecraft:' + id, amount)
        player.getComponent(EntityComponentTypes.Inventory).container.addItem(item)
        player.sendMessage(`[Successfull]\nKamu berhasil membeli ${amount} ${Extra.formatName(id)} dengan harga ${totalPrice} Coins.`)
    })
}





const itemListBuy = [
    {
        id: 'diamond',
        price: 40,
        texture: 'diamond'
    },
    {
        id: 'netherite',
        price: 75,
        texture: 'netherite'
    },
    {
        id: 'nether_star',
        price: 450,
        texture: 'nether_star'
    }
]