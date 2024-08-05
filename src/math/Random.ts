/**
 * @param min - The minimum integer value (inclusive).
 * @param max - The maximum integer value (inclusive).
 */
export function RandIntRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}