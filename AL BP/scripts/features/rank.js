import { world, system, Player, ItemStack } from '@minecraft/server'
import { ModalFormData } from '@minecraft/server-ui'
import OpenUI from '../extension/OpenUI'
import { WorldDatabase, PlayerDatabase } from '../extension/Database.js'
import Score from '../extension/Score.js'
import { getData } from '../config/database'
import { text } from '../config/text'

/* =========================
   SET RANK (PILIH RANK)
========================= */
export function setRank(player) {
    const listRaw = getData(player).rankList.get() ?? '[]'
    const rankList = JSON.parse(listRaw)
    
    if (!rankList.length) {
        return player.sendMessage(
            text('Kamu belum memiliki rank selain Newbie').System.fail
        )
    }
    
    const form = new ModalFormData()
        .title('Set Your Rank')
        .dropdown('Pilih rank yang kamu miliki:', rankList)
    
    OpenUI.force(player, form).then(r => {
        if (r.canceled) return
        
        const selectedRank = rankList[r.formValues[0]]
        const config = RANK_CONFIG[selectedRank]
        if (!config) return
        
        getData(player).rank.set(selectedRank)
        getData(player).rankLevel.set(config.level)
        
        player.sendMessage(
            text(`Berhasil mengganti rank ke ${selectedRank}`).System.succ
        )
    })
}

/* =========================
   ADD RANK FORM (ADMIN)
========================= */
export function addRankForm(player) {
    const rankNames = Object.keys(RANK_CONFIG)
    
    const form = new ModalFormData()
        .title('Add Rank Player')
        .textField('Player Name', 'ex: Steve')
        .dropdown('Select Rank', rankNames)
    
    OpenUI.force(player, form).then(r => {
        if (r.canceled) return
        
        const playerName = r.formValues[0]?.trim()
        const rank = rankNames[r.formValues[1]]
        
        if (!playerName) {
            return player.sendMessage(
                text('Nama player tidak valid').System.fail
            )
        }
        
        const db = new WorldDatabase('AddRank')
        const queue = JSON.parse(db.get() ?? '[]')
        
        queue.push({ name: playerName, rank })
        db.set(JSON.stringify(queue))
        
        player.sendMessage(
            text(
                `Penambahan rank diproses:\n§7Name: §b${playerName}\n§7Rank: §6${rank}`
            ).System.succ
        )
    })
}

/* =========================
   PROCESS ADD RANK (QUEUE)
========================= */
system.runInterval(() => {
    const addDB = new WorldDatabase('AddRank')
    const queue = JSON.parse(addDB.get() ?? '[]')
    if (!queue.length) return
    
    for (const player of world.getPlayers()) {
        const index = queue.findIndex(q => q.name === player.name)
        if (index === -1) continue
        
        const { rank } = queue[index]
        const ownedDB = new PlayerDatabase('RankList', player)
        const ownedRanks = JSON.parse(ownedDB.get() ?? '[]')
        
        if (ownedRanks.includes(rank)) {
            player.sendMessage(
                text(`Kamu sudah memiliki rank §6${rank}`).System.fail
            )
        } else {
            ownedRanks.push(rank)
            ownedDB.set(JSON.stringify(ownedRanks))
            
            applyRank(player, rank)
            
            player.sendMessage(
                text(`Rank §6${rank} berhasil ditambahkan`).System.succ
            )
        }
        
        queue.splice(index, 1)
        addDB.set(JSON.stringify(queue))
    }
}, 40)

/* =========================
   APPLY RANK
========================= */
function applyRank(player, rank) {
    const config = RANK_CONFIG[rank]
    if (!config) return
    
    getData(player).rank.set(rank)
    getData(player).rankLevel.set(config.level)
    
    new PlayerDatabase('HealCooldown', player).set(0)
    new PlayerDatabase('FoodCooldown', player).set(0)
    
    Score.add(player, 'money', config.coins)
    
    player.sendMessage('§aHeal & Food cooldown di-reset')
    
    if (config.rare) giveRandomItem(player, rareItem)
    if (config.legend) giveRandomItem(player, legendItem)
    
    for (const item of config.items) {
        try {
            player.getComponent('inventory').container.addItem(
                new ItemStack(item.id, item.amount)
            )
        } catch {
            player.sendMessage(
                text(`ID item tidak valid: ${item.id}`).System.fail
            )
        }
    }
}

/* =========================
   GIVE RANDOM ITEM
========================= */
function giveRandomItem(player, list) {
    const value = list[Math.floor(Math.random() * list.length)]
    try {
        player.getComponent('inventory').container.addItem(
            new ItemStack(value, 1)
        )
    } catch {
        player.sendMessage(
            text(`ID item tidak valid: ${value}`).System.fail
        )
    }
}

/* =========================
   CONFIG
========================= */
const RANK_CONFIG = {
    Rookie: {
        level: 1,
        coins: 750,
        items: []
    },
    Fighter: {
        level: 2,
        coins: 900,
        items: []
    },
    Elite: {
        level: 3,
        coins: 1250,
        items: []
    },
    Veteran: {
        level: 4,
        coins: 1750,
        items: [],
        rare: true
    },
    Legend: {
        level: 5,
        coins: 2000,
        items: [],
        legend: true
    }
}

const rareItem = [
    'cc:pharaoh_staff',
    'cc:siren_staff'
]

const legendItem = [
    'cc:stormbreaker',
    'cc:ice_bow',
    'cc:fire_sword',
    'cc:soul_scythe',
    'cc:poison_javelin'
]