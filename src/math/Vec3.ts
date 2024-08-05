import { Vector2, Vector3 } from "@minecraft/server";
import { Vec2 } from "./Vec2.js"

export class Vec3 {
    static from(x: number, y: number, z: number): Vector3 {
        return { x, y, z }
    }

    static fromArray(arr: [number, number, number]): Vector3 {
        return { x: arr[0], y: arr[1], z: arr[2]}
    }

    static add(lhs: Vector3, rhs: Vector3): Vector3 {
        return Vec3.from(lhs.x + rhs.x, lhs.y + rhs.y, lhs.z + rhs.z);
    }

    static sub(lhs: Vector3, rhs: Vector3): Vector3 {
        return Vec3.from(lhs.x - rhs.x, lhs.y - rhs.y, lhs.z - rhs.z);
    }

    static divScalar(lhs: Vector3, scalar: number): Vector3 {
        return Vec3.from(lhs.x / scalar, lhs.y / scalar, lhs.z / scalar);
    }

    static equals(lhs: Vector3, rhs: Vector3): boolean {
        return (lhs.x === rhs.x && lhs.y === rhs.y && lhs.z === rhs.z);
    }

    static xz(lhs: Vector3): Vector2 {
        return Vec2.from(lhs.x, lhs.z);
    }

    static floor(lhs: Vector3): Vector3 {
        return Vec3.from(
            Math.floor(lhs.x), 
            Math.floor(lhs.y),
            Math.floor(lhs.z)
        );
    }

    static distance(lhs: Vector3, rhs: Vector3): number {
        const dx = lhs.x - rhs.x;
        const dy = lhs.y - rhs.y;
        const dz = lhs.z - rhs.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    static average(lhs: Vector3, rhs: Vector3): Vector3 {
        return Vec3.from(
            (lhs.x + rhs.x) / 2,
            (lhs.y + rhs.y) / 2,
            (lhs.z + rhs.z) / 2
        )
    }

    static lerp(lhs: Vector3, rhs: Vector3, t: number) {
        return Vec3.from(
            lhs.x + (rhs.x - lhs.x) * t,
            lhs.y + (rhs.y - lhs.y) * t,
            lhs.z + (rhs.z - lhs.z) * t
        )
    }
}