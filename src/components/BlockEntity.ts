import { BlockComponentOnPlaceEvent, BlockComponentPlayerDestroyEvent, BlockCustomComponent } from "@minecraft/server"
import { BlockSource } from "../Index";

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

    onPlace(ev: BlockComponentOnPlaceEvent) {
        ev.dimension.spawnEntity(this.entityIdentifier, ev.block.location);
    }

    onPlayerDestroy(ev: BlockComponentPlayerDestroyEvent) {
        const entities = BlockSource.getEntitiesAtBlock(ev.block, this.entityIdentifier);

        if (this.despawnEvent !== undefined) {
            entities.forEach(e => e.triggerEvent(this.despawnEvent!));
        }
        else {
            entities.forEach(e => e.kill());
        }
    }
};