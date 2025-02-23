import { ItemComponentTypes, ItemDurabilityComponent, EntityComponentTypes, Player } from '@minecraft/server';

const enchantments = {
    soul_mending: {
        id: '§e§m§s§m'
    }
}

/**
 * @param {number} damage
 * @param {Player} hurtEntity
 */
export const soulMending = (damage, hurtEntity) => {
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
                if (durability.damage - damage > 0 || durability.damage - damage === 0) {
                    durability.damage = durability.damage - damage
                    inventory.container.setItem(i, newItem)
                }
            }
        })
    }
}