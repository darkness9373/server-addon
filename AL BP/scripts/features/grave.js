import { world, BlockPermutation, ItemStack, Player } from "@minecraft/server";
import { text } from '../config/text'

world.beforeEvents.playerBreakBlock.subscribe(async data => {
    const player = data.player;
    const block = data.block;
    if (block.typeId === 'drk:gravestone_player') {
        await null;
        let entities = player.dimension.getEntities({
            location: block.location,
            type: 'drk:gravestone_item_container',
            maxDistance: 1
        })
        entities.forEach(entity => {
            entity.kill()
        })
    }
})

world.afterEvents.entityDie.subscribe(data => {
    const player = data.deadEntity;
    if (!(player instanceof Player)) return;
    let playerName = player.nameTag
    let loc = player.location
    let locX = Math.floor(loc.x)
    let locy = Math.floor(loc.y)
    let locz = Math.floor(loc.z)

    let playerInv = player.getComponent('inventory').container
    let graveStoneBlock = BlockPermutation.resolve('drk:gravestone_player')
    let graveStoneEntity = player.dimension.spawnEntity('drk:gravestone_item_container', {x: locX + 0.5, y: locy, z: locz + 0.5})
    let graveStoneInv = graveStoneEntity.getComponent('inventory').container
    let getBlock = player.dimension.getBlock(loc)
    let getNearby = player.dimension.getEntities({ location: loc, type: 'minecraft:item', maxDistance: 3 })
    player.sendMessage(text(`Kamu mati di ${locx} ${locy} ${locz}`).System.fail)
    getBlock.setPermutation(graveStoneBlock)
    graveStoneEntity.nameTag = `${playerName}`

    for (const item of getNearby) {
        if (graveStoneInv.emptySlotsCount <= 0) {
            break;
        }
        let itemStack = item.getComponent('item').itemStack;
        graveStoneInv.addItem(itemStack)
        item.remove()
    }
})