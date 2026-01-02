import { world, Player, EntityComponentTypes } from '@minecraft/server'


world.afterEvents.entityHitEntity.subscribe(data => {
    const player = data.damagingEntity;
    const hit = data.hitEntity;
    const inv = player.getComponent(EntityComponentTypes.Inventory).container;
    if (player instanceof Player) {
        if (hit.typeId === 'npc:npc_custom') {
            if (inv.getItem(player.selectedSlotIndex).typeId === 'minecraft.stick' && inv.getItem(player.selectedSlotIndex).nameTag === 'variant') {
                if (!player.hasTag('admin') || !player.isSneaking) return;
                const variant = hit.getComponent(EntityComponentTypes.Variant)
                if (variant.value == 0) hit.triggerEvent('iyan')
                if (variant.value == 1) hit.triggerEvent('dark')
                if (variant.value == 2) hit.triggerEvent('amay')
                if (variant.value == 3) hit.triggerEvent('zone')
            }
        }
    }
})