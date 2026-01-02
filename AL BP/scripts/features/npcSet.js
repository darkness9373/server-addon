import { world, Player, EntityComponentTypes } from '@minecraft/server'
import Score from '../extension/Score';


world.afterEvents.entityHitEntity.subscribe(data => {
    const player = data.damagingEntity;
    const hit = data.hitEntity;
    const inv = player.getComponent(EntityComponentTypes.Inventory).container;
    if (player instanceof Player) {
        if (hit.typeId === 'npc:npc_custom') {
            const hand = inv.getItem(player.selectedSlotIndex)
            if (!hand) return;
            if (!player.hasTag('admin')) return;
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
                    let size = Score.get(hit, 'size') ?? 0
                    switch (size) {
                        case 0:
                            hit.triggerEvent('minecraft:statue');
                            Score.set(hit, 'size', 1);
                            break;
                        case 1:
                            hit.triggerEvent('minecraft:normal');
                            Score.set(hit, 'size', 0)
                            break;
                        default:
                            break;
                    }
                } else if (hand.nameTag === 'look') {
                    let look = Score.get(hit, 'look') ?? 0
                    switch (look) {
                        case 0:
                            hit.triggerEvent('minecraft:can_look');
                            Score.set(hit, 'look', 1);
                            break;
                        case 1:
                            hit.triggerEvent('minecraft:no_look');
                            Score.set(hit, 'look', 0)
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }
})