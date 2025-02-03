import { ItemStack, MolangVariableMap, Player, system, world } from "@minecraft/server";

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
        // Set its display on screen
        player.onScreenDisplay.setActionBar(`cryptic_depths:${player.getDynamicProperty("soul_energy")}`);
    });
}, 1);

world.afterEvents.entityDie.subscribe(ev => {
    const { damageSource, deadEntity } = ev;
    // Functions to do if Player kills a mob 
    if (!damageSource.damagingEntity instanceof Player) return;

    const new_energy = damageSource.damagingEntity?.getDynamicProperty("soul_energy") + 1;
    damageSource.damagingEntity?.setDynamicProperty("soul_energy", new_energy);

    const varMap = new MolangVariableMap();
    varMap.setVector3('direction', { x: 0, y: 1, z: 0 });

    deadEntity.dimension.spawnParticle("minecraft:soul_particle", deadEntity.location, varMap);

    Math.random() < 0.2 ? deadEntity.dimension.spawnItem(new ItemStack("cryptic_depths:soul_shard", 1), deadEntity.location) : 0;
});

world.afterEvents.entityHurt.subscribe(ev => {
    const { damage, damageSource, hurtEntity } = ev;

    if (hurtEntity instanceof Player) {
        // Decrease Soul Energy of Player if hurt
        const new_energy = hurtEntity.getDynamicProperty('soul_energy') - 1;
        hurtEntity.setDynamicProperty('soul_energy', new_energy);

    } else { return }
})