import { world, system, Player } from '@minecraft/server'

class Score {
    /**
     * 
     * @param {Player} player 
     * @param {string} objective 
     * @param {number} amount 
     */
    add(player, objective, amount) {
        this.set(player, objective, this.get(player, objective) + amount)
    }
    set(player, objective, amount) {
        let obj = world.scoreboard.getObjective(objective)
        if (!obj) {
            world.scoreboard.addObjective(objective)
        }
        obj.setScore(player, amount)
    }
    remove(player, objective, amount) {
        this.set(player, objective, this.get(player, objective) - amount)
    }
    get(player, objective) {
        return world.scoreboard.getObjective(objective).getScore(player) ?? 0
    }
}

export default new Score()