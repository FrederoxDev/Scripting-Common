import { Direction, Vector3 } from "@minecraft/server"
import { Vec3 } from "./Vec3";

const CARDINAL_DIRS = [
    Direction.North,
    Direction.East,
    Direction.South,
    Direction.West
]

export const DIRECTIONS = [Direction.North, Direction.East, Direction.South, Direction.West, Direction.Up, Direction.Down];

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

export function DirectionToCardinalString(cardinal: Direction): string {
    return cardinal.toLocaleLowerCase();
}

export function RelativeRotate(lhs: Direction, rhs: Direction): Direction {
    if (lhs === Direction.Up || lhs === Direction.Down) return lhs;
    if (rhs === Direction.Up || rhs === Direction.Down) return rhs;

    const lhsIndex = CARDINAL_DIRS.indexOf(lhs);
    const rhsIndex = CARDINAL_DIRS.indexOf(rhs);

    let newIndex = lhsIndex + rhsIndex;
    if (newIndex >= 4) newIndex -= 4;
    return CARDINAL_DIRS[newIndex]!;
}

export function InverseRelativeRotate(lhs: Direction, rhs: Direction): Direction {
    if (rhs === Direction.Up || rhs === Direction.Down) return rhs;

    const lhsIndex = CARDINAL_DIRS.indexOf(lhs);
    const rhsIndex = CARDINAL_DIRS.indexOf(rhs);

    let newIndex = lhsIndex - rhsIndex;
    if (newIndex < 0) newIndex += 4; 
    return CARDINAL_DIRS[newIndex]!;
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
    const movement = DirectionToVec3(direction);

    return {
        "x": start.x + movement.x * distance,
        "y": start.y + movement.y * distance,
        "z": start.z + movement.z * distance
    }
}

// replaced with Direction.GetYAngle
// export function DirectionToAngle(direction: Direction): number {
//     return {
//         [Direction.South]: 0,
//         [Direction.West]: 90,
//         [Direction.North]: 180,
//         [Direction.East]: 270,
//         [Direction.Up]: 0,
//         [Direction.Down]: 0
//     }[direction];
// }

export function InvertDirection(direction: Direction): Direction {
    return {
        [Direction.North]: Direction.South,
        [Direction.East]: Direction.West,
        [Direction.South]: Direction.North,
        [Direction.West]: Direction.East,
        [Direction.Up]: Direction.Down,
        [Direction.Down]: Direction.Up
    }[direction];
}

export function AreOppositeDirections(dirA: Direction, dirB: Direction): boolean {
    return InvertDirection(dirA) === dirB;
}

export enum Axis {
    X,
    Y,
    Z
}

export function GetAxisOfDirections(dirA: Direction, dirB: Direction): Axis | undefined {
    if (dirA === Direction.Up && dirB === Direction.Down) return Axis.Y;
    if (dirA === Direction.Down && dirB === Direction.Up) return Axis.Y;
    if (dirA === Direction.North && dirB === Direction.South) return Axis.Z;
    if (dirA === Direction.South && dirB === Direction.North) return Axis.Z;
    if (dirA === Direction.East && dirB === Direction.West) return Axis.X;
    if (dirA === Direction.West && dirB === Direction.East) return Axis.X;
    return undefined;
}

export enum AxisDirection {
    Positive,
    Negative
}

export namespace Axis {
    export function ToAxis(direction: Direction): Axis {
        if (direction === Direction.East || direction === Direction.West) {
            return Axis.X;
        }
        if (direction === Direction.Up || direction === Direction.Down) {
            return Axis.Y;
        }
        if (direction === Direction.North || direction === Direction.South) {
            return Axis.Z;
        }
        throw new Error("Invalid direction");
    }

    export function ToDirection(axis: Axis, direction: AxisDirection): Direction {
        if (axis === Axis.X) {
            return direction === AxisDirection.Positive ? Direction.East : Direction.West;
        }
        if (axis === Axis.Y) {
            return direction === AxisDirection.Positive ? Direction.Up : Direction.Down;
        }
        if (axis === Axis.Z) {
            return direction === AxisDirection.Positive ? Direction.South : Direction.North;
        }
        throw new Error("Invalid axis");
    }
}

declare module "@minecraft/server" {
    export namespace Direction {
        export function ToCardinalString(direction: Direction): string;
        export function FromCardinalString(cardinal: string): Direction;

        /**
         * Rotates a Vector3 position assuming its relative to 0,0,0 facing north to the given direction
         * @param vec 
         * @param direction 
         */
        export function RotateVec3(vec: Vector3, direction: Direction): Vector3;

        export function GetYAngle(direction: Direction): number;
        export function GetPerpendicular(direction: Direction): [Direction, Direction];
    }
}

Direction.ToCardinalString = function(direction: Direction): string {
    return direction.toLocaleLowerCase();
}

Direction.FromCardinalString = function(cardinal: string): Direction {
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
    throw new Error(`Bad string '${cardinal}' passed to Direction.FromCardinalString`);
}

Direction.RotateVec3 = function(vec: Vector3, facing: Direction): Vector3 {
    switch (facing) {
        case Direction.North:
            return { ...vec }; // no rotation needed
        case Direction.East:
            return { x: -vec.z, y: vec.y, z: vec.x };
        case Direction.South:
            return { x: -vec.x, y: vec.y, z: -vec.z };
        case Direction.West:
            return { x: vec.z, y: vec.y, z: -vec.x };
        default:
            return { ...vec }; // Up/Down don’t rotate horizontally
    }
}

Direction.GetPerpendicular = function(direction: Direction): [Direction, Direction] {
    switch (direction) {
        case Direction.North:
        case Direction.South:
            return [Direction.East, Direction.West];
        case Direction.East:
        case Direction.West:
            return [Direction.North, Direction.South];
        default:
            return [Direction.East, Direction.West];
    }
}

Direction.GetYAngle = function(direction: Direction): number {
    switch (direction) {
        case Direction.North:
            return 180;
        case Direction.East:
            return 270;
        case Direction.South:
            return 0;
        case Direction.West:
            return 90;
        default:
            return 0;
    }
}