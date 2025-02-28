import { ItemStack, MolangVariableMap, Player, system, world } from "@minecraft/server";
import { soulMending } from "./enchantments.js"

system.runInterval(() => {
    // Range of Soul Energy 0-20
    world.getAllPlayers().forEach(player => {
        if (!player.getDynamicProperty("soul_energy")) {
            player.setDynamicProperty("soul_energy", 0);
        } else if (player.getDynamicProperty("soul_energy") > 20) {
            player.setDynamicProperty("soul_energy", 20);
        } else if (player.getDynamicProperty("soul_energy") < 0) {
            player.setDynamicProperty("soul_energy", 0);
        }
    });
}, 1);

// Re-set Progress UI
world.afterEvents.playerSpawn.subscribe(ev => {
    const { initialSpawn, player } = ev;
    player.onScreenDisplay.setTitle(`cryptic_depths:${player.getDynamicProperty("soul_energy")}`);
})

world.afterEvents.entityDie.subscribe(ev => {
    const { damageSource, deadEntity } = ev;
    // Functions to do if Player kills a mob 
    if (damageSource.damagingEntity instanceof Player) {

        const new_energy = damageSource.damagingEntity?.getDynamicProperty("soul_energy") + 1;
        damageSource.damagingEntity?.setDynamicProperty("soul_energy", new_energy);

        damageSource.damagingEntity?.onScreenDisplay.setTitle(`cryptic_depths:${damageSource.damagingEntity?.getDynamicProperty("soul_energy")}`);

        const varMap = new MolangVariableMap();
        varMap.setVector3('direction', { x: 0, y: 1, z: 0 });

        deadEntity.dimension.spawnParticle("minecraft:soul_particle", deadEntity.location, varMap);

        Math.random() < 0.2 ? deadEntity.dimension.spawnItem(new ItemStack("cryptic_depths:soul_residue", 1), deadEntity.location) : 0;
    } else { return }
});

world.afterEvents.entityHurt.subscribe(ev => {
    const { damage, damageSource, hurtEntity } = ev;

    if (hurtEntity instanceof Player) {
        // Decrease Soul Energy of Player if hurt
        const new_energy = Math.random() < 0.2 ? hurtEntity.getDynamicProperty('soul_energy') - 1 : hurtEntity.getDynamicProperty('soul_energy');
        hurtEntity.setDynamicProperty('soul_energy', new_energy);

        hurtEntity.onScreenDisplay.setTitle(`cryptic_depths:${hurtEntity.getDynamicProperty("soul_energy")}`);

        // Enchantment
        soulMending(damage, hurtEntity)

    } else { return }
})