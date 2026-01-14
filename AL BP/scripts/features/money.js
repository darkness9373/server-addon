import { world, system } from '@minecraft/server'
import Score from '../extension/Score'

/**
 * Minimum perubahan money agar ditampilkan
 * (anti spam)
 */
const THRESHOLD = 5

/**
 * Interval pengecekan
 * 10 tick = 0.5 detik
 */
system.run(function tick() {
    system.runTimeout(tick, 10)
    
    for (const player of world.getPlayers()) {
        const money = Number(Score.get(player, 'money') ?? 0)
        
        let moneyRaw = Score.get(player, 'moneyRaw')
        
        // Inisialisasi pertama kali
        if (moneyRaw === undefined || moneyRaw === null) {
            Score.set(player, 'moneyRaw', money)
            continue
        }
        
        moneyRaw = Number(moneyRaw)
        
        if (money === moneyRaw) continue
        
        const diff = money - moneyRaw
        
        // Threshold check
        if (Math.abs(diff) < THRESHOLD) {
            Score.set(player, 'moneyRaw', money)
            continue
        }
        
        // ActionBar feedback
        player.onScreenDisplay.setActionBar(
            diff > 0 ?
            `§a+${diff} Coins` :
            `§c${diff} Coins`
        )
        
        // Update snapshot
        Score.set(player, 'moneyRaw', money)
    }
})