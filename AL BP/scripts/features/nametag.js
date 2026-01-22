import { system, world } from '@minecraft/server';

system.runInterval(() => {
  world.getPlayers().forEach(player => {
    if (player.hasTag('admin')) {
      player.nameTag = `[§eADMIN§r] ${player.name}`
    }
  })
}, 100)