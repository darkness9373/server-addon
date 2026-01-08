import { world, system } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';
import OpenUI from '../extension/OpenUI';
import { WorldDatabase, PlayerDatabase } from '../extension/Database.js';


export function addRank(player) {
    const listRank = [ 'Rookie', 'Fighter', 'Elite', 'Veteran', 'Legend' ]
    const form = new ModalFormData()
    form.title('Add Rank')
    form.textField('Player Name', player.nameTag)
    form.dropdown('Select Rank:', listRank)
    form.submitButton('Add')
    OpenUI.force(player, form).then(async r => {
        if (r.canceled) return;
        const [name, down] = r.formValues;
        const wProp = new WorldDatabase('AddRank')
        let js = JSON.parse(wProp.get()) || []
        let add = {
            name: name,
            rank: listRank[down]
        }
        js.push(add)
        wProp.set(JSON.stringify(js))
        player.sendMessage(`Menambahkan rank ${add.rank} kepada ${add.name} sedang diproses!`)
    })
}

function Rookie(player) {
    let rank = new PlayerDatabase('Rank', player)
    let listRank = new PlayerDatabase('AllRank', player)
}

const reward = {
    Rookie: {
        items: [
            {
                id: ''
            }
        ],
        coins: 750,
        level: 1
    },
    Fighter: {
        items: [
            {
                id: ''
            }
        ],
        coins: 900,
        level: 2
    },
    Elite: {
        items: [
            {
                id: ''
            }
        ],
        coins: 1250,
        level: 3
    },
    Veteran: {
        items: [
            {
                id: ''
            }
        ],
        coins: 1750,
        level: 4
    },
    Legend: {
        items: [
            {
                id: ''
            }
        ],
        coins: 2000,
        level: 5
    }
}