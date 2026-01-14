import { PlayerDatabase } from '../extension/Database.js'
import { Player, EntityComponentTypes } from '@minecraft/server'
import { text } from '../config/text'

/* ================= CONFIG ================= */

const HEAL_COOLDOWN = {
  3: 18 * 60, // Fighter
  4: 12 * 60,
  5: 5 * 60
}

/* ========================================= */

/**
 * @param {Player} player
 */
export function healPlayer(player) {
  
  /* ====== CEK RANK ====== */
  const rankDB = new PlayerDatabase('RankLevel', player)
  const rankLevel = Number(rankDB.get() ?? 0)
  
  const cooldown = HEAL_COOLDOWN[rankLevel]
  if (!cooldown) {
    return player.sendMessage(
      text('Rank kamu saat ini belum bisa menggunakan §6!heal').System.fail
    )
  }
  
  /* ====== CEK COOLDOWN ====== */
  const healDB = new PlayerDatabase('HealCooldown', player)
  const lastUse = Number(healDB.get() ?? 0)
  const now = Math.floor(Date.now() / 1000)
  const passed = now - lastUse
  
  if (passed < cooldown) {
    const sisa = cooldown - passed
    const menit = Math.floor(sisa / 60)
    const detik = sisa % 60
    
    return player.sendMessage(
      text(`§cHeal masih cooldown §6${menit}m ${detik}s`).System.warn
    )
  }
  
  /* ====== ISI DARAH ====== */
  try {
    const health = player.getComponent(EntityComponentTypes.Health)
    if (health.currentValue === health.effectiveMax) {
      return player.sendMessage(text('Darah kamu masih penuh').System.warn)
    }
    if (player.hasTag('admin')) {
      health.resetToMaxValue()
      return
    }
    health.resetToMaxValue()
  } catch (err) {
    return player.sendMessage(
      text('Gagal mengisi darah').System.fail
    )
  }
  
  /* ====== SIMPAN COOLDOWN ====== */
  healDB.set(now)
  
  player.sendMessage(
    text('Darah kamu sudah penuh!').System.succ
  )
}