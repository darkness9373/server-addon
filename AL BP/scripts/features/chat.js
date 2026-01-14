import { world } from "@minecraft/server"
import { PlayerDatabase } from "../extension/Database"
import Tag from "../extension/Tag"
import { getData } from '../config/database'
import { text } from '../config/text'

/* ================= CONFIG ================= */

const ADMIN_SECRET_CODE = 'ancient-admin-26' // GANTI SESUAI MAU KAMU

/* ========================================== */

world.beforeEvents.chatSend.subscribe(ev => {
    const player = ev.sender
    const msg = ev.message.trim()
    const prefix = getData(player).chatPrefix.get() ?? '!'
    
    /* ====== COMMAND DISERAHKAN KE CMD SYSTEM ====== */
    if (msg.startsWith(prefix)) return
    
    ev.cancel = true
    
    /* ============ ADMIN SECRET ============ */
    if (msg === `${ADMIN_SECRET_CODE}`) {
        
        if (player.hasTag('admin')) {
            return player.sendMessage(
                text('Kamu sudah menjadi Admin').System.warn
            )
        }
        
        // Optional: sekali pakai per player
        const used = new PlayerDatabase('AdminActivated', player).get()
        if (used) {
            return player.sendMessage(
                text('Kode admin sudah pernah digunakan').System.fail
            )
        }
        
        Tag.add(player, 'admin')
        new PlayerDatabase('AdminActivated', player).set(true)
        
        return player.sendMessage(
            text('Akses Admin berhasil diaktifkan').System.succ
        )
    }
    
    /* ============ CHAT NORMAL ============ */
    const rank = getData(player).rank.get() ?? 'Newbie'
    world.sendMessage(`§7[${rank}] §f${player.name} §8» §r${msg}`)
})