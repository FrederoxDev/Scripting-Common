import { Player, Vector3, Dimension, world, World } from "@minecraft/server";
import { Vec3 } from "../../Index";

declare module "@minecraft/server" {
    interface World {
        getCachedPlayers(): Player[];
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
}

let cachedPlayers: Player[] = [];

world.afterEvents.worldLoad.subscribe(() => {
  cachedPlayers = world.getAllPlayers();
});

world.afterEvents.playerJoin.subscribe((e) => {
  cachedPlayers.push(world.getEntity(e.playerId) as Player);
});

world.beforeEvents.playerLeave.subscribe((e) => {
  // remove the player from the list
  const index = cachedPlayers.findIndex(p => p.id === e.player.id);

  if (index !== -1) {
    cachedPlayers.splice(index, 1);
  }
});

World.prototype.getCachedPlayers = function(): Player[] {
  return cachedPlayers;
};