import { Vector3 } from "@minecraft/server";
import { AnimationVariable, Animation, Keyframe, AnimationInstance, AnimationCallback } from "./Animation";

export class AnimationPlayer {
    playingAnimations: AnimationInstance[] = [];
    lastTickTime: number = 0;

    addAnimation(animation: Animation, onTick: AnimationCallback) {
        this.playingAnimations.push(new AnimationInstance(animation, onTick));
    }

    tickAnimations(): void {
        const timeStamp = Date.now();
        let deltaTime = timeStamp - (this.lastTickTime === 0 ? timeStamp : this.lastTickTime);
        this.lastTickTime = timeStamp;

        this.playingAnimations = this.playingAnimations
            .filter(anim => !this._tickAnimation(deltaTime, anim));
    };

    /**
     * @returns Is animation finished?
     */
    private _tickAnimation(deltaTime: number, anim: AnimationInstance): boolean {
        anim.elapsed_time += deltaTime;

        let invokedAnimCallback = false;

        // Handle multiple frames getting passed in one animation tick
        while (
            anim.next_frame_idx < anim.ordered_frames.length && 
            anim.elapsed_time >= anim.ordered_frames[anim.next_frame_idx] * 1000
        ) {
            /** Update all variables */
            this._processFrameVariables(anim, anim.next_frame_idx);

            /** Second invoke the animation callback */
            anim.callback(anim);

            /** Finally invoke any animation actions */
            this._processFrameActions(anim, anim.next_frame_idx);

            /** Move to next frame */
            anim.next_frame_idx++;
            invokedAnimCallback = true;
        }

        /** Only call the callback if we didn't change frame and call it there. */
        if (!invokedAnimCallback) anim.callback(anim);

        // Is animation finished?
        return anim.animation.animation_length * 1000 <= anim.elapsed_time;
    }

    private _processFrameVariables(anim: AnimationInstance, frameIdx: number) {
        const currentFrame = this._getFrame(anim, frameIdx);
        if (currentFrame.variables === undefined) return;

        let variablesToFindNext = Object.keys(currentFrame.variables);
        
        /** Iterate each upcoming frame to find keyframe data */
        for (let i = frameIdx + 1; i < anim.ordered_frames.length; i++) {
            const frame = this._getFrame(anim, i);

            /** This frame only defines acttions */
            if (frame.variables === undefined) continue;

            /** Find the next keyframe which uses this variable */
            variablesToFindNext = variablesToFindNext.filter(name => {
                if (frame.variables![name] === undefined) return true;

                anim.variables[name] = {
                    current_value: currentFrame.variables![name],
                    current_update_idx: frameIdx,
                    target_value: frame.variables![name],
                    target_update_idx: i
                };

                return false;
            })

            // All variables have been found!
            if (variablesToFindNext.length === 0) break;
        }

        /** This variable is never used again, set target and current value to the same */
        variablesToFindNext.forEach(name => {
            anim.variables[name] = {
                current_value: currentFrame.variables![name],
                current_update_idx: frameIdx,
                target_value: currentFrame.variables![name],
                target_update_idx: frameIdx
            }
        });
    }

    private _processFrameActions(anim: AnimationInstance, frameIdx: number) {
        const currentFrame = this._getFrame(anim, frameIdx);
        if (currentFrame.actions === undefined) return;

        /** Call any actions */
        currentFrame.actions.forEach(callback => callback());
    }

    private _getFrame(anim: AnimationInstance, idx: number): Keyframe {
        return anim.animation.keyframes[anim.ordered_frames[idx]];
    }
}