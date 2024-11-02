import { Block, Direction } from "@minecraft/server";
import { DirectionFromCardinalString, DIRECTIONS } from "../../Index";

declare module "@minecraft/server" {
    interface Block {
        findClosestPlayer(): Player;
        inDirection(direction: Direction): Block | undefined;
        forEachNeighbor(callback: (direction: Direction, block: Block | undefined) => void): void;

        /**
         * @remarks
         * Returns the 'minecraft:cardinal_direction' state of a block
         * @throws if the block does not have the 'minecraft:cardinal_direction' block state
         */
        getCardinalDirection(): Direction;
    }
}

Block.prototype.findClosestPlayer = function() {
    return this.dimension.getPlayers({ closest: 1 })[0];
} 

Block.prototype.inDirection = function(direction: Direction) {
    switch (direction) {
        case Direction.Down:
            return this.below();
        case Direction.East:
            return this.east();
        case Direction.North:
            return this.north();
        case Direction.South:
            return this.south();
        case Direction.Up:
            return this.above();
        case Direction.West:
            return this.west();
    }
}

Block.prototype.forEachNeighbor = function(callback) {
    DIRECTIONS.forEach(dir => {
        const neighbor = this.inDirection(dir);
        callback(dir, neighbor);
    })
}

Block.prototype.getCardinalDirection = function() {
    const dirStr = this.permutation.getState('minecraft:cardinal_direction') as string | undefined;
    if (dirStr) return DirectionFromCardinalString(dirStr);

    throw new Error(
        `Block#getCardinalDirection was called on block id: '${this.typeId}', but the block did not have the 'minecraft:cardinal_direction' state.`
    );
}