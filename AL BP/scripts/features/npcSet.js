import { world, Player, EntityComponentTypes } from '@minecraft/server'


world.afterEvents.entityHitEntity.subscribe(data => {
    const player = data.damagingEntity;
    const hit = data.hitEntity;
    const inv = player.getComponent(EntityComponentTypes.Inventory).container;
    if (player instanceof Player) {
        if (hit.typeId === 'npc:npc_custom') {
            const hand = inv.getItem(player.selectedSlotIndex)
            if (!hand) return;
            if (hand.typeId !== 'minecraft:stick' || !hit.hasTag('statue')) return;
            const variant = hit.getComponent(EntityComponentTypes.Variant);
            player.sendMessage('Variant: ' + variant.value)
            if (variant.value == 0) return hit.triggerEvent('minecraft:iyan')
            if (variant.value == 1) return hit.triggerEvent('minecraft:dark')
            if (variant.value == 2) return hit.triggerEvent('minecraft:amay')
            if (variant.value == 3) return hit.triggerEvent('minecraft:zone')
        }
    }
})