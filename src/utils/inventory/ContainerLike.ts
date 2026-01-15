import { ContainerSlot, ItemStack } from "@minecraft/server";

export interface ContainerLike {
    get size(): number;

    /**
     * @remarks
     * Returns a container slot. This acts as a reference to a slot
     * at the given index for this container.
     *
     * @param slot
     * The index of the slot to return. This index must be within
     * the bounds of the container.
     * @throws
     * Throws if the container is invalid or if the `slot` index is
     * out of bounds.
     */
    getSlot(slot: number): ContainerSlot;

    /**
     * @remarks
     * Gets an {@link ItemStack} of the item at the specified slot.
     * If the slot is empty, returns `undefined`. This method does
     * not change or clear the contents of the specified slot. To
     * get a reference to a particular slot, see {@link
     * Container.getSlot}.
     *
     * @param slot
     * Zero-based index of the slot to retrieve items from.
     * @throws
     * Throws if the container is invalid or if the `slot` index is
     * out of bounds.
     * @example getFirstHotbarItem.ts
     * ```typescript
     * import { world, EntityInventoryComponent, DimensionLocation } from "@minecraft/server";
     *
     * function getFirstHotbarItem(log: (message: string, status?: number) => void, targetLocation: DimensionLocation) {
     *   for (const player of world.getAllPlayers()) {
     *     const inventory = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent;
     *     if (inventory && inventory.container) {
     *       const firstItem = inventory.container.getItem(0);
     *
     *       if (firstItem) {
     *         log("First item in hotbar is: " + firstItem.typeId);
     *       }
     *
     *       return inventory.container.getItem(0);
     *     }
     *     return undefined;
     *   }
     * }
     * ```
     */
    getItem(slot: number): ItemStack | undefined;
}