import * as THREE from 'three'
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * VRM Loader Service
 * Handles loading and managing VRM avatar models (VRoid Studio format)
 * Perfect for anime-style VTuber avatars
 */

export class VRMLoader {
  private loader: GLTFLoader
  private currentVRM: VRM | null = null

  constructor() {
    this.loader = new GLTFLoader()
    this.loader.register((parser) => new VRMLoaderPlugin(parser))
  }

  /**
   * Load a VRM model from URL
   */
  async load(url: string): Promise<VRM> {
    try {
      const gltf = await this.loader.loadAsync(url)
      const vrm = gltf.userData.vrm as VRM

      if (!vrm) {
        throw new Error('Invalid VRM file')
      }

      // Rotate model to face camera
      VRMUtils.rotateVRM0(vrm)

      this.currentVRM = vrm

      return vrm
    } catch (error) {
      console.error('Error loading VRM:', error)
      throw error
    }
  }

  /**
   * Get current loaded VRM
   */
  getVRM(): VRM | null {
    return this.currentVRM
  }

  /**
   * Update VRM (call in animation loop)
   */
  update(deltaTime: number) {
    if (this.currentVRM) {
      this.currentVRM.update(deltaTime)
    }
  }

  /**
   * Set facial expression using VRM blendshapes
   */
  setExpression(expression: string, value: number = 1.0) {
    if (!this.currentVRM?.expressionManager) return

    // VRM expression presets
    const expressionMap: { [key: string]: string[] } = {
      happy: ['happy', 'joy'],
      sad: ['sad', 'sorrow'],
      angry: ['angry'],
      surprised: ['surprised'],
      relaxed: ['relaxed', 'neutral'],
      neutral: ['neutral']
    }

    const presets = expressionMap[expression] || ['neutral']

    // Reset all expressions
    Object.keys(this.currentVRM.expressionManager.expressionMap).forEach(key => {
      this.currentVRM?.expressionManager?.setValue(key, 0)
    })

    // Set target expression
    presets.forEach(preset => {
      this.currentVRM?.expressionManager?.setValue(preset, value)
    })
  }

  /**
   * Make avatar look at target position
   */
  lookAt(target: THREE.Vector3) {
    if (this.currentVRM?.lookAt) {
      const targetObject = new THREE.Object3D()
      targetObject.position.copy(target)
      this.currentVRM.lookAt.target = targetObject
    }
  }

  /**
   * Control eye blinking
   */
  setBlink(value: number) {
    if (this.currentVRM?.expressionManager) {
      this.currentVRM.expressionManager.setValue('blink', value)
    }
  }

  /**
   * Control mouth opening for lip sync
   */
  setMouthOpen(value: number) {
    if (this.currentVRM?.expressionManager) {
      // Use 'aa' (あ) mouth shape for speaking
      this.currentVRM.expressionManager.setValue('aa', value * 0.8)
      this.currentVRM.expressionManager.setValue('mouth_open', value)
    }
  }

  /**
   * Get bone by name for manual animation
   */
  getBone(name: string): THREE.Object3D | null {
    if (!this.currentVRM) return null

    return this.currentVRM.humanoid.getRawBoneNode(name as any)
  }

  /**
   * Dispose of VRM resources
   */
  dispose() {
    if (this.currentVRM) {
      VRMUtils.deepDispose(this.currentVRM.scene)
      this.currentVRM = null
    }
  }
}

export const vrmLoader = new VRMLoader()
