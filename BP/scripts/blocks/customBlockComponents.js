import { world, EquipmentSlot, ItemStack, MolangVariableMap } from "@minecraft/server";

// Soul Altar Block Components

function ruinParticles(block) {
    const { x, y, z } = block.location
    const varMap = new MolangVariableMap();
    varMap.setVector3('direction', { x: 0, y: 1, z: 0 });

    block.dimension.spawnParticle("minecraft:enchanting_table_particle", {
        x: x + 1,
        y: y + (9 / 16),
        z: z + 1
    }, varMap)
    block.dimension.spawnParticle("minecraft:enchanting_table_particle", {
        x: x,
        y: y + (9 / 16),
        z: z + 1
    }, varMap)
    block.dimension.spawnParticle("minecraft:enchanting_table_particle", {
        x: x + 1,
        y: y + (9 / 16),
        z: z
    }, varMap)
    block.dimension.spawnParticle("minecraft:enchanting_table_particle", {
        x: x,
        y: y + (9 / 16),
        z: z
    }, varMap)
    block.dimension.spawnParticle("minecraft:enchanting_table_particle", {
        x: x + 0.5,
        y: y + (9 / 16),
        z: z + 0.5
    }, varMap)
}

/** @type {import("@minecraft/server").BlockCustomComponent} */
const spawnParticleBlockComponent = {
    onTick(event) {
        const { x, y, z } = event.block.location
        event.block.dimension.spawnParticle("minecraft:blue_flame_particle",
            {
                x: x,
                y: y + (9 / 16),
                z: z
            }
        );
        event.block.dimension.spawnParticle("minecraft:blue_flame_particle",
            {
                x: x + 1,
                y: y + (9 / 16),
                z: z
            }
        );
        event.block.dimension.spawnParticle("minecraft:blue_flame_particle",
            {
                x: x,
                y: y + (9 / 16),
                z: z + 1
            }
        );
        event.block.dimension.spawnParticle("minecraft:blue_flame_particle",
            {
                x: x + 1,
                y: y + (9 / 16),
                z: z + 1
            }
        );
    }
}

/** @type {import("@minecraft/server").BlockCustomComponent} */
const applyEnchantBlockComponent = {
    onPlayerInteract(event) {
        const player = event.player;
        const block = event.block;
        const { x, y, z } = event.block.location

        /** @type {import("@minecraft/server").EntityEquippableComponent} */
        const equipment = player.getComponent("minecraft:equippable");
        const mainHandItem = equipment.getEquipment(EquipmentSlot.Mainhand);

        if (mainHandItem?.typeId === 'cryptic_depths:soul_fire_enchantment_book' && block.permutation.getState('cryptic_depths:currentSelectedItemInAltar') === 'none') {
            block.setPermutation(block.permutation.withState("cryptic_depths:currentSelectedItemInAltar", 'cryptic_depths:soul_fire_enchantment_book'));

            equipment.setEquipment(EquipmentSlot.Mainhand, undefined)

            ruinParticles(block)
            ruinParticles(block)
            ruinParticles(block)
            const varMap = new MolangVariableMap();
            varMap.setVector3('direction', { x: 0, y: 1, z: 0 });

            player.playSound('bloom.sculk_catalyst')
            block.dimension.spawnParticle("minecraft:soul_particle", {
                x: x + 0.5,
                y: y + (9 / 16),
                z: z + 0.5
            }, varMap);
        }
        if (block.permutation.getState('cryptic_depths:currentSelectedItemInAltar') === 'cryptic_depths:soul_fire_enchantment_book' && !(mainHandItem?.typeId === 'cryptic_depths:soul_fire_enchantment_book')) {

            block.setPermutation(block.permutation.withState("cryptic_depths:currentSelectedItemInAltar", 'none'));
            player.dimension.spawnItem(new ItemStack("cryptic_depths:soul_fire_enchantment_book", 1), player.location)
        }
    }
}

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "cryptic_depths:spawn_particle", spawnParticleBlockComponent
    );
    blockComponentRegistry.registerCustomComponent(
        "cryptic_depths:apply_enchant", applyEnchantBlockComponent
    );
})