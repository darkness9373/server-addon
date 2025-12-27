import { world, EntityComponentTypes, Player } from '@minecraft/server'



world.afterEvents.entityDie.subscribe(data => {
    const killer = data.damageSource.damagingEntity;
    const dead = data.deadEntity;
    let family = dead.getComponent(EntityComponentTypes.TypeFamily)
    if (killer instanceof Player) {
        killer.sendMessage('kill mob')
        if (family.hasTypeFamily('monster')) {
            killer.sendMessage('kill monster')
        }
    }
})