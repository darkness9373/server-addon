import { PlayerDatabase } from '../extension/Database.js'
import { Player, EntityComponentTypes } from '@minecraft/server'
import { text } from '../config/text.js'

/* ================= CONFIG ================= */

const FOOD_COOLDOWN = {
  1: 15 * 60, // Rookie
  2: 10 * 60,
  3: 8 * 60,
  4: 5 * 60,
  5: 2 * 60
}

/* ========================================= */

/**
 * @param {Player} player
 */
export function foodPlayer(player) {
  
  /* ====== CEK RANK ====== */
  const rankDB = new PlayerDatabase('RankLevel', player)
  const rankLevel = Number(rankDB.get() ?? 0)
  
  const cooldown = FOOD_COOLDOWN[rankLevel]
  if (!cooldown) {
    return player.sendMessage(
      text('Rank kamu belum bisa menggunakan §6!food').System.fail
    )
  }
  
  /* ====== CEK COOLDOWN ====== */
  const cdDB = new PlayerDatabase('FoodCooldown', player)
  const lastUse = Number(cdDB.get() ?? 0)
  const now = Math.floor(Date.now() / 1000)
  const passed = now - lastUse
  
  if (passed < cooldown) {
    const sisa = cooldown - passed
    const menit = Math.floor(sisa / 60)
    const detik = sisa % 60
    
    return player.sendMessage(
      text(`§cFood masih cooldown §6${menit}m ${detik}s`).System.fail
    )
  }
  
  /* ====== ISI HUNGER ====== */
  try {
    const hunger = player.getComponent(EntityComponentTypes.Hunger)
    if (hunger.currentValue === hunger.effectiveMax) {
      return player.sendMessage(text('Hunger kamu masih penuh').System.warn)
    }
    if (player.hasTag('admin')) {
      hunger.resetToMaxValue()
      return
    }
    hunger.resetToMaxValue()
  } catch (err) {
    return player.sendMessage(
      text('Gagal mengisi hunger').System.fail
    )
  }
  
  /* ====== SIMPAN COOLDOWN ====== */
  cdDB.set(now)
  
  player.sendMessage(
    text('Hunger kamu sudah penuh!').System.succ
  )
}