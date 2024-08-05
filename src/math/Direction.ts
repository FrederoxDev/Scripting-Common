import { Direction, Vector3 } from "@minecraft/server"
import { Vec3 } from "./Vec3";

const CARDINAL_DIRS = [
    Direction.North,
    Direction.East,
    Direction.South,
    Direction.West
]

export function DirectionFromCardinalString(cardinal: string): Direction {
    const directions: Record<string, Direction> = {
        north: Direction.North,
        east: Direction.East,
        south: Direction.South,
        west: Direction.West,
        up: Direction.Up,
        down: Direction.Down
    }

    const result = directions[cardinal];
    if (result !== undefined) return result;
    throw new Error(`Bad string '${cardinal}' passed to DirectionFromCardinalString`);
}

export function RelativeRotate(lhs: Direction, rhs: Direction): Direction {
    const lhsIndex = CARDINAL_DIRS.indexOf(lhs);
    const rhsIndex = CARDINAL_DIRS.indexOf(rhs);

    let newIndex = lhsIndex + rhsIndex;
    if (newIndex >= 4) newIndex -= 4;
    return CARDINAL_DIRS[newIndex];
}

export function DirectionToVec3(direction: Direction) {
    return {
        [Direction.North]: Vec3.from(0, 0, -1),
        [Direction.East]: Vec3.from(1, 0, 0),
        [Direction.South]: Vec3.from(0, 0, 1),
        [Direction.West]: Vec3.from(-1, 0, 0),
        [Direction.Up]: Vec3.from(0, 1, 0),
        [Direction.Down]: Vec3.from(0, -1, 0)
    }[direction];
}

export function MoveInDirectionFrom(start: Vector3, direction: Direction, distance: number): Vector3 {
    let movement = DirectionToVec3(direction);

    return {
        "x": start.x + movement.x * distance,
        "y": start.y + movement.y * distance,
        "z": start.z + movement.z * distance
    }
}