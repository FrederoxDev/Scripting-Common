import { Crypto } from "./Crypto";

export type Range = {
    min: number;
    max: number;
} | number;

function mulberry32(seed: number): () => number {
    return () => {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Has static utilities for generating fully random numbers
 * - Can also be constructed for seeded randomness
 */
export class Random {
    /** Returns a deterministic float [0, 1) for a given 3D position and optional seed. */
    static fromPosition(x: number, y: number, z: number, seed: number = 0): number {
        let h = seed | 0;
        h = Math.imul(h ^ (x | 0), 0x9E3779B9);
        h = Math.imul(h ^ (y | 0), 0x9E3779B9);
        h = Math.imul(h ^ (z | 0), 0x9E3779B9);
        h ^= h >>> 16;
        h = Math.imul(h, 0x45D9F3B);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296;
    }

    static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getRandomIntFromRange(range: Range): number {
        if (typeof range === "number") {
            return range;
        }
        
        return Random.getRandomInt(range.min, range.max);
    }

    private rng: () => number;

    constructor(seed?: number | string) {
        if (seed === undefined) {
            const randomSeed = (Math.random() * 0xffffffff) ^ (Date.now() & 0xffffffff);
            this.rng = mulberry32(randomSeed >>> 0);
        }
        else if (typeof seed === "string") {
            this.rng = mulberry32(Crypto.fnv1a32(seed));
        }
        else {
            this.rng = mulberry32(seed);
        }
    }

    nextFloat(): number {
        return this.rng();
    }

    nextInt(min: number, max: number): number {
        return Math.floor(this.nextFloat() * (max - min + 1)) + min;
    }

    nextIntFromRange(range: Range) {
        if (typeof range === "number") {
            return range;
        }

        return this.nextInt(range.min, range.max);
    }
}