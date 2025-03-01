import "./customComponents.js";
import "./mechanics/soul_energy.js";
import "./mechanics/enchantments.js";
import { system } from "@minecraft/server";

// Debug

system.afterEvents.scriptEventReceive.subscribe(evd => {
    let id = evd.id

    switch (id) {
        case 'de:setSoulEnergy':
            evd.sourceEntity.setDynamicProperty('soul_energy', Number.parseInt(evd.message))
            evd.sourceEntity.onScreenDisplay.setTitle(`cryptic_depths:${evd.sourceEntity.getDynamicProperty("soul_energy")}`);
            break;
        default:
            break;
    }
})