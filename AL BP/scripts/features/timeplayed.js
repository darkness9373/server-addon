import { system, System, world } from "@minecraft/server";
import Score from "../extension/Score";


system.run(function tick() {
    system.runTimeout(tick, 20)

    world.getPlayers().forEach(player => {
        Score.add(player, 'timePlayed')
    })
})


export function playtime(sec) {
    let d = Math.floor(sec / 86400)
    sec %= 86400
    let h = Math.floor(sec / 3600)
    sec %= 3600
    let m = Math.floor(sec / 60)
    let s = sec % 60

    if (d === 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
    return `${d} hari ${pad(h)}:${pad(m)}:${pad(s)}`
}

function pad(num) {
    return String(num).padStart(2, '0')
}