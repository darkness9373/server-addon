import { world, system, Player } from '@minecraft/server'

class Score {
    /**
     * 
     * @param {Player} player 
     * @param {string} objective 
     * @param {number} amount 
     */
    add(player, objective, amount) {
        player.runCommand(`scoreboard players add @s ${objective} ${amount}`)
    }
    set(player, objective, amount) {
        player.runCommand(`scoreboard players set @s ${objective} ${amount}`)
    }
    remove(player, objective, amount) {
        player.runCommand(`scoreboard players remove @s ${objective} ${amount}`)
    }
    get(player, objective) {
        return world.scoreboard.getObjective(objective).getScore(player) ?? 0
    }
}

export default new Score()