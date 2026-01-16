import { world, BlockPermutation, Player } from "@minecraft/server";
import { text } from "../config/text";

world.afterEvents.entityDie.subscribe(data => {
    const player = data.deadEntity;
    if (!(player instanceof Player)) return;
    const dim = player.dimension;
    const loc = player.location;
    const locx = Math.floor(loc.x)
    const locy = Math.floor(loc.y)
    const locz = Math.floor(loc.z)

    const block = dim.getBlock(loc)
    block.setPermutation(BlockPermutation.resolve('drk:gravestone'))

    const grave = dim.spawnEntity(
        'drk:gravestone_con',
        {
            x: locx,
            y: locy,
            z: locz
        }
    )

    grave.nameTag = `Grave of ${player.name}`
    grave.addTag(`owner:${player.name}`)

    const items = dim.getEntities({
        type: 'minecraft:item',
        location: loc,
        maxDistance: 3
    })
})