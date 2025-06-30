import { Block, BlockComponentOnPlaceEvent, BlockComponentPlayerBreakEvent, CustomComponentParameters, Entity, Vector3 } from "@minecraft/server"
import { Vec3 } from "../../utils/math/Vec3";
import { BlockCustomComponentV2, DirectionToAngle } from "../../Index";

/**
 * A base class for all singlular block entity needs.
 * @ If overriding onPlace or onPlayerDestroy ensure you call the super.x method 
 */
export class GenericBlockEntity implements BlockCustomComponentV2 {
    defaultName: string | undefined;
    entityIdentifier: string;
    spawnOffset: Vector3;

    entityRotationProperty: string | undefined;
    entityRotationOffset: number | undefined;

    /**
     * @param entityIdentifier The entity to spawn when the block is placed.
     * @param spawnOffset Added to the block location, useful for centering entities on blocks.
     */
    constructor(
        entityIdentifier: string
    ) {
        this.onPlace = this.onPlace.bind(this);
        this.onPlayerBreak = this.onPlayerBreak.bind(this);
        this.createBlockEntity = this.createBlockEntity.bind(this);

        this.entityIdentifier = entityIdentifier;
        this.spawnOffset = Vec3.ZERO;
    }

    addDefaultName(defaultName: string) {
        this.defaultName = defaultName;
    }

    addSpawnOffset(spawnOffset: Vector3) {
        this.spawnOffset = spawnOffset;
    }

    addRotationComponent(entityRotationProperty: string, entityRotationOffset: number = 0) {
        this.entityRotationProperty = entityRotationProperty;
        this.entityRotationOffset = entityRotationOffset;
    }

    onPlace(ev: BlockComponentOnPlaceEvent): Entity {
        return this.createBlockEntity(ev.block);
    }

    onPlayerBreak(ev: BlockComponentPlayerBreakEvent, _params: CustomComponentParameters): void {
        const entity = ev.block.getBlockEntity(this.entityIdentifier);
        entity?.remove();
    }

    createBlockEntity(block: Block): Entity {
        // Entity Spawn Location + Offset
        const entity = block.dimension.spawnEntity(this.entityIdentifier, Vec3.add(block.location, this.spawnOffset));

        // Entity default name component
        if (this.defaultName !== undefined) entity.nameTag = this.defaultName;

        // Entity rotation component
        if (this.entityRotationProperty !== undefined) {
            let angle = DirectionToAngle(block.getCardinalDirection()) + this.entityRotationOffset!;
            angle = angle >= 360 ? angle - 360 : angle;
            entity.setProperty(this.entityRotationProperty, angle);
        }

        return entity;
    }

    getBlockEntity(block: Block): Entity | undefined {
        return block.getBlockEntity(this.entityIdentifier);
    }
};