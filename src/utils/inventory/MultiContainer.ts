import { ContainerSlot, ItemStack } from "@minecraft/server";
import { ContainerLike } from "./ContainerLike";

/**
 * A wrapper for multiple containers as one.
 */
export class MultiContainer implements ContainerLike {
    private _size: number;
    private containers: ContainerLike[];

    /**
     * @param containers The containers to wrap.
     */
    constructor(containers: ContainerLike[]) {
        this.containers = containers;
        this._size = containers.reduce((total, container) => total + container.size, 0);
    }

    get size(): number {
        return this._size;
    }

    getSlot(slot: number): ContainerSlot {
        let currentSlot = slot;
        for (const container of this.containers) {
            if (currentSlot < container.size) {
                return container.getSlot(currentSlot);
            }
            currentSlot -= container.size;
        }
        throw new Error(`Slot ${slot} out of bounds`);
    }

    getItem(slot: number): ItemStack | undefined {
        return this.getSlot(slot).getItem();
    }
}