import { Block, Dimension, Entity, Vector3 } from "@minecraft/server";

export class BlockSource {
    static getEntitiesAtBlock(block: Block, identifier: string): Entity[] {
        return block.dimension.getEntitiesAtBlockLocation(block.location)
            .filter(e => e.typeId === identifier);
    }

    static getBlockEntity(block: Block, identifier: string): Entity {
        const allEntities = block.dimension.getEntitiesAtBlockLocation(block.location)
            .filter(e => e.typeId === identifier);

        if (allEntities.length !== 1) {
            throw new Error(`BlockSource::getBlockEntity found ${allEntities.length} entities of id '${identifier}' at location ${JSON.stringify(block.location)}`);
        }

        return allEntities[0];
    }
}