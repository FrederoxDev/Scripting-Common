import { Vector3 } from "@minecraft/server";
import { Vec3 } from "./Vec3"

export class AABB {
    min: Vector3;
    max: Vector3;

    constructor(a: Vector3, b: Vector3) {
        let minX = Math.min(a.x, b.x);
        let maxX = Math.max(a.x, b.x);

        let minY = Math.min(a.y, b.y);
        let maxY = Math.max(a.y, b.y);

        let minZ = Math.min(a.z, b.z);
        let maxZ = Math.max(a.z, b.z);

        this.min = Vec3.from(minX, minY, minZ);
        this.max = Vec3.from(maxX, maxY, maxZ);
    }

    /**
     * Checks if the given position is inside of the AABB area
     */
    intersects(point: Vector3): boolean {
        let min = this.min;
        let max = this.max;

        return !(
            point.x < min.x || point.y < min.y || point.z < min.z ||
            point.x > max.x || point.y > max.y || point.z > max.z
        );
    }

    /**
     * Runs a callback for every block position in an AABB
     * @param callback {(position: Vector3) => void}
     */
    forEachBlock(callback: (position: Vector3) => void) {
        for (let x = this.min.x; x <= this.max.x; x++) {
            for (let y = this.min.y; y <= this.min.y; y++) {
                for (let z = this.min.z; z <= this.max.z; z++) {
                    const position = Vec3.from(x, y, z);
                    callback(position)
                }
            }
        }
    }
}