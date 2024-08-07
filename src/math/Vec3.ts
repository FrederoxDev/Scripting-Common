import { Vector2, Vector3 } from "@minecraft/server";
import { Vec2 } from "./Vec2.js"

export class Vec3 {
    static from(x: number, y: number, z: number): Vector3;
    static from(x: [number, number, number]): Vector3;

    static from(x: number | number[], y?: number, z?: number): Vector3 {
        if (Array.isArray(x)) {
            return { x: x[0], y: x[1], z: x[2] }
        }

        if (typeof x === 'number' && y !== undefined && z !== undefined) {
            return { x, y, z }
        }

        throw new Error("Invalid Arguments");
    }

    static add(lhs: Vector3, rhs: Vector3): Vector3 {
        return Vec3.from(lhs.x + rhs.x, lhs.y + rhs.y, lhs.z + rhs.z);
    }

    static sub(lhs: Vector3, rhs: Vector3): Vector3 {
        return Vec3.from(lhs.x - rhs.x, lhs.y - rhs.y, lhs.z - rhs.z);
    }

    static div(lhs: Vector3, rhs: Vector3): Vector3;
    static div(lhs: Vector3, rhs: number): Vector3;

    static div(lhs: Vector3, rhs: Vector3 | number): Vector3 {
        if (typeof rhs === "number") {
            return Vec3.from(lhs.x / rhs, lhs.y / rhs, lhs.z / rhs);
        }
        else {
            return Vec3.from(lhs.x / rhs.x, lhs.y / rhs.y, lhs.z / rhs.z);
        }
    }

    static mul(lhs: Vector3, rhs: Vector3): Vector3;
    static mul(lhs: Vector3, rhs: number): Vector3;

    static mul(lhs: Vector3, rhs: Vector3 | number): Vector3 {
        if (typeof rhs === "number") {
            return Vec3.from(lhs.x * rhs, lhs.y * rhs, lhs.z * rhs);
        }
        else {
            return Vec3.from(lhs.x * rhs.x, lhs.y * rhs.y, lhs.z * rhs.z);
        }
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

    static isVec3(lhs: any): boolean {
        return typeof lhs === "object" && lhs["x"] !== undefined && lhs["y"] !== undefined && lhs["z"] !== undefined;
    }
}