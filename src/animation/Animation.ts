import { Vector3 } from "@minecraft/server";
import { Vec3 } from "../Index";

export type Animation = {
    animation_length: number,
    keyframes: Record<number, Keyframe>
};

export type AnimationActionCallback = () => void;
export type AnimationVariable = number | Vector3;

export type Keyframe = {
    variables?: Record<string, AnimationVariable>,
    actions?: AnimationActionCallback[]
}

export class AnimationInstance {
    animation: Animation;
    elapsed_time: number;

    ordered_frames: number[];
    next_frame_idx: number;

    variables: Record<string, {
        current_value: AnimationVariable,
        current_update_idx: number

        target_value: AnimationVariable,
        target_update_idx: number
    }>;

    callback: AnimationCallback;

    constructor(animation: Animation, callback: AnimationCallback) {
        this.animation = animation;
        this.callback = callback;
        this.elapsed_time = 0.0;
        this.next_frame_idx = 0;
        this.variables = {};
        this.ordered_frames = Object.keys(animation.keyframes)
            .map(key => Number(key))
            .sort((a, b) => a - b);
    }

    getNumber(name: string): number {
        if (this.variables[name] === undefined) 
            throw new Error(`Tried to getNumber from animation where '${name}' does not exist (yet).`);

        const variable = this.variables[name];
        if (typeof variable.current_value !== "number") {
            throw new Error(`Tried to call getNumber on variable of type ${typeof variable.current_value}`);
        }

        const startTime = this.ordered_frames[variable.current_update_idx] * 1000;
        const endTime = this.ordered_frames[variable.target_update_idx] * 1000;

        if (startTime === endTime) {
            return variable.current_value as number;
        }

        const rawT = (this.elapsed_time - startTime) / (endTime - startTime);
        const t = Math.max(0, Math.min(1, rawT));

        return (variable.current_value as number) + ((variable.target_value as number) - (variable.current_value as number)) * t;
    }

    getVector3(name: string): Vector3 {
        if (this.variables[name] === undefined) 
            throw new Error(`Tried to getVector3 from animation where '${name}' does not exist (yet).`);

        const variable = this.variables[name];
        if (!Vec3.isVec3(variable.current_value)) {
            throw new Error(`[getVector3] ${name} was not a Vec3`);
        }

        const startTime = this.ordered_frames[variable.current_update_idx] * 1000;
        const endTime = this.ordered_frames[variable.target_update_idx] * 1000;

        if (startTime === endTime) {
            return variable.current_value as Vector3;
        }

        const rawT = (this.elapsed_time - startTime) / (endTime - startTime);
        const t = Math.max(0, Math.min(1, rawT));
        return Vec3.lerp(variable.current_value as Vector3, variable.target_value as Vector3, t);
    }
}

export type AnimationCallback = (anim: AnimationInstance) => void;