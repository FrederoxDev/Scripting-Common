import { Block } from "@minecraft/server";
import { Vec3 } from "../../utils/math/Vec3";

declare module "@minecraft/server" {
    interface Block {
        /**
         * Returns all entities at the block location with the given identifier.
         * - not as precise as getEntitiesPrecise. two neighbouring blocks can return the same entity.
         * - in scenarios where this is not wanted use {@link getEntitiesPrecise} instead.
         * @param identifier 
         */
        getEntities(identifier: string): Entity[];


        getBlockEntity(identifier: string): Entity | undefined;

        /**
         * Returns all entities at the block location with the given identifier.
         * - more precise than getEntities. two neighbouring blocks will not return the same entity.
         * - in scenarios where this overhead is not needed use {@link getEntities}
         */
        getEntitiesPrecise(identifier: string): Entity[];
    }
}

Block.prototype.getEntities = function(identifier) {
    return this.dimension.getEntitiesAtBlockLocation(this.location).filter(e => e.typeId === identifier);
} 

Block.prototype.getEntitiesPrecise = function(identifier) {
    return this.dimension.getEntitiesAtBlockLocation(this.location)
        .filter(e => e.typeId === identifier && Vec3.equals(this.location, Vec3.floor(e.location)));
} 

Block.prototype.getBlockEntity = function(identifier) {
    const all = this.getEntities(identifier);
    return all.length === 1 ? all[0] : undefined;
}