import { WorldDatabase } from "../extension/Database"

export const dataId = {
    warpGlobal: new WorldDatabase('Warp'),
    chatPrefix: new WorldDatabase('Prefix'),
    types: {
        warp: 'Warp',
        nametag: 'NameTag'
    },
    price: {
        nametag: 100
    }
}