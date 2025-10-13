import { Vector3 } from "@minecraft/server";

export class MathUtils {
    static wrapDegrees(angle: number): number {
        angle = angle % 360;
        if (angle >= 180) angle -= 360;
        if (angle < -180) angle += 360;
        return angle;
    }

    static viewVectorToRotation(forward: Vector3) {
        const hDist = Math.sqrt(forward.x * forward.x + forward.z * forward.z);

        let yaw = Math.atan2(forward.z, forward.x) * 180 / Math.PI - 90;
        let pitch = -Math.atan2(forward.y, hDist) * 180 / Math.PI;

        yaw = MathUtils.wrapDegrees(yaw);
        pitch = MathUtils.wrapDegrees(pitch);

        return { x: pitch, y: yaw }; // Bedrock uses {x: pitch, y: yaw}
    }
}