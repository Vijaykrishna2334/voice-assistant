// VRoid Pose Loader Service
// Loads .vroidpose files and applies them to VRM models

import * as THREE from 'three'
import type { VRM } from '@pixiv/three-vrm'

export interface VRoidPose {
    Version: number
    LeftHandAnimationName: string
    RightHandAnimationName: string
    BoneDefinition: {
        [boneName: string]: {
            x: number
            y: number
            z: number
            w?: number // Quaternion w component
        }
    }
}

export interface LoadedPose {
    name: string
    data: VRoidPose
}

class VRoidPoseLoader {
    private poses: Map<string, VRoidPose> = new Map()
    private loading: boolean = false

    /**
     * Load all poses from the public folder
     */
    async loadAllPoses(): Promise<void> {
        if (this.loading) return
        this.loading = true

        const poseFiles = [
            'Pose 1', 'Pose 2', 'Pose 3', 'Pose 4', 'Pose 5', 'Pose 6',
            'Pose 7', 'Pose 8', 'Pose 9', 'Pose 10', 'Pose 11', 'Pose 12',
            'Pose 13', 'Pose 14', 'Pose 15', 'Pose 16'
        ]

        try {
            const loadPromises = poseFiles.map(async (poseName) => {
                try {
                    const response = await fetch(`/${poseName}.vroidpose`)
                    if (!response.ok) {
                        console.warn(`Failed to load ${poseName}`)
                        return
                    }
                    const data: VRoidPose = await response.json()
                    this.poses.set(poseName, data)
                    console.log(`✅ Loaded ${poseName}`)
                } catch (error) {
                    console.error(`Error loading ${poseName}:`, error)
                }
            })

            await Promise.all(loadPromises)
            console.log(`🎉 Loaded ${this.poses.size} poses successfully!`)
        } finally {
            this.loading = false
        }
    }

    /**
     * Get a pose by name
     */
    getPose(name: string): VRoidPose | undefined {
        return this.poses.get(name)
    }

    /**
     * Apply a pose to a VRM model
     */
    applyPose(vrm: VRM, poseName: string, weight: number = 1.0): boolean {
        const pose = this.poses.get(poseName)
        if (!pose) {
            console.warn(`Pose ${poseName} not found`)
            return false
        }

        try {
            // Apply bone rotations from the pose
            Object.entries(pose.BoneDefinition).forEach(([boneName, rotation]) => {
                // Map VRoid bone names to VRM humanoid bone names
                const vrmBoneName = this.mapBoneName(boneName)
                if (!vrmBoneName) return

                const bone = vrm.humanoid.getRawBoneNode(vrmBoneName as any)
                if (!bone) return

                // Apply quaternion rotation
                if (rotation.w !== undefined) {
                    const targetQuat = new THREE.Quaternion(
                        rotation.x,
                        rotation.y,
                        rotation.z,
                        rotation.w
                    )

                    if (weight < 1.0) {
                        // Interpolate with current rotation
                        bone.quaternion.slerp(targetQuat, weight)
                    } else {
                        // Apply directly
                        bone.quaternion.copy(targetQuat)
                    }
                }
            })

            return true
        } catch (error) {
            console.error(`Error applying pose ${poseName}:`, error)
            return false
        }
    }

    /**
     * Interpolate between two poses
     */
    interpolatePoses(
        vrm: VRM,
        fromPose: string,
        toPose: string,
        t: number
    ): boolean {
        const pose1 = this.poses.get(fromPose)
        const pose2 = this.poses.get(toPose)

        if (!pose1 || !pose2) {
            console.warn(`Cannot interpolate: poses not found`)
            return false
        }

        try {
            // Get all bone names from both poses
            const boneNames = new Set([
                ...Object.keys(pose1.BoneDefinition),
                ...Object.keys(pose2.BoneDefinition)
            ])

            boneNames.forEach((boneName) => {
                const vrmBoneName = this.mapBoneName(boneName)
                if (!vrmBoneName) return

                const bone = vrm.humanoid.getRawBoneNode(vrmBoneName as any)
                if (!bone) return

                const rot1 = pose1.BoneDefinition[boneName]
                const rot2 = pose2.BoneDefinition[boneName]

                if (rot1?.w !== undefined && rot2?.w !== undefined) {
                    const quat1 = new THREE.Quaternion(rot1.x, rot1.y, rot1.z, rot1.w)
                    const quat2 = new THREE.Quaternion(rot2.x, rot2.y, rot2.z, rot2.w)

                    // SLERP between the two rotations
                    bone.quaternion.copy(quat1).slerp(quat2, t)
                }
            })

            return true
        } catch (error) {
            console.error('Error interpolating poses:', error)
            return false
        }
    }

    /**
     * Map VRoid bone names to VRM humanoid bone names
     */
    private mapBoneName(vroidName: string): string | null {
        const mapping: { [key: string]: string } = {
            'Hips': 'hips',
            'Spine': 'spine',
            'Chest': 'chest',
            'UpperChest': 'upperChest',
            'Neck': 'neck',
            'Head': 'head',
            'LeftShoulder': 'leftShoulder',
            'LeftUpperArm': 'leftUpperArm',
            'LeftLowerArm': 'leftLowerArm',
            'LeftHand': 'leftHand',
            'RightShoulder': 'rightShoulder',
            'RightUpperArm': 'rightUpperArm',
            'RightLowerArm': 'rightLowerArm',
            'RightHand': 'rightHand',
            'LeftUpperLeg': 'leftUpperLeg',
            'LeftLowerLeg': 'leftLowerLeg',
            'LeftFoot': 'leftFoot',
            'LeftToes': 'leftToes',
            'RightUpperLeg': 'rightUpperLeg',
            'RightLowerLeg': 'rightLowerLeg',
            'RightFoot': 'rightFoot',
            'RightToes': 'rightToes'
        }

        return mapping[vroidName] || null
    }

    /**
     * Get list of loaded pose names
     */
    getLoadedPoses(): string[] {
        return Array.from(this.poses.keys())
    }

    /**
     * Check if poses are loaded
     */
    isLoaded(): boolean {
        return this.poses.size > 0
    }
}

// Export singleton instance
export const vroidPoseLoader = new VRoidPoseLoader()
