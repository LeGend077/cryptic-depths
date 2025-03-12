import { world, EquipmentSlot, ItemStack, MolangVariableMap, Block, ItemDurabilityComponent, ItemComponentTypes } from "@minecraft/server";
import { enchantments } from "./mechanics/enchantments.js";

// Soul Altar Block Components

/**
 * @param {Block} block
 */
function runeParticles(block) {
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
const soulAltarBlockComponent = {
    onPlace(event) {
        event.block.setPermutation(event.block.permutation.withState('cryptic_depths:activated', false))
        event.block.setPermutation(event.block.permutation.withState('cryptic_depths:currentSelectedItemInAltar', 'none'))
    },
    // onTick(event) {
    //     const { x, y, z } = event.block.location
    // },
    onPlayerInteract(event) {
        const player = event.player;
        const block = event.block;
        const { x, y, z } = event.block.location

        /** @type {import("@minecraft/server").EntityEquippableComponent} */
        const equipment = player.getComponent("minecraft:equippable");
        const mainHandItem = equipment.getEquipment(EquipmentSlot.Mainhand);
        const candleCondition = (mainHandItem?.typeId === 'minecraft:candle' && mainHandItem?.amount === 4);

        if (block.permutation.getState('cryptic_depths:activated') === false && candleCondition) {
            block.setPermutation(block.permutation.withState('cryptic_depths:activated', true))
            equipment.setEquipment(EquipmentSlot.Mainhand, undefined)
        } else if (block.permutation.getState('cryptic_depths:activated') === false && !candleCondition) {
            player.onScreenDisplay.setActionBar('Activate the Soul Altar using 4 candles before using it!')
        }
        else if (block.permutation.getState('cryptic_depths:activated') === true) {
            if (mainHandItem?.typeId === 'cryptic_depths:soul_mending' && block.permutation.getState('cryptic_depths:currentSelectedItemInAltar') === 'none') {
                block.setPermutation(block.permutation.withState("cryptic_depths:currentSelectedItemInAltar", 'cryptic_depths:soul_mending'));

                equipment.setEquipment(EquipmentSlot.Mainhand, undefined)

                runeParticles(block)
                runeParticles(block)
                runeParticles(block)
                const varMap = new MolangVariableMap();
                varMap.setVector3('direction', { x: 0, y: 1, z: 0 });

                player.playSound('bloom.sculk_catalyst')
                block.dimension.spawnParticle("minecraft:soul_particle", {
                    x: x + 0.5,
                    y: y + (9 / 16),
                    z: z + 0.5
                }, varMap);
            }
            if (block.permutation.getState('cryptic_depths:currentSelectedItemInAltar') === 'cryptic_depths:soul_mending' && !(mainHandItem?.typeId === 'cryptic_depths:soul_mending') && !mainHandItem?.typeId.includes('_sword')) {

                block.setPermutation(block.permutation.withState("cryptic_depths:currentSelectedItemInAltar", 'none'));
                player.dimension.spawnItem(new ItemStack("cryptic_depths:soul_mending", 1), player.location)
            }

            if (block.permutation.getState('cryptic_depths:currentSelectedItemInAltar') === 'cryptic_depths:soul_mending' && mainHandItem?.typeId.includes('_sword')) {

                if (player.getDynamicProperty('soul_energy') >= 10) {
                    block.setPermutation(block.permutation.withState("cryptic_depths:currentSelectedItemInAltar", 'none'));
                    block.dimension.spawnParticle("cryptic_depths:enchantment_magic_particle", {
                        x: x + 0.5,
                        y: y + (9 / 16),
                        z: z + 0.5
                    });

                    const new_energy = player.getDynamicProperty('soul_energy') - 10
                    player.setDynamicProperty('soul_energy', new_energy)

                    const item = mainHandItem.clone()
                    item.setLore([`${enchantments.soul_mending.id}§r§7Soul Mending§r`])
                    equipment.setEquipment(EquipmentSlot.Mainhand, item)

                    player.playSound('insert_enchanted.chiseled_bookshelf')

                    player.onScreenDisplay.setTitle(`cryptic_depths:${player.getDynamicProperty("soul_energy")}`);
                } else {
                    player.onScreenDisplay.setActionBar(
                        'Atleast 50% soul energy is required to enchant!'
                    )
                }
            }
        }
    }
}

/** @type {import("@minecraft/server").ItemCustomComponent} */
const toolDurabilityComponent = {
    onMineBlock(event) {
        const player = event.source;
        const toolClone = event.itemStack.clone();
        /** @type {import("@minecraft/server").EntityEquippableComponent} */
        const equipment = player.getComponent("minecraft:equippable");
        /**@type {ItemDurabilityComponent} */
        const durabilityComp = toolClone.getComponent(ItemComponentTypes.Durability);
        if (!(durabilityComp.damage === (durabilityComp.maxDurability - 1))) {
            durabilityComp.damage += 1;
            equipment.setEquipment(EquipmentSlot.Mainhand, toolClone)
        } else {
            equipment.setEquipment(EquipmentSlot.Mainhand, undefined);
        }
    }
}

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry, itemComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "cryptic_depths:soulAltarBlockComponent", soulAltarBlockComponent
    );
    itemComponentRegistry.registerCustomComponent('cryptic_depths:tool_durability', toolDurabilityComponent)
})