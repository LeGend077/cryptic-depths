import { world, ItemComponentTypes, ItemDurabilityComponent, EntityComponentTypes, EntityInventoryComponent, Player } from '@minecraft/server';

const enchantments = {
    soul_mending: {
        id: '§e§m§s§m'
    }
}

// soul mending

world.afterEvents.entityHurt.subscribe(evd => {
    const { damage, damageSource, hurtEntity } = evd
    if (hurtEntity instanceof Player) {
        /**
         * @type {EntityInventoryComponent}
         */
        const inventory = hurtEntity.getComponent(EntityComponentTypes.Inventory);
        for (let i = 0; i < inventory.container.size; i++) {
            const item = inventory.container.getItem(i)
            item?.getLore().forEach(line => {
                if (line.includes(enchantments.soul_mending.id)) {
                    const newItem = item.clone()
                    /**
                     * @type {ItemDurabilityComponent}
                     */
                    const durability = newItem.getComponent(ItemComponentTypes.Durability)
                    if (durability.damage >= damage) {
                        durability.damage = durability.damage - damage
                        inventory.container.setItem(i, newItem)
                    } else { return }
                }
            })
        }
    } else { return }
})