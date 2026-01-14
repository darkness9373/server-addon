import { world, Player, ItemStack, EntityComponentTypes, ItemComponentTypes, system } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData } from '@minecraft/server-ui'
import OpenUI from '../extension/OpenUI'
import Score from "../extension/Score";
import Extra from "../extension/Extra";
import { text } from '../config/text';


system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const inv = player.getComponent("inventory").container;
        const mainSlot = player.selectedSlotIndex;
        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (!item || !item.getLore) continue;
            const lore = item.getLore();
            if (!lore || lore[0] !== "§0[ENCHANT]") continue;
            const [id, lvl] = lore[1].replace("§7", "").split(" ");
            if (i === mainSlot) {
                system.runTimeout(() => {
                    try {
                        player.runCommand(`enchant @s ${id} ${lvl}`)
                    } catch (err) {
                        player.sendMessage(text(`Gagal apply enchant ${id}`).System.fail)
                        return
                    }
                    const itm = inv.getItem(mainSlot);
                    if (!itm) return;
                    itm.setLore([]);
                    inv.setItem(mainSlot, itm);
                }, 1);
                break;
            }
            const oldMain = inv.getItem(mainSlot);
            inv.setItem(mainSlot, item);
            inv.setItem(i, oldMain);
            system.runTimeout(() => {
                try {
                    player.runCommand(`enchant @s ${id} ${lvl}`)
                } catch (err) {
                    player.sendMessage(text(`Gagal apply enchant ${id}`).System.fail)
                    return
                }
                const enchanted = inv.getItem(mainSlot);
                if (!enchanted) return;
                enchanted.setLore([]);
                inv.setItem(i, enchanted);
                inv.setItem(mainSlot, oldMain);
            }, 1);
            break;
        }
    }
}, 20);


/**
 * 
 * @param {Player} player 
 */
export function summonNpc(player) {
    let form = new ModalFormData()
    form.title('Summon NPC')
    form.textField('Nama NPC', 'Shop')
    form.textField('Tag NPC (pisahkan dengan koma dan tanpa spasi)', 'sell,buy,shop')
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
        player.sendMessage(text('Gagal spawn NPC!').System.fail)
    }
    
    if (name.trim()) {
        npc.nameTag = name;
    }
    
    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean)
    for (const tag of tags) {
        npc.addTag(tag)
    }
    
    player.sendMessage(text(`NPC Berhasil dibuat!\nType: ${type}\nTag: ${tags.join(', ')}`).System.succ)
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
    let form = new ActionFormData()
    form.title('Buy Items')
    form.body(`Player: ${player.nameTag}\nCoins: ${coin}\n\nPilih category item yang ingin kamu beli:`)
    const categories = Object.keys(itemListBuy)
    for (const category of categories) {
        form.button(category)
    }
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return
        const selectCategory = categories[r.selection]
        openBuyItem(player, selectCategory)
    })
}


function openBuyItem(player, category) {
    const coin = Score.get(player, 'money')
    const items = itemListBuy[category]
    const form = new ActionFormData()
        .title(category)
        .body(`Coins: ${coin}\n\nPilih item yang ingin kamu beli.`)
    if (category === 'Enchant') {
        for (const item of items) {
            form.button(`${item.name}\n${item.price} Coins`, item.tex)
        }
    } else {
        for (const item of items) {
            form.button(`${Extra.formatName(item.id)}\n${item.price} Coins`, item.tex)
        }
    }
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return;
        const select = items[r.selection]
        buyItemModal(player, select.id, select.price, category, select.name)
    })
}

/**
 * 
 * @param {Player} player 
 * @param {string} id 
 * @param {number} price 
 */
function buyItemModal(player, id, price, category, name) {
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
            return player.sendMessage(text(`Uang kamu tidak mencukupi untuk melakukan pembelian.`).System.fail)
        }
        const nm = name ? name : '';
        buyItemsConfirm(player, id, totalPrice, amount, category, nm)
    })
}

/**
 * 
 * @param {Player} player 
 * @param {string} id 
 * @param {number} price 
 */
