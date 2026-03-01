import { BlockPermutation } from "@minecraft/server"
import { BinaryStream, ReadOnlyBinaryStream } from "./BinaryStream";

export abstract class Palette<T> {
    private nextIndex: number;
    private serializedEntries: string[];
    private indexMap: Map<string, number> = new Map();

    constructor() {
        this.nextIndex = 0;
        this.serializedEntries = [];
    }

    protected abstract serialize(entry: T): string;
    protected abstract deserialize(data: string): T;

    /**
     * Adds an entry to the palette.
     * Returns the index of the entry. If the entry already exists, returns its existing index.
     */
    public add(entry: T): number {
        const serialized = this.serialize(entry);
        const existingIndex = this.indexMap.get(serialized);
        if (existingIndex !== undefined) return existingIndex;

        const index = this.nextIndex;
        this.serializedEntries.push(serialized);
        this.indexMap.set(serialized, index);
        this.nextIndex++;
        return index;
    }

    public get(index: number): T | undefined {
        const data = this.serializedEntries[index];
        if (data === undefined) return undefined;
        return this.deserialize(data);
    }

    get size(): number {
        return this.serializedEntries.length;
    }

    /** Iterate over the raw serialized strings */
    public *rawEntries(): IterableIterator<[number, string]> {
        for (let i = 0; i < this.serializedEntries.length; i++) {
            yield [i, this.serializedEntries[i]!];
        }
    }

    /** Iterate over deserialized entries */
    public *entries(): IterableIterator<[number, T]> {
        for (let i = 0; i < this.serializedEntries.length; i++) {
            yield [i, this.deserialize(this.serializedEntries[i]!)];
        }
    }

    public write(stream: BinaryStream) {
        stream.writeUnsignedVarInt32(this.serializedEntries.length);

        for (const entry of this.serializedEntries) {
            stream.writeString(entry);
        }
    }

    public read(stream: ReadOnlyBinaryStream): void {
        const length = stream.readUnsignedVarInt32();

        this.serializedEntries = [];
        this.indexMap = new Map();
        this.nextIndex = 0;

        for (let i = 0; i < length; i++) {
            const entry = stream.readString();
            this.serializedEntries.push(entry);
            this.indexMap.set(entry, i);
            this.nextIndex++;
        }
    }
}

export class JsonPalette<T> extends Palette<T> {
    protected deserialize(data: string) {
        return JSON.parse(data);
    }

    protected serialize(entry: T): string {
        return JSON.stringify(entry);
    }
}

export interface PalettedBlockPermutation {
    i: string;
    s?: Record<string, string | number | boolean>;
}

export class BlockPalette extends Palette<BlockPermutation> {
    protected deserialize(data: string): BlockPermutation {
        const parsed = JSON.parse(data) as PalettedBlockPermutation;
        return BlockPermutation.resolve(parsed.i, parsed.s);
    }

    protected serialize(entry: BlockPermutation): string {
        const serialized: PalettedBlockPermutation = {
            i: entry.type.id,
        }

        const states = entry.getAllStates();
        if (Object.keys(states).length > 0) {
            serialized.s = states;
        }

        return JSON.stringify(serialized);
    }
}