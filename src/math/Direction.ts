import { Direction, Vector3 } from "@minecraft/server"
import { Vec3 } from "./Vec3";

const CARDINAL_DIRS = [
    Direction.North,
    Direction.East,
    Direction.South,
    Direction.West
]

export function DirectionFromCardinalString(cardinal: string): Direction {
    if (cardinal == "north") return Direction.North;
    else if (cardinal == "east") return Direction.East;
    else if (cardinal == "south") return Direction.South;
    else if (cardinal == "west") return Direction.West;
    throw new Error(`Unexpected string '${cardinal}' passed to DirectionFromCardinalString`);
}

export function RelativeRotate(lhs: Direction, rhs: Direction): Direction {
    const lhsIndex = CARDINAL_DIRS.indexOf(lhs);
    const rhsIndex = CARDINAL_DIRS.indexOf(rhs);

    let newIndex = lhsIndex + rhsIndex;
    if (newIndex >= 4) newIndex -= 4;
    return CARDINAL_DIRS[newIndex];
}

const DIRECTION_TO_VEC = {
    [Direction.North]: Vec3.from(0, 0, -1),
    [Direction.East]: Vec3.from(1, 0, 0),
    [Direction.South]: Vec3.from(0, 0, 1),
    [Direction.West]: Vec3.from(-1, 0, 0),
    [Direction.Up]: Vec3.from(0, 1, 0),
    [Direction.Down]: Vec3.from(0, -1, 0)
}


export function MoveInDirectionFrom(start: Vector3, direction: Direction, distance: number): Vector3 {
    let movement = DIRECTION_TO_VEC[direction];

    return {
        "x": start.x + movement.x * distance,
        "y": start.y + movement.y * distance,
        "z": start.z + movement.z * distance
    }
}