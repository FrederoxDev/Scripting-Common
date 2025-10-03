import { Vector2, Vector3 } from "@minecraft/server";
import { Vec2 } from "./Vec2.js"

export type Vec3Key = string;

export class Vec3 {
    /** @__PURE__ */
    static from(x: number, y: number, z: number): Vector3;
    /** @__PURE__ */
    static from(x: [number, number, number]): Vector3;

    /** @__PURE__ */
    static from(x: number | number[], y?: number, z?: number): Vector3 {
        if (Array.isArray(x)) {
            return { x: x[0], y: x[1], z: x[2] }
        }

        if (typeof x === 'number' && y !== undefined && z !== undefined) {
            return { x, y, z }
        }

        throw new Error("Invalid Arguments");
    }

    /** @__PURE__ */
    static add(lhs: Vector3, rhs: Vector3): Vector3 {
        return {
            x: lhs.x + rhs.x,
            y: lhs.y + rhs.y,
            z: lhs.z + rhs.z
        }
    }

    /** @__PURE__ */
    static addX(lhs: Vector3, rhs: number): Vector3 {
        return {
            x: lhs.x + rhs,
            y: lhs.y,
            z: lhs.z
        }
    }

    /** @__PURE__ */
    static addY(lhs: Vector3, rhs: number): Vector3 {
        return {
            x: lhs.x,
            y: lhs.y + rhs,
            z: lhs.z
        }
    }

        /** @__PURE__ */
    static addZ(lhs: Vector3, rhs: number): Vector3 {
        return {
            x: lhs.x,
            y: lhs.y,
            z: lhs.z + rhs
        }
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

    static isVec3(lhs: unknown): lhs is { x: number; y: number; z: number } {
        return typeof lhs === "object" && 
            lhs !== null && 
            "x" in lhs && 
            "y" in lhs && 
            "z" in lhs;
    }

    static cross(lhs: Vector3, rhs: Vector3): Vector3 {
        return {
            x: lhs.y * rhs.z - lhs.z * rhs.y,
            y: lhs.z * rhs.x - lhs.x * rhs.z,
            z: lhs.x * rhs.y - lhs.y * rhs.x
        };
    }

    static rotateAroundX(lhs: Vector3, degrees: number): Vector3 {
        const radians = degrees * (Math.PI / 180);
    
        const x = lhs.x;
        const y = lhs.y * Math.cos(radians) - lhs.z * Math.sin(radians);
        const z = lhs.y * Math.sin(radians) + lhs.z * Math.cos(radians);
    
        return { x, y, z };
    }

    static rotateAroundY(lhs: Vector3, degrees: number): Vector3 {
        const radians = degrees * (Math.PI / 180);
    
        const x = lhs.x * Math.cos(radians) - lhs.z * Math.sin(radians);
        const y = lhs.y;
        const z = lhs.x * Math.sin(radians) + lhs.z * Math.cos(radians);
    
        return { x, y, z };
    }    

    static rotateAroundZ(lhs: Vector3, degrees: number): Vector3 {
        const radians = degrees * (Math.PI / 180);
    
        const x = lhs.x * Math.cos(radians) - lhs.y * Math.sin(radians);
        const y = lhs.x * Math.sin(radians) + lhs.y * Math.cos(radians);
        const z = lhs.z;
    
        return { x, y, z };
    }

    static sideLengths(lhs: Vector3, rhs: Vector3): Vector3 {
        return {
            x: Math.abs(lhs.x - rhs.x),
            y: Math.abs(lhs.y - rhs.y),
            z: Math.abs(lhs.z - rhs.z)
        }
    }

    static vecLength(lhs: Vector3): number {
        return Math.sqrt(lhs.x * lhs.x + lhs.y * lhs.y + lhs.z * lhs.z);
    }

    static asKey(lhs: Vector3): Vec3Key {
        return `${lhs.x},${lhs.y},${lhs.z}`;
    }

    static fromKey(key: string): Vector3 {
        const components = key.split(",").map(v => Number(v));
        return {
            x: components[0],
            y: components[1],
            z: components[2]
        }
    }

    static min(lhs: Vector3, rhs: Vector3): Vector3 {
        return Vec3.from(
            Math.min(lhs.x, rhs.x),
            Math.min(lhs.y, rhs.y),
            Math.min(lhs.z, rhs.z)
        )
    }

    static max(lhs: Vector3, rhs: Vector3): Vector3 {
        return Vec3.from(
            Math.max(lhs.x, rhs.x),
            Math.max(lhs.y, rhs.y),
            Math.max(lhs.z, rhs.z)
        )
    }

    static dot(lhs: Vector3, rhs: Vector3): number {
        return lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z;
    }

    static normalize(lhs: Vector3): Vector3 {
        const length = Vec3.vecLength(lhs);
        if (length === 0) return Vec3.ZERO;
        return Vec3.div(lhs, length);
    }

    static ZERO = Vec3.from(0, 0, 0);
}