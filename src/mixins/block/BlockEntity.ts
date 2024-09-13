import { Block } from "@minecraft/server";

declare module "@minecraft/server" {
    interface Block {
        getEntities(identifier: string): Entity[];
        getBlockEntity(identifier: string): Entity | undefined;
    }
}

Block.prototype.getEntities = function(identifier) {
    return this.dimension.getEntitiesAtBlockLocation(this.location).filter(e => e.typeId === identifier);
} 

Block.prototype.getBlockEntity = function(identifier) {
    const all = this.getEntities(identifier);
    return all.length === 1 ? all[0] : undefined;
}