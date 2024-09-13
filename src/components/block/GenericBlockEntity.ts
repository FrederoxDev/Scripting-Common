import { BlockComponentOnPlaceEvent, BlockComponentPlayerDestroyEvent, BlockCustomComponent } from "@minecraft/server"

/**
 * A base class for all singlular block entity needs.
 * @ If overriding onPlace or onPlayerDestroy ensure you call the super.x method 
 */
export class GenericBlockEntity implements BlockCustomComponent {
    despawnEvent: string | undefined;
    entityIdentifier: string;

    /**
     * @param entityIdentifier The entity to spawn when the block is placed.
     * @param despawnEvent If not passed, entities will be despawned using entity.kill()
     */
    constructor(entityIdentifier: string, despawnEvent: string | undefined) {
        this.onPlace = this.onPlace.bind(this);
        this.onPlayerDestroy = this.onPlayerDestroy.bind(this);
        this.despawnEvent = despawnEvent;
        this.entityIdentifier = entityIdentifier;
    }

    onPlace(ev: BlockComponentOnPlaceEvent): void {
        ev.dimension.spawnEntity(this.entityIdentifier, ev.block.location);
    }

    onPlayerDestroy(ev: BlockComponentPlayerDestroyEvent): void {
        const entity = ev.block.getBlockEntity(this.entityIdentifier);
        if (entity === undefined) return;

        if (this.despawnEvent !== undefined) entity.triggerEvent(this.despawnEvent);
        else entity.kill();
    }
};