import { world, system } from '@minecraft/server'
import { ModalFormData, ActionFormData } from '@minecraft/server-ui'
import OpenUI from '../extension/OpenUI'
import { text } from '../config/text'

/**
 * Map<targetId, Array<{ from: Player, time: number }>>
 */
const TPA_REQUESTS = new Map()

const EXPIRE_TIME = 60_000 // 60 detik

/* ================= UTILITY ================= */

function cleanup(list, now) {
  for (let i = list.length - 1; i >= 0; i--) {
    if (now - list[i].time > EXPIRE_TIME) {
      list.splice(i, 1)
    }
  }
}

function getOnlinePlayers(except) {
  return world.getPlayers().filter(p => p.id !== except.id)
}

/* ================= SEND TPA ================= */

export function tpaCommand(player, args) {
  
  // !tpa <name>
  if (args.length > 0) {
    const target = world.getPlayers().find(
      p => p.name.toLowerCase() === args[0].toLowerCase()
    )
    
    if (!target) {
      player.sendMessage(text('Player tidak ditemukan').System.fail)
      return
    }
    
    return sendRequest(player, target)
  }
  
  // !tpa → form
  const players = getOnlinePlayers(player)
  if (players.length === 0) {
    player.sendMessage(text('Tidak ada player online').System.warn)
    return
  }
  
  const form = new ModalFormData()
    .title('TPA')
    .dropdown(
      'Pilih player tujuan',
      players.map(p => p.name)
    )
    .submitButton('Kirim Request')
  
  OpenUI.force(player, form).then(res => {
    if (res.canceled) return
    sendRequest(player, players[res.formValues[0]])
  })
}

function sendRequest(sender, target) {
  
  if (sender.id === target.id) {
    sender.sendMessage(text('Tidak bisa TPA ke diri sendiri').System.fail)
    return
  }
  
  const list = TPA_REQUESTS.get(target.id) ?? []
  cleanup(list, Date.now())
  
  if (list.some(r => r.from.id === sender.id)) {
    sender.sendMessage(text('Request TPA sudah dikirim').System.warn)
    return
  }
  
  list.push({
    from: sender,
    time: Date.now()
  })
  
  TPA_REQUESTS.set(target.id, list)
  
  sender.sendMessage(
    text(`TPA request dikirim ke §e${target.name}`).System.succ
  )
  
  target.sendMessage(
    text(
      `§e${sender.name} §ringin TPA ke kamu\n` +
      `Gunakan §a!tpaccept §ratau §c!tpadeny`
    ).System.deff
  )
}

/* ================= ACCEPT ================= */

export function tpAcceptCommand(player) {
  const list = TPA_REQUESTS.get(player.id)
  
  if (!list || list.length === 0) {
    player.sendMessage(text('Tidak ada request TPA').System.warn)
    return
  }
  
  cleanup(list, Date.now())
  
  if (list.length === 1) {
    return accept(player, list[0].from)
  }
  
  const form = new ActionFormData()
    .title('TPA Requests')
  
  list.forEach(r => {
    form.button(r.from.name)
  })
  
  form.show(player).then(res => {
    if (res.canceled) return
    accept(player, list[res.selection].from)
  })
}

function accept(target, sender) {
  
  sender.tryTeleport(target.location, {
    dimension: target.dimension
  })
  
  sender.sendMessage(
    text(`TPA ke §e${target.name} §aditerima`).System.succ
  )
  
  target.sendMessage(
    text(`Kamu menerima TPA dari §e${sender.name}`).System.succ
  )
  
  TPA_REQUESTS.set(
    target.id,
    (TPA_REQUESTS.get(target.id) ?? [])
    .filter(r => r.from.id !== sender.id)
  )
}

/* ================= DENY ================= */

export function tpDenyCommand(player) {
  const list = TPA_REQUESTS.get(player.id)
  
  if (!list || list.length === 0) {
    player.sendMessage(text('Tidak ada request TPA').System.warn)
    return
  }
  
  cleanup(list, Date.now())
  
  if (list.length === 1) {
    return deny(player, list[0].from)
  }
  
  const form = new ActionFormData()
    .title('TPA Requests')
  
  list.forEach(r => {
    form.button(r.from.name)
  })
  
  form.show(player).then(res => {
    if (res.canceled) return
    deny(player, list[res.selection].from)
  })
}

function deny(target, sender) {
  
  sender.sendMessage(
    text(`TPA ke §e${target.name} §cditolak`).System.fail
  )
  
  target.sendMessage(
    text(`Kamu menolak TPA dari §e${sender.name}`).System.fail
  )
  
  TPA_REQUESTS.set(
    target.id,
    (TPA_REQUESTS.get(target.id) ?? [])
    .filter(r => r.from.id !== sender.id)
  )
}