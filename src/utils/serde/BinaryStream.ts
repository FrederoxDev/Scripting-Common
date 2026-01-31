import { Entity, ItemStack, World } from "@minecraft/server";
import { assert } from "../error/Error";

const Base64 = {
  _chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",

  encode(bytes: Uint8Array): string {
    let output = "";
    let i = 0;
    const len = bytes.length;

    while (i < len) {
      const b1 = bytes[i++] ?? 0;
      const b2 = i < len ? bytes[i++]! : 0;
      const b3 = i < len ? bytes[i++]! : 0;

      const enc1 = b1 >> 2;
      const enc2 = ((b1 & 3) << 4) | (b2 >> 4);
      const enc3 = ((b2 & 15) << 2) | (b3 >> 6);
      const enc4 = b3 & 63;

      if (i - 1 > len) {
        output += this._chars.charAt(enc1) + this._chars.charAt(enc2) + "==";
      } else if (i > len) {
        output += this._chars.charAt(enc1) + this._chars.charAt(enc2) + this._chars.charAt(enc3) + "=";
      } else {
        output += this._chars.charAt(enc1) + this._chars.charAt(enc2) + this._chars.charAt(enc3) + this._chars.charAt(enc4);
      }
    }

    // Fix padding (more precise)
    const pad = len % 3;
    if (pad === 1) output = output.slice(0, -2) + "==";
    else if (pad === 2) output = output.slice(0, -1) + "=";

    return output;
  },

  decode(base64: string): Uint8Array {
    const chars = this._chars;
    let str = base64.replace(/[^A-Za-z0-9+/=]/g, "");
    let output = [];
    let i = 0;

    while (i < str.length) {
      const enc1 = chars.indexOf(str.charAt(i++));
      const enc2 = chars.indexOf(str.charAt(i++));
      const enc3 = chars.indexOf(str.charAt(i++));
      const enc4 = chars.indexOf(str.charAt(i++));

      const b1 = (enc1 << 2) | (enc2 >> 4);
      const b2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      const b3 = ((enc3 & 3) << 6) | enc4;

      output.push(b1);
      if (enc3 !== 64 && str.charAt(i - 2) !== "=") output.push(b2);
      if (enc4 !== 64 && str.charAt(i - 1) !== "=") output.push(b3);
    }

    return new Uint8Array(output);
  }
};

const UTF8 = {
    encode(str: string): Uint8Array {
        const bytes: number[] = [];
        for (let i = 0; i < str.length; i++) {
            let code = str.charCodeAt(i);

            // Handle surrogate pairs for characters outside BMP
            if (code >= 0xd800 && code <= 0xdbff) { // high surrogate
                const hi = code;
                const lo = str.charCodeAt(++i); // low surrogate
                code = ((hi - 0xd800) << 10) + (lo - 0xdc00) + 0x10000;
            }

            if (code <= 0x7F) {
                bytes.push(code);
            } else if (code <= 0x7FF) {
                bytes.push(0xC0 | (code >> 6));
                bytes.push(0x80 | (code & 0x3F));
            } else if (code <= 0xFFFF) {
                bytes.push(0xE0 | (code >> 12));
                bytes.push(0x80 | ((code >> 6) & 0x3F));
                bytes.push(0x80 | (code & 0x3F));
            } else {
                bytes.push(0xF0 | (code >> 18));
                bytes.push(0x80 | ((code >> 12) & 0x3F));
                bytes.push(0x80 | ((code >> 6) & 0x3F));
                bytes.push(0x80 | (code & 0x3F));
            }
        }
        return new Uint8Array(bytes);
    },

    decode(bytes: Uint8Array): string {
        let str = "";
        for (let i = 0; i < bytes.length; ) {
            const b1 = bytes[i++];

            if (b1 < 0x80) {
                str += String.fromCharCode(b1);
            } else if ((b1 & 0xE0) === 0xC0) {
                const b2 = bytes[i++];
                str += String.fromCharCode(((b1 & 0x1F) << 6) | (b2 & 0x3F));
            } else if ((b1 & 0xF0) === 0xE0) {
                const b2 = bytes[i++];
                const b3 = bytes[i++];
                str += String.fromCharCode(
                    ((b1 & 0x0F) << 12) |
                    ((b2 & 0x3F) << 6) |
                    (b3 & 0x3F)
                );
            } else if ((b1 & 0xF8) === 0xF0) {
                const b2 = bytes[i++];
                const b3 = bytes[i++];
                const b4 = bytes[i++];
                let codepoint = 
                    ((b1 & 0x07) << 18) |
                    ((b2 & 0x3F) << 12) |
                    ((b3 & 0x3F) << 6) |
                    (b4 & 0x3F);
                // convert to surrogate pair
                codepoint -= 0x10000;
                str += String.fromCharCode(
                    0xD800 + ((codepoint >> 10) & 0x3FF),
                    0xDC00 + (codepoint & 0x3FF)
                );
            }
        }
        return str;
    }
};

