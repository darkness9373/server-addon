import { world, Entity, system } from '@minecraft/server'

class Score {
    /**
     * 
     * @param {Entity} entity 
     * @param {string} objective 
     * @param {number} amount 
     */
    add(entity, objective, amount) {
        system.run(() => {
            return world.scoreboard.getObjective(objective).addScore(entity, amount)
        })
    }
    /**
     * 
     * @param {Entity} entity 
     * @param {string} objective 
     * @returns 
     */
    get(entity, objective) {
        return world.scoreboard.getObjective(objective).getScore(entity) ?? 0
    }
    remove(entity, objective, amount) {
        system.run(() => {
            return world.scoreboard.getObjective(objective).setScore(entity, this.get(entity, objective) - amount)
        })
    }
    reset(entity, objective) {
        system.run(() => {
            return world.scoreboard.getObjective(objective).removeParticipant(entity)
        })
    }
    set(entity, objective, amount) {
        system.run(() => {
            return world.scoreboard.getObjective(objective).setScore(entity, amount)
        })
    }
}

export default new Score();