function buyItemsConfirm(player, id, price, amount, category, name) {
    let form = new MessageFormData()
    form.title('Confirmation')
    form.body(`Apakah kamu yakin ingin melakukan pembayaran?\n\nItem: ${Extra.formatName(id)}\nJumlah: ${amount}\nTotal Harga: ${price}`)
    form.button2('Cancel')
    form.button1('Confirm Payment')
    OpenUI.force(player, form).then(async r => {
        if (r.canceled || r.selection === 1) return player.sendMessage(text('Pembayaran telah dibatalkan').System.fail)
        if (r.selection === 0) {
            let coin = Score.get(player, 'money')
            if (coin >= price) {
                if (category === 'Enchant') {
                    try {
                        const items = itemListBuy[category]
                        for (const item of items) {
                            if (item.name === name) {
                                const itm = new ItemStack(normalizeId(id), amount)
                                itm.setLore([
                                    '§0[ENCHANT]',
                                    `§7${item.enchant.id} ${item.enchant.level}`
                                ])
                                const inv = player.getComponent('inventory').container;
                                if (!hasEmptySlot(inv)) {
                                    player.dimension.spawnItem(itm, player.location)
                                    player.sendMessage(text(`Inventory kamu penuh, item akan di-drop ke tanah`).System.warn)
                                    Score.remove(player, 'money', price)
                                    return;
                                }
                                inv.addItem(itm)
                                player.sendMessage(text(`Kamu berhasil membeli ${amount} ${name} dengan harga ${price} Coins`).System.succ)
                                Score.remove(player, 'money', price)
                            }
                        }
                    } catch (e) {
                        throw new Error(e)
                    }
                } else {
                    let item = new ItemStack(normalizeId(id), amount)
                    player.getComponent(EntityComponentTypes.Inventory).container.addItem(item)
                    player.sendMessage(text(`Kamu berhasil membeli ${amount} ${Extra.formatName(id)} dengan harga ${price} Coins.`).System.succ)
                    Score.remove(player, 'money', price)
                }
            }
        }
    })
}

function normalizeId(id) {
    return id.includes(':') ? id : `minecraft:${id}`
}

function hasEmptySlot(container) {
    for (let i = 0; i < container.size; i++) {
        if (!container.getItem(i)) return true;
    }
    return false;
}

function sellItem(player) {
    const coin = Score.get(player, 'money');
    const form = new ActionFormData();
    const actions = [];
    
    form.title('Sell Shop');
    form.body(`Coin: ${coin}\n\nPilih kategori item:`);
    
    for (const category of Object.keys(itemListSell)) {
        form.button(category);
        actions.push(() => openSellCategory(player, category));
    }
    
    OpenUI.force(player, form).then(r => {
        if (r.canceled) return;
        actions[r.selection]?.();
    });
}


function openSellCategory(player, category) {
    const coin = Score.get(player, 'money');
    const form = new ActionFormData();
    const actions = [];
    
    form.title(`Sell → ${category}`);
    form.body(`Coin: ${coin}\n\nPilih item yang ingin dijual:`);
    
    for (const item of itemListSell[category]) {
        const owned = countItem(player, item.id);
        form.button(
            `${Extra.formatName(item.id)}\n§6Harga: ${item.price} | Kamu punya: ${owned}`,
            item.tex
        );
        actions.push(() => sellItemModal(player, item.id, item.price));
    }
    
    OpenUI.force(player, form).then(r => {
        if (r.canceled) return;
        actions[r.selection]?.();
    });
}


function sellItemModal(player, id, price) {
    const owned = countItem(player, id);
    if (owned <= 0) {
        return player.sendMessage(text('Kamu tidak punya item ini.').System.fail);
    }
    
    const form = new ModalFormData();
    form.title('Sell Item');
    form.slider(
        'Berapa jumlah item yang ingin kamu jual?',
        1,
        Math.min(64, owned), { defaultValue: 1 }
    );
    form.submitButton('Sell');
    
    OpenUI.force(player, form).then(r => {
        if (r.canceled) return;
        const amount = r.formValues[0];
        const totalPrice = amount * price;
        
        sellItemConfirm(player, id, amount, totalPrice);
    });
}


function sellItemConfirm(player, id, amount, totalPrice) {
    const form = new MessageFormData();
    form.title('Confirmation');
    form.body(
        `Apakah kamu yakin ingin menjual?\n\n` +
        `Item: ${Extra.formatName(id)}\n` +
        `Jumlah: ${amount}\n` +
        `Total Harga: ${totalPrice} Coin`
    );
    form.button1('Confirm Sell');
    form.button2('Cancel');
    
    OpenUI.force(player, form).then(r => {
        if (r.canceled || r.selection === 1) {
            return player.sendMessage(text('Penjualan dibatalkan.').System.warn);
        }
        
        const owned = countItem(player, id);
        if (owned < amount) {
            return player.sendMessage(text('Item kamu tidak mencukupi.').System.fail);
        }
        
        removeItem(player, id, amount);
        Score.add(player, 'money', totalPrice);
        
        player.sendMessage(
            text(`§aBerhasil menjual ${amount} ${Extra.formatName(id)} ` +
                `dengan harga ${totalPrice} Coin.`).System.succ
        );
    });
}


