import { BlockComponentOnPlaceEvent, BlockComponentPlayerDestroyEvent, BlockCustomComponent, Entity, Vector3 } from "@minecraft/server"
import { Vec3 } from "../../utils/math/Vec3";

/**
 * A base class for all singlular block entity needs.
 * @ If overriding onPlace or onPlayerDestroy ensure you call the super.x method 
 */
export class GenericBlockEntity implements BlockCustomComponent {
    despawnEvent: string | undefined;
    defaultName: string | undefined;
    entityIdentifier: string;
    spawnOffset: Vector3;

    /**
     * @param entityIdentifier The entity to spawn when the block is placed.
     * @param despawnEvent If not passed, entities will be despawned using entity.kill()
     * @param defaultName The name to spawn the entity with, helpful for container blocks and making custom UI that requires the same name each time.
     * @param spawnOffset Added to the block location, useful for centering entities on blocks.
     */
    constructor(
        entityIdentifier: string, 
        despawnEvent: string | undefined = undefined, 
        defaultName: string | undefined = undefined,
        spawnOffset: Vector3 | undefined = undefined
    ) {
        this.onPlace = this.onPlace.bind(this);
        this.onPlayerDestroy = this.onPlayerDestroy.bind(this);
        this.despawnEvent = despawnEvent;
        this.entityIdentifier = entityIdentifier;
        this.defaultName = defaultName;
        this.spawnOffset = spawnOffset ?? Vec3.ZERO;
    }

    onPlace(ev: BlockComponentOnPlaceEvent): Entity {
        const entity = ev.dimension.spawnEntity(this.entityIdentifier, Vec3.add(ev.block.location, this.spawnOffset));
        if (this.defaultName !== undefined) entity.nameTag = this.defaultName;
        return entity;
    }

    onPlayerDestroy(ev: BlockComponentPlayerDestroyEvent): void {
        const entity = ev.block.getBlockEntity(this.entityIdentifier);
        if (entity === undefined) return;

        if (this.despawnEvent !== undefined) entity.triggerEvent(this.despawnEvent);
        else entity.kill();
    }
};