import { world, system } from '@minecraft/server'
import Score from '../extension/Score'

system.run(function tick() {
    system.runTimeout(tick, 10)

    world.getPlayers().forEach(player => {
        let money = Score.get(player, 'money')
        let moneyRaw = Score.get(player, 'moneyRaw')
        if (money !== moneyRaw) {
            if (money > moneyRaw) {
                player.sendMessage(`+${money - moneyRaw} Coins`)
                Score.set(player, 'moneyRaw', money)
            } else {
                player.sendMessage(`-${moneyRaw - money} Coins`)
                Score.set(player, 'moneyRaw', money)
            }
        }
    })
})