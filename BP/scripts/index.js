import "./soul_energy.js";
import { system } from "@minecraft/server";

system.afterEvents.scriptEventReceive.subscribe(evd => {
    let id = evd.id

    switch (id) {
        case 'de:setSoulEnergy':
            evd.sourceEntity.setDynamicProperty('soul_energy', Number.parseInt(evd.message))
            break;
        default:
            break;
    }
})