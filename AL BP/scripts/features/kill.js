import { world, EntityComponentTypes, Player } from '@minecraft/server'
import Score from '../extension/Score.js'



world.afterEvents.entityDie.subscribe(data => {
    const killer = data.damageSource.damagingEntity;
    const dead = data.deadEntity;
    let family = dead.getComponent(EntityComponentTypes.TypeFamily)
    if (killer instanceof Player) {
        Score.add(killer, 'killMob', 1)
        if (family.hasTypeFamily('monster')) {
            Score.add(killer, 'killMonster', 1)
        }
    }
})