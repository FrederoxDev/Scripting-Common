import { Block } from "@minecraft/server";

declare module "@minecraft/server" {
    interface Block {
        findClosestPlayer(): Player;
    }
}

Block.prototype.findClosestPlayer = function() {
    return this.dimension.getPlayers({ closest: 1 })[0];
    // return this.dimension.getEntitiesAtBlockLocation(this.location).filter(e => e.typeId === identifier);
} 