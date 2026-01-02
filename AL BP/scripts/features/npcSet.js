import { world, Player, EntityComponentTypes } from '@minecraft/server'


world.afterEvents.entityHitEntity.subscribe(data => {
    const player = data.damagingEntity;
    const hit = data.hitEntity;
    const inv = player.getComponent(EntityComponentTypes.Inventory).container;
    if (player instanceof Player) {
        if (hit.typeId === 'npc:npc_custom') {
            const hand = inv.getItem(player.selectedSlotIndex)
            if (!hand) return;
            if (!player.hasTag('admin'))
            if (hand.typeId === 'minecraft:stick') {
                if (hand.nameTag === 'variant') {
                    const variant = hit.getComponent(EntityComponentTypes.Variant);
                    switch (variant.value) {
                        case 0:
                            hit.triggerEvent('minecraft:iyan')
                            break;
                        case 1:
                            hit.triggerEvent('minecraft:dark')
                            break;
                        case 2:
                            hit.triggerEvent('minecraft:amay')
                            break;
                        case 3:
                            hit.triggerEvent('minecraft:zone')
                            break;
                        default:
                            break;
                    }
                } else if (hand.nameTag === 'size') {
                    let val = 0
                    switch (val) {
                        case 0:
                            hit.triggerEvent('minecraft:statue')
                            val = 1
                            break;
                        case 1:
                            hit.triggerEvent('minecraft:normal')
                            val = 0
                            break;
                        default:
                            break;
                    }
                } else if (hand.nameTag === 'look') {
                    let val = 0
                    switch (val) {
                        case 0:
                            hit.triggerEvent('minecraft:can_look')
                            val = 1
                            break;
                        case 1:
                            hit.triggerEvent('minecraft:no_look')
                            val = 0
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }
})