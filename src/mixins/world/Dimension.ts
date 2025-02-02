import { Dimension, Player, Vector3 } from "@minecraft/server";
import { Vec3 } from "../../utils/math/Vec3";

declare module "@minecraft/server" {
  interface Dimension {
    getClosestPlayer(location: Vector3, maxDistance: number | undefined): Player | undefined;
  }
}

Dimension.prototype.getClosestPlayer = function (location, maxDistance): Player | undefined {
  let closestPlayer = undefined;
  let closestDistance = maxDistance ?? Infinity;

  this.getPlayers().forEach((player) => {
    const distance = Vec3.distance(player.location, location);

    if (distance < closestDistance) {
      closestPlayer = player;
      closestDistance = distance;
    }
  });

  return closestPlayer;
}