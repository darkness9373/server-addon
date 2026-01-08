import { world, system, Player } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';
import OpenUI from '../extension/OpenUI';
import { WorldDatabase, PlayerDatabase } from '../extension/Database.js';

/**
 * 
 * @param {Player} player 
 */
export function addRankForm(player) {
    const rn = ['Rookie', 'Fighter', 'Elite', 'Veteran', 'Legend']
    const form = new ModalFormData()
        .title('Add Rank Player')
        .textField('Player Name', 'ex: ' + player.name)
        .dropdown('Select Rank')
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return;
        const playerName = r.formValues[0].trim()
        const rank = rn[r.formValues[1]]
        if (!playerName) return;
        addRankToWorldDB(playerName, rank)
    })
}

function getAddRankDB() {
    return JSON.parse(new WorldDatabase('AddRank').get() ?? '[]')
}
function setAddRankDB(data) {
    new WorldDatabase('AddRank').set(JSON.stringify(data))
}
function addRankToWorldDB(name, rank) {
    const db = getAddRankDB()
    db.push({
        name: name.toLowerCase(),
        rank
    })
    setAddRankDB(db)
}

function getRank(player) {
    return JSON.parse(new PlayerDatabase('RankList', player).get() ?? '[]')
}
function setRank(player, ranks) {
    new PlayerDatabase('RankList', player).set(JSON.stringify(ranks))
}
function setMainRank(player, rank, level) {
    new PlayerDatabase('Rank', player).set(rank)
    new PlayerDatabase('RankLevel', player).set(level)
}

function giveRankReward(player, rank) {
    const cfg = RANK_CONFIG[rank]
}

const RANK_CONFIG = {
    Rookie: {
        items: [
            {
                id: 'backpack:backpack_diamond',
                amount: 1
            }
        ],
        coins: 750,
        level: 1
    },
    Fighter: {
        items: [
            {
                id: 'backpack:backpack_diamond',
                amount: 1
            }
        ],
        coins: 900,
        level: 2
    },
    Elite: {
        items: [
            {
                id: 'backpack:backpack_nether',
                amount: 1
            }
        ],
        coins: 1250,
        level: 3
    },
    Veteran: {
        items: [
            {
                id: 'backpack:backpack_nether',
                amount: 1
            }
        ],
        coins: 1750,
        level: 4
    },
    Legend: {
        items: [
            {
                id: 'backpack:backpack_nether',
                amount: 2
            }
        ],
        coins: 2000,
        level: 5
    }
}