function countItem(player, id) {
    const inv = player.getComponent(EntityComponentTypes.Inventory).container;
    let total = 0;
    
    for (let i = 0; i < inv.size; i++) {
        const item = inv.getItem(i);
        if (item && matchId(item, id)) {
            total += item.amount;
        }
    }
    return total;
}

function matchId(item, id) {
    return item.typeId === (id.includes(':') ? id : `minecraft:${id}`)
}

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


const itemListBuy = {
    Consumable: [
    {
        id: 'golden_carrot',
        price: 25,
        tex: 'textures/items/carrot_golden'
    },
    {
        id: 'golden_apple',
        price: 80,
        tex: 'textures/items/apple_golden'
    },
    {
        id: 'totem_of_undying',
        price: 220,
        tex: 'textures/items/totem'
    }],
    
    Material: [
    {
        id: 'netherite_scrap',
        price: 180,
        tex: 'textures/items/netherite_scrap'
    }],
    
    Enchant: [
    {
        name: 'Fortune III',
        id: 'enchanted_book',
        price: 200,
        tex: 'textures/items/book_enchanted',
        enchant: {
            id: 'fortune',
            level: 3
        }
    },
    {
        name: 'Sharpness II',
        id: 'enchanted_book',
        price: 120,
        tex: 'textures/items/book_enchanted',
        enchant: {
            id: 'sharpness',
            level: 2
        }
    },
    {
        name: 'Efficiency III',
        id: 'enchanted_book',
        price: 150,
        tex: 'textures/items/book_enchanted',
        enchant: {
            id: 'efficiency',
            level: 3
        }
    },
    {
        name: 'Unbreaking III',
        id: 'enchanted_book',
        price: 170,
        tex: 'textures/items/book_enchanted',
        enchant: {
            id: 'unbreaking',
            level: 3
        }
    },
    {
        name: 'Protection III',
        id: 'enchanted_book',
        price: 160,
        tex: 'textures/items/book_enchanted',
        enchant: {
            id: 'protection',
            level: 3
        }
    }]
}


const itemListSell = {
    Mob_Drop: [
    {
        id: 'rotten_flesh',
        price: 2,
        tex: 'textures/items/rotten_flesh'
    },
    {
        id: 'string',
        price: 5,
        tex: 'textures/items/string'
    },
    {
        id: 'spider_eye',
        price: 6,
        tex: 'textures/items/spider_eye'
    },
    {
        id: 'bone',
        price: 4,
        tex: 'textures/items/bone'
    }],
    
    Material: [
    {
        id: 'cc:pearl',
        price: 12,
        tex: 'textures/cc/animals/items/pearl'
    },
    {
        id: 'copper_ingot',
        price: 6,
        tex: 'textures/items/copper_ingot'
    },
    {
        id: 'iron_ingot',
        price: 10,
        tex: 'textures/items/iron_ingot'
    },
    {
        id: 'gold_ingot',
        price: 12,
        tex: 'textures/items/gold_ingot'
    },
    {
        id: 'amethyst_shard',
        price: 15,
        tex: 'textures/items/amethyst_shard'
    },
    {
        id: 'diamond',
        price: 25,
        tex: 'textures/items/diamond'
    },
    {
        id: 'emerald',
        price: 22,
        tex: 'textures/items/emerald'
    },
    {
        id: 'echo_shard',
        price: 35,
        tex: 'textures/items/echo_shard'
    },
    {
        id: 'nether_star',
        price: 150,
        tex: 'textures/items/nether_star'
    }],
    
    Farming: [
    {
        id: 'wheat',
        price: 3,
        tex: 'textures/items/wheat'
    },
    {
        id: 'carrot',
        price: 2,
        tex: 'textures/items/carrot'
    },
    {
        id: 'sugar_cane',
        price: 3,
        tex: 'textures/items/sugar_cane'
    },
    {
        id: 'cc:corn',
        price: 5,
        tex: 'textures/cc/cooking/items/crops/corn'
    },
    {
        id: 'cc:tomato',
        price: 5,
        tex: 'textures/cc/cooking/items/crops/tomato'
    },
    {
        id: 'cc:banana',
        price: 5,
        tex: 'textures/cc/cooking/items/crops/banana'
    },
    {
        id: 'cc:broccoli',
        price: 5,
        tex: 'textures/cc/cooking/items/crops/broccoli'
    }],
    
    Food: [
    {
        id: 'honey_bottle',
        price: 8,
        tex: 'textures/items/honey_bottle'
    }],
    
    Animal_Drop: [
    {
        id: 'leather',
        price: 4,
        tex: 'textures/items/leather'
    }]
}

/*
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
*/