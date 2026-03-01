import { Vector3 } from "@minecraft/server";
import { Vec3 } from "./Vec3"
import { assert } from "../error/Error";

export class AABB {
    min: Vector3;
    max: Vector3;

    constructor(a: Vector3, b: Vector3) {
        const minX = Math.min(a.x, b.x);
        const maxX = Math.max(a.x, b.x);

        const minY = Math.min(a.y, b.y);
        const maxY = Math.max(a.y, b.y);

        const minZ = Math.min(a.z, b.z);
        const maxZ = Math.max(a.z, b.z);

        this.min = Vec3.from(minX, minY, minZ);
        this.max = Vec3.from(maxX, maxY, maxZ);
    }

    /**
     * Checks if the given position is inside of the AABB area
     */
    hasPoint(point: Vector3): boolean {
        const min = this.min;
        const max = this.max;

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
            for (let y = this.min.y; y <= this.max.y; y++) {
                for (let z = this.min.z; z <= this.max.z; z++) {
                    const position = Vec3.from(x, y, z);
                    callback(position)
                }
            }
        }
    }

    static fromPositions(positions: Vector3[]) {
        assert(positions.length > 0, "Cannot create an AABB from an empty list of vectors");
        
        let min = positions[0]!;
        let max = positions[0]!;

        positions.forEach(pos => {
            min = Vec3.min(min, pos)
            max = Vec3.max(max, pos)
        });

        return new AABB(min, max);
    }

    static fromAABBs(aabbs: AABB[]) {
        assert(aabbs.length > 0, "Cannot create an AABB from an empty list of AABBs");

        let min = aabbs[0]!.min;
        let max = aabbs[0]!.max;

        for (const box of aabbs) {
            min = Vec3.min(min, box.min);
            max = Vec3.max(max, box.max);
        }

        return new AABB(min, max);
    }

    /**
     * Checks if this AABB intersects with another AABB
     * @param other {AABB} The other AABB to check for intersection
     * @returns {boolean} True if the AABBs intersect, false otherwise
     */
    intersects(other: AABB): boolean {
        return !(
            this.max.x <= other.min.x || this.min.x >= other.max.x ||
            this.max.y <= other.min.y || this.min.y >= other.max.y ||
            this.max.z <= other.min.z || this.min.z >= other.max.z
        );
    }

    isAabbVisible(origin: Vector3, headRotation: Vector3, fov: number) {
        const corners = [
            Vec3.from(this.min.x, this.min.y, this.min.z),
            Vec3.from(this.min.x, this.min.y, this.max.z),
            Vec3.from(this.min.x, this.max.y, this.min.z),
            Vec3.from(this.min.x, this.max.y, this.max.z),
            Vec3.from(this.max.x, this.min.y, this.min.z),
            Vec3.from(this.max.x, this.min.y, this.max.z),
            Vec3.from(this.max.x, this.max.y, this.min.z),
            Vec3.from(this.max.x, this.max.y, this.max.z),
        ]

        const fovRadians = (fov / 2) * (Math.PI / 180);
        const fovCos = Math.cos(fovRadians);

        for (const corner of corners) {
            const toCorner = Vec3.normalize(Vec3.sub(corner, origin));
            const dotProduct = Vec3.dot(headRotation, toCorner);

            if (dotProduct > fovCos) {
                return true; // Corner is within the FOV
            }
        }

        const center = Vec3.average(this.min, this.max);
        const toCenter = Vec3.normalize(Vec3.sub(center, origin));
        const centerDotProduct = Vec3.dot(headRotation, toCenter);

        if (centerDotProduct > fovCos) {
            return true; // Center is within the FOV
        }

        return false; // No corners are visible
    }

    key(): string {
        return `${this.min.x},${this.min.y},${this.min.z},${this.max.x},${this.max.y},${this.max.z}`;
    }
}