export class BinaryStream {
    private buffer: ArrayBuffer;
    private view: DataView;
    private offset: number;

    constructor(size: number = 1024) {
        this.buffer = new ArrayBuffer(size);
        this.view = new DataView(this.buffer);
        this.offset = 0;
    }

    private ensureCapacity(bytes: number) {
        if (this.offset + bytes <= this.buffer.byteLength) return;
        const newBuffer = new ArrayBuffer((this.buffer.byteLength + bytes) * 2);
        new Uint8Array(newBuffer).set(new Uint8Array(this.buffer));
        this.buffer = newBuffer;
        this.view = new DataView(this.buffer);
    }

    writeInt8(value: number) {
        this.ensureCapacity(1);
        this.view.setInt8(this.offset, value);
        this.offset += 1;
    }

    writeUint8(value: number) {
        this.ensureCapacity(1);
        this.view.setUint8(this.offset, value);
        this.offset += 1;
    }

    writeInt16(value: number) {
        this.ensureCapacity(2);
        this.view.setInt16(this.offset, value, true);
        this.offset += 2;
    }

    writeUint16(value: number) {
        this.ensureCapacity(2);
        this.view.setUint16(this.offset, value, true);
        this.offset += 2;
    }

    writeUint32(value: number) {
        this.ensureCapacity(4);
        this.view.setUint32(this.offset, value, true);
        this.offset += 4;
    }

    writeInt32(value: number) {
        this.ensureCapacity(4);
        this.view.setInt32(this.offset, value, true);
        this.offset += 4;
    }
    
    writeFloat32(value: number) {
        this.ensureCapacity(4);
        this.view.setFloat32(this.offset, value, true);
        this.offset += 4;
    }

    writeFloat64(value: number) {
        this.ensureCapacity(8);
        this.view.setFloat64(this.offset, value, true);
        this.offset += 8;
    }

    writeString(value: string) {
        const encoded = UTF8.encode(value);
        this.writeUnsignedVarInt32(encoded.length);
        this.ensureCapacity(encoded.length);
        new Uint8Array(this.buffer, this.offset, encoded.length).set(encoded);
        this.offset += encoded.length;
    }

    writeUnsignedVarInt32(value: number) {
        value >>>= 0; 
        while (value > 0x7F) {
            this.writeUint8((value & 0x7F) | 0x80);
            value >>>= 7;
        }
        this.writeUint8(value);
    }

    writeSignedVarInt32(value: number) {
        const zigzagged = (value << 1) ^ (value >> 31);
        this.writeUnsignedVarInt32(zigzagged);
    }

    writeUnsignedVarInt16(value: number) {
        value &= 0xFFFF; // Ensure 16-bit
        while (value > 0x7F) {
            this.writeUint8((value & 0x7F) | 0x80);
            value >>>= 7;
        }
        this.writeUint8(value);
    }

    writeSignedVarInt16(value: number) {
        // ZigZag encode signed 16-bit
        const zigzagged = (value << 1) ^ (value >> 15);
        this.writeUnsignedVarInt16(zigzagged);
    }

    writeBigInt64(value: bigint) {
        this.ensureCapacity(8);
        this.view.setBigInt64(this.offset, value, true); // little-endian
        this.offset += 8;
    }

    writeBigUint64(value: bigint) {
        this.ensureCapacity(8);
        this.view.setBigUint64(this.offset, value, true);
        this.offset += 8;
    }

    getBytes(): Uint8Array {
        return new Uint8Array(this.buffer, 0, this.offset);
    }

    toBase64(): string {
        const bytes = this.getBytes();
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return Base64.encode(new Uint8Array(binary.split("").map(c => c.charCodeAt(0))));
    }

    static fromReadOnlyStream(stream: ReadOnlyBinaryStream): BinaryStream {
        const bytes = stream.getBytes();
        const binaryStream = new BinaryStream(bytes.length);
        new Uint8Array(binaryStream.buffer).set(bytes);
        binaryStream.offset = bytes.length;
        return binaryStream;
    }
}

export class ReadOnlyBinaryStream {
    private view: DataView;
    private offset: number = 0;
    private length: number;

    constructor(buffer: ArrayBuffer);
    constructor(base64: string);

    constructor(bufferOrStr: ArrayBuffer | string) {
        let buffer: ArrayBuffer;

        if (typeof bufferOrStr === "string") {
            const decoded = Base64.decode(bufferOrStr);
            buffer = decoded.buffer as ArrayBuffer;
        } else {
            buffer = bufferOrStr;
        }

        this.view = new DataView(buffer);
        this.length = buffer.byteLength;
    }

    private ensureAvailable(bytes: number) {
        if (this.offset + bytes > this.length) throw new Error("Read out of bounds");
    }

    readInt8(): number {
        this.ensureAvailable(1);
        const val = this.view.getInt8(this.offset);
        this.offset += 1;
        return val;
    }

