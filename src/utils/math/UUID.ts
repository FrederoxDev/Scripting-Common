export type UUID = string & { readonly __brand: unique symbol };

/**
 * Generate a random UUID v4 string.
 */
export function uuidv4(): UUID {
    const hex = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');

    return (
        hex() + hex() + '-' +
        hex() + '-' +
        '4' + hex().slice(1, 4) + '-' +
        (Math.floor(Math.random() * 4) + 8).toString(16) + hex().slice(1, 4) + '-' +
        hex() + hex() + hex()
    ) as UUID;
}
