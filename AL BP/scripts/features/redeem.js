import { ItemStack } from '@minecraft/server'
import { ModalFormData } from '@minecraft/server-ui'
import OpenUI from '../extension/OpenUI'
import { WorldDatabase } from '../extension/Database'
import Score from '../extension/Score'
import { text } from '../config/text';

export function makeRedeem(player) {
  const form = new ModalFormData()
    .title('Make Redeem')
    .textField('Kode Redeem', 'merdeka123')
    .slider('Jumlah Jenis Item', 1, 10)
    .slider('Limit Penggunaan', 1, 100)
    .toggle('Include Coins')
  
  OpenUI.force(player, form).then(r => {
    if (r.canceled) return
    
    let [rawCode, itemCount, limit, includeCoins] = r.formValues
    const code = normalizeCode(rawCode)
    if (!code) return player.sendMessage(text('Kode tidak valid').System.fail)
    
    const key = `Redeem_${code}`
    const db = new WorldDatabase(key)
    if (db.get()) {
      return player.sendMessage(text('Kode redeem sudah ada!').System.fail)
    }
    
    const form2 = new ModalFormData().title('Redeem Rewards')
    
    for (let i = 1; i <= itemCount; i++) {
      form2.textField(`Item ${i}`, 'minecraft:diamond')
      form2.slider(`Jumlah Item ${i}`, 1, 64)
    }
    
    if (includeCoins) {
      form2.slider('Coins', 1, 100000)
    }
    
    OpenUI.force(player, form2).then(r2 => {
      if (r2.canceled) return
      
      let rewards = []
      let index = 0
      
      for (let i = 0; i < itemCount; i++) {
        const item = r2.formValues[index++]
        const amount = r2.formValues[index++]
        if (!item || !item.includes(':')) continue
        rewards.push({ item, amount })
      }
      
      const coins = includeCoins ? r2.formValues[index] : 0
      
      const data = {
        code,
        rewards,
        coins,
        limit,
        claims: [],
        createdAt: Date.now()
      }
      
      db.set(JSON.stringify(data))
      player.sendMessage(text(`Redeem code berhasil dibuat: §e${code}`).System.succ)
    })
  })
}


export function claimRedeem(player) {
  const form = new ModalFormData()
    .title('Claim Redeem')
    .textField('Kode Redeem', 'merdeka123')
    .submitButton('Claim')
  
  OpenUI.force(player, form).then(r => {
    if (r.canceled) return
    
    const code = normalizeCode(r.formValues[0])
    const key = `Redeem_${code}`
    const db = new WorldDatabase(key)
    
    const raw = db.get()
    if (!raw) return player.sendMessage(text('Kode redeem tidak valid').System.fail)
    
    const data = JSON.parse(raw)
    
    if (data.claims.includes(player.id)) {
      return player.sendMessage(text('Kamu sudah claim kode ini!').System.fail)
    }
    
    if (data.claims.length >= data.limit) {
      return player.sendMessage(text('Kode redeem sudah habis!').System.fail)
    }
    
    // GIVE ITEMS
    for (const rwd of data.rewards) {
      try {
        const item = new ItemStack(rwd.item, rwd.amount)
        giveItemSafe(player, item)
      } catch {
        player.sendMessage(text(`Item tidak valid: ${rwd.item}`).System.fail)
      }
    }
    
    // GIVE COINS
    if (data.coins > 0) {
      Score.add(player, 'money', data.coins)
    }
    
    data.claims.push(player.id)
    db.set(JSON.stringify(data))
    
    player.sendMessage(text('Redeem berhasil!').System.succ)
  })
}









function normalizeCode(code) {
  return code.trim().toLowerCase()
}

function giveItemSafe(player, item) {
  const inv = player.getComponent("inventory").container
  const leftover = inv.addItem(item)
  if (leftover) {
    player.dimension.spawnItem(leftover, player.location)
  }
}