import { ModalFormData } from '@minecraft/server-ui';
import Score from '../extension/Score'
import { dataId } from '../config/database';
import OpenUI from '../extension/OpenUI';
import { PlayerDatabase } from '../extension/Database.js';
import { system, world } from '@minecraft/server';


export function changeName(player) {
  let name = new PlayerDatabase('nametag', player)
  let money = Score.get(player, 'money') ?? 0
  let price = dataId.price.nametag;
  const form = new ModalFormData()
  form.title('Change Name')
  form.textField(`Coins : ${money}\n\nMengganti nama memerlukan ${price} coin!!`, player.nameTag)
  OpenUI.force(player, form).then(async r => {
    if (r.canceled) return;
    if (money < price) return player.sendMessage('§cKoin kamu tidak mencukupi')
    player.sendMessage(`§aBerhasil mengubah nama dari §6${player.nameTag} §amenjadi §6${r.formValues[0]}`)
    player.nameTag = r.formValues[0]
    Score.remove(player, 'money', 100)
  })
}

system.runInterval(() => {
  world.getPlayers().forEach(player => {
    let nm = new PlayerDatabase('nametag', player).get() ?? player.name;
    if (!nm) return;
    player.nameTag = nm
  })
}, 10)