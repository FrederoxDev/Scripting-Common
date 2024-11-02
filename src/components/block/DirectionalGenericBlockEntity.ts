import { BlockComponentOnPlaceEvent, BlockComponentPlayerDestroyEvent, BlockCustomComponent, Entity, Vector3 } from "@minecraft/server"
import { Vec3 } from "../../utils/math/Vec3";
import { GenericBlockEntity } from "./GenericBlockEntity";
import { DirectionFromCardinalString, DirectionToAngle } from "../../Index";

/**
 * A base class for all singlular block entity needs.
 * @ If overriding onPlace or onPlayerDestroy ensure you call the super.x method 
 */
export class DirectionalGenericBlockEntity extends GenericBlockEntity {
    rotationProperty: string;
    rotationOffset: number;

    constructor(
        entityIdentifier: string, 
        defaultName: string | undefined = undefined,
        spawnOffset: Vector3 | undefined = undefined,
        rotationProperty: string,
        rotationOffset: number = 0
    ) {
        super(entityIdentifier);

        if (defaultName) this.addDefaultName(defaultName);
        if (spawnOffset) this.addSpawnOffset(spawnOffset);

        this.rotationProperty = rotationProperty;
        this.rotationOffset = rotationOffset;
    }

    onPlace(ev: BlockComponentOnPlaceEvent): Entity {
        const entity = super.onPlace(ev);

        const cardinalStr = ev.block.permutation.getState('minecraft:cardinal_direction') as string;
        const direction = DirectionFromCardinalString(cardinalStr);
        let angle = DirectionToAngle(direction) + this.rotationOffset;
        angle = angle >= 360 ? angle - 360 : angle;

        entity.setProperty(this.rotationProperty, angle);

        return entity;
    }
};