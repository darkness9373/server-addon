import { world, EntityComponentTypes, Player } from '@minecraft/server'



world.afterEvents.entityHurt.subscribe(data => {
    const entity = data.hurtEntity;
    const player = data.damageSource.damagingEntity;
    const family = entity.getComponent(EntityComponentTypes.TypeFamily)
    const health = entity.getComponent(EntityComponentTypes.Health)
    if (player instanceof Player) {
        if (health.currentValue <= 0) {
            if (family.hasTypeFamily('monster')) {
                
            }
        }
    }
})