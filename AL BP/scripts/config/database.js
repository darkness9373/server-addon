import { WorldDatabase, PlayerDatabase } from "../extension/Database"


export function getData(player) {
    return {
        warpGlobal: new WorldDatabase('Warp'),
        warpPrivate: new PlayerDatabase('Warp', player),
        chatPrefix: new WorldDatabase('Prefix'),
        rank: new PlayerDatabase('Rank', player),
        rankLevel: new PlayerDatabase('RankLevel', player),
        rankList: new PlayerDatabase('RankList', player),
        price: {
            nametag: 100
        }
    }
}