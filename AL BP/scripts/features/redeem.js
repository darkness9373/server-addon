import { world, Player, system, ItemStack } from '@minecraft/server';
import { ModalFormData, FormCancelationReason } from '@minecraft/server-ui';
import OpenUI from '../extension/OpenUI.js';
import { WorldDatabase } from '../extension/Database.js';


export function makeRedeem(player) {
  const form = new ModalFormData()
  form.title('Make Redeem')
  form.textField('Masukkan kode redeem yang akan kamu tambahkan', 'merdeka123')
  form.slider('Jenis hadiah', 1, 10)
  form.slider('Limit penggunaan', 1, 100)
  OpenUI.force(player, form).then(async r => {
    if (r.canceled) return;
    const [kode, jumlah, limit] = r.formValues
    let f2 = new ModalFormData()
    f2.title('Make Redeem')
    for (let i = 1; i <= jumlah; i++) {
      f2.textField(`Item ${i}`, 'minecraft:diamond')
      f2.slider(`Jumlah item ${i}`, 1, 64)
    }
    OpenUI.force(player, f2).then(async r2 => {
      if (r2.canceled) return;
      let kodeKey = `Redeem_${kode}`
      let claimKey = `Redeem_${kode}_claim`
      let hadiah = []
      for (let i = 0; i < r2.formValues.length; i += 2) {
        let itemName = r2.formValues[i]
        let jumlahItem = r2.formValues[i + 1]
        hadiah.push({ item: itemName, amount: jumlahItem })
      }
      let data = {
        code: kode,
        hadiah,
        limit
      }
      
      new WorldDatabase(kodeKey).set(JSON.stringify(data))
      new WorldDatabase(claimKey).set('[]')
      player.sendMessage(`\u00a7aKode redeem berhasil dibuat: ${kode}`)
    })
  })
}

export function claimRedeem(player) {
  const form = new ModalFormData()
  form.title('Claim Redeem Code')
  form.textField('Masukkan kode redeem', 'merdeka123')
  form.submitButton('Claim')
  OpenUI.force(player, form).then(async r => {
    if (r.canceled) return;
    let kode = r.formValues[0]
    let kodeKey = `Redeem_${kode}`
    let claimKey = `Redeem_${kode}_claim`
    let dataRaw = new WorldDatabase(kodeKey).get() ?? undefined;
    if (dataRaw === undefined) return player.sendMessage('\u00a7cKode redeem tidak valid!')
    let data = JSON.parse(dataRaw)
    let claims = JSON.parse(new WorldDatabase(claimKey).get()) || []
    if (claims.includes(player.name)) return player.sendMessage('\u00a7cKamu sudah claim kode ini sebelumnya!')
    if (claims.length >= data.limit) return player.sendMessage('\u00a7cKode redeem sudah mencapai batas penggunaan!')
    
    for (const hadiah of data.hadiah) {
      try {
        let itemId = hadiah.item
        if (hadiah.item.startsWith('minecraft:')) {
          itemId = hadiah.item.replace('minecraft:', '')
        }
        let item = new ItemStack(hadiah.item, hadiah.amount)
        player.getComponent('inventory').container.addItem(item)
      } catch (e) {
        return player.sendMessage(`\u00a7cItem tidak valid: ${itemId}`)
      }
    }
    claims.push(player.name)
    new WorldDatabase(claimKey).set(JSON.stringify(claims))
    
    player.sendMessage('\u00a7aClaim kode redeem berhasil!')
  })
}