    readUint8(): number {
        this.ensureAvailable(1);
        const val = this.view.getUint8(this.offset);
        this.offset += 1;
        return val;
    }

    readInt16(): number {
        this.ensureAvailable(2);
        const val = this.view.getInt16(this.offset, true);
        this.offset += 2;
        return val;
    }

    readUint16(): number {
        this.ensureAvailable(2);
        const val = this.view.getUint16(this.offset, true);
        this.offset += 2;
        return val;
    }

    readInt32(): number {
        this.ensureAvailable(4);
        const val = this.view.getInt32(this.offset, true);
        this.offset += 4;
        return val;
    }

    readUint32(): number {
        this.ensureAvailable(4);
        const val = this.view.getUint32(this.offset, true);
        this.offset += 4;
        return val;
    }

    readFloat32(): number {
        this.ensureAvailable(4);
        const val = this.view.getFloat32(this.offset, true);
        this.offset += 4;
        return val;
    }

    readFloat64(): number {
        this.ensureAvailable(8);
        const val = this.view.getFloat64(this.offset, true);
        this.offset += 8;
        return val;
    }

    readString(): string {
        const length = this.readUnsignedVarInt32();
        this.ensureAvailable(length);
        const bytes = new Uint8Array(this.view.buffer, this.offset, length);
        this.offset += length;
        return UTF8.decode(bytes);
    }

    readUnsignedVarInt32(): number {
        let result = 0;
        let shift = 0;
        let byte: number;

        do {
            byte = this.readUint8();
            result |= (byte & 0x7F) << shift;
            shift += 7;
            if (shift > 35) throw new Error("VarInt too big");
        } while (byte & 0x80);

        return result >>> 0;
    }

    readSignedVarInt32(): number {
        const unsigned = this.readUnsignedVarInt32();
        return (unsigned >>> 1) ^ -(unsigned & 1);
    }

    readUnsignedVarInt16(): number {
        let result = 0;
        let shift = 0;
        let byte: number;

        do {
            byte = this.readUint8();
            result |= (byte & 0x7F) << shift;
            shift += 7;
            if (shift > 16) throw new Error("VarInt16 too big");
        } while (byte & 0x80);

        return result & 0xFFFF;
    }

    readSignedVarInt16(): number {
        const unsigned = this.readUnsignedVarInt16();
        // ZigZag decode
        return (unsigned >>> 1) ^ -(unsigned & 1);
    }

    readBigInt64(): bigint {
        this.ensureAvailable(8);
        const val = this.view.getBigInt64(this.offset, true);
        this.offset += 8;
        return val;
    }

    readBigUint64(): bigint {
        this.ensureAvailable(8);
        const val = this.view.getBigUint64(this.offset, true);
        this.offset += 8;
        return val;
    }

    getBytes(): Uint8Array {
        return new Uint8Array(this.view.buffer, 0, this.length);
    }

    toBase64(): string {
        const bytes = new Uint8Array(this.view.buffer, 0, this.length);

        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        return Base64.encode(new Uint8Array(binary.split("").map(c => c.charCodeAt(0))));
    }
}

export class BinaryDynamicPropertyAccessor {
    baseName: string;

    constructor(propertyName: string) {
        this.baseName = propertyName;
    }

    // --- Write a BinaryStream into multiple dynamic properties safely ---
    write(entity: Entity | World | ItemStack, stream: BinaryStream, chunkSize = 32_000): void {
        const base64 = stream.toBase64(); // encode once
        const chunks: string[] = [];

        // Split Base64 into safe-sized chunks
        for (let i = 0; i < base64.length; i += chunkSize) {
            chunks.push(base64.slice(i, i + chunkSize));
        }

        const numProps = chunks.length;
        assert(numProps <= 256, `Too many dynamic properties: ${numProps}`);

        // Store number of chunks in first property
        entity.setDynamicProperty(this.baseName, String(numProps));

        // Store all chunks in separate properties
        for (let i = 0; i < numProps; i++) {
            entity.setDynamicProperty(`${this.baseName}_${i}`, chunks[i]);
        }
    }

    // --- Read the BinaryStream back ---
    read(entity: Entity | World | ItemStack): ReadOnlyBinaryStream | undefined {
        const countStr = entity.getDynamicProperty(this.baseName) as string | undefined;
        if (!countStr) return undefined;

        const numProps = parseInt(countStr, 10);
        if (isNaN(numProps) || numProps <= 0) return undefined;

        const chunks: string[] = [];
        for (let i = 0; i < numProps; i++) {
            const chunk = entity.getDynamicProperty(`${this.baseName}_${i}`) as string | undefined;
            if (chunk === undefined) {
                throw new Error(`Missing dynamic property chunk: ${this.baseName}_${i}`);
            }
            chunks.push(chunk);
        }

        // Combine all chunks and decode
        const fullBase64 = chunks.join("");
        return new ReadOnlyBinaryStream(fullBase64);
    }
}