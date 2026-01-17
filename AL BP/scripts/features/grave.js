import { world, BlockPermutation, ItemStack, Player } from "@minecraft/server";
import { text } from '../config/text'
import Extra from '../extension/Extra'

const GRAVESTONE_ENTITY = 'drk:gravestone_item'
const GRAVESTONE_BLOCK = 'drk:gravestone_block'

world.beforeEvents.playerBreakBlock.subscribe(async data => {
    const player = data.player;
    const block = data.block
    if (block.typeId !== GRAVESTONE_BLOCK) return;
    await null;
    
    const entities = player.dimension.getEntities({
        location: block.location,
        type: GRAVESTONE_ENTITY,
        maxDistance: 1
    })
    
    if (entities.length === 0) return
    
    const grave = entities[0]
    const ownerTag = `owner:${player.id}`
    
    if (!grave.hasTag(ownerTag)) {
        data.cancel = true
        player.sendMessage(
            text('Ini bukan gravestone milikmu!').System.fail
        )
        return
    }
    
    grave.kill()
})

world.beforeEvents.playerInteractWithBlock.subscribe(async data => {
    const player = data.player;
    const block = data.block;
    const dim = player.dimension
    if (block.typeId !== GRAVESTONE_BLOCK) return;
    await null;

    const grave = dim.getEntities({
        type: GRAVESTONE_ENTITY,
        location: block.location,
        maxDistance: 1
    })[0]
    const ownerTag = 'owner:' + player.id

    if (!grave.hasTag(ownerTag)) {
        data.cancel = true
        player.sendMessage(
            text('Ini bukan gravestone milikmu!').System.fail
        )
        return
    }

    const graveInv = grave.getComponent('inventory').container;
    const playerInv = player.getComponent('inventory').container;

    for (let i = 0; i < graveInv.size; i++) {
        const item = graveInv.getItem(i)
        if (item) playerInv.addItem(item)
    }
})

world.afterEvents.entityDie.subscribe(data => {
    const player = data.deadEntity;
    const dim = player.dimension;
    const pos = player.location;
    
    const block = dim.getBlock(pos)
    
    const grave = dim.spawnEntity(GRAVESTONE_ENTITY, {
        x: pos.x + 0.5,
        y: pos.y,
        z: pos.z + 0.5
    })
    const graveInv = grave.getComponent('inventory').container;
    const near = dim.getEntities({
        location: pos,
        type: 'minecraft:item',
        maxDistance: 3
    })
    player.sendMessage(text(`Kamu mati di §e${pos.x} ${pos.y} ${pos.z}`).System.fail)
    block.setPermutation(BlockPermutation.resolve(GRAVESTONE_BLOCK))
    grave.nameTag = `${player.name}`
    grave.addTag('owner:' + player.id)
    for (const item of near) {
        if (graveInv.emptySlotsCount <= 0) {
            break;
        }
        let itemStack = item.getComponent('item').itemStack;
        graveInv.addItem(itemStack)
        item.remove()
    }
})