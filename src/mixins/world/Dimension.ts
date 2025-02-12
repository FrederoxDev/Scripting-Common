import { Player, Vector3, Dimension } from "@minecraft/server";
import { Vec3 } from "../../Index";

declare module "@minecraft/server" {
    interface Dimension {
        /**
         * Finds the closest player
         * @param position The position to search from
         * @param maxDistance The max distance to search for players
         * @returns If the closest player is further than maxDistance, or no players are in this dimension, undefined is returned
         */
        getClosestPlayer(position: Vector3, maxDistance?: number): Player | undefined;
    }
}

Dimension.prototype.getClosestPlayer = function(position: Vector3, maxDistance: number = 100): Player | undefined {
    let closestPlayer: Player | undefined = undefined;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const player of this.getPlayers()) {
        const distance = Vec3.distance(position, player.location);

        if (distance < closestDistance) {
            closestPlayer = player;
            closestDistance = distance;
        }
    }

    if (closestDistance > maxDistance) return undefined;
    return closestPlayer;