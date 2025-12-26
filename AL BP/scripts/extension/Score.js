import { world, system, Player } from '@minecraft/server'

class Score {
    /**
     * 
     * @param {Player} player 
     * @param {string} objective 
     * @param {number} amount 
     */
    add(player, objective, amount) {
        world.scoreboard.getObjective(objective).setScore(player, amount)
    }
}

export default new Score()