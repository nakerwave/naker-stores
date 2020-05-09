import { SystemQuality } from '@naker/services/System/systemQuality';

import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Color3, Color4, Vector3, Vector2 } from '@babylonjs/core/Maths/math';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalcamera';
import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture';

import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';
import { RenderTargetTexture } from '@babylonjs/core/Materials/Textures/renderTargetTexture';
import { CascadedShadowGenerator } from '@babylonjs/core/Lights/Shadows/cascadedShadowGenerator';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { SpotLight } from '@babylonjs/core/Lights/spotLight';
import { Camera } from '@babylonjs/core/Cameras/camera';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class System extends SystemQuality {
  
    /**
     * Creates a new System
     * @param canvas Element where the scene will be drawn
     */
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        
        this.paramScene();
        // this.addLight();
        this.setHorizontalFixed(true);
    }

    paramScene() {
        this.scene.ambientColor = new Color3(0.0, 0.0, 0.0);
        this.scene.clearColor = new Color4(0.0, 0.0, 0.0, 0.0);

        // this.scene.autoClear = false; // Color buffer
        // this.scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously
        // this.scene.blockfreeActiveMeshesAndRenderingGroups = true;
        this.scene.fogEnabled = true;

        // Can't freeze because of particles
        // Can't blockMaterialDirtyMechanism because of PBR
        // this.scene.blockMaterialDirtyMechanism = true;
        // this.scene.setRenderingAutoClearDepthStencil(renderingGroupIdx, autoClear, depth, stencil);
        this.setCamera();
        this.setLimitFPS(true);
        // this.optimize();
        this.improveQualityAtBreak(true);
    }

    shadowGenerator: ShadowGenerator;
    light: SpotLight;
    addLight() {
        this.light = new SpotLight("spot", new Vector3(-20, 100, -20),
            new Vector3(0.5, -2, 0.5), 2, 16, this.scene);
        // this.light = new DirectionalLight("spot", new Vector3(-2, -10, -2), this.scene);
        // this.light.position = new Vector3(-40, 100, -40);
        this.light.intensity = 10000;
        
        this.scene.shadowsEnabled = true;
        let shadowQuality = 2;
        let shadowRatio = Math.pow(2, shadowQuality);
        this.shadowGenerator = new ShadowGenerator(1024 * shadowRatio, this.light);
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.useKernelBlur = true;
        this.shadowGenerator.blurKernel = 64 / shadowRatio;
        console.log(this.shadowGenerator);
        
        // this.light.autoUpdateExtends = false;
        // this.shadowGenerator.getShadowMap().refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
    }

    updateShadows() {
        if (!this.shadowGenerator) return; 
        // this.light.isEnabled(true);
        // this.shadowGenerator.getShadowMap().refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONEVERYFRAME;
        // this.light.autoUpdateExtends = true;
        // this.scene.render();
        // this.shadowGenerator.getShadowMap().refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
        // this.light.autoUpdateExtends = false;
        // this.light.isEnabled(false);
    }
    
    camera: ArcRotateCamera;
    setCamera() {
        let test = new UniversalCamera('camera', Vector3.Zero(), this.scene);
        this.camera = new ArcRotateCamera('camera', 0, Math.PI/3, 100, Vector3.Zero(), this.scene);
        this.scene.activeCamera = this.camera;
        this.camera.minZ = 0;
        this.camera.setTarget(Vector3.Zero());
        // this.camera.attachControl(this.canvas);
        
        // this.camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
        // let aspect = this.scene.getEngine().getAspectRatio(this.camera);
        // let ortho = 30;
        // this.camera.orthoTop = ortho;
        // this.camera.orthoBottom = -ortho;
        // this.camera.orthoLeft = -ortho * aspect;
        // this.camera.orthoRight = ortho * aspect;
    }

    center = Vector2.Zero();
    setCenter(center: Vector2) {
        this.center = center;
    }

    /**
    * Tell if system currently rendering scene
    */
    rendering = false;

    /**
    * Tell if scene needs to be render
    */
    started = false;

    checkActiveMeshes() {
        this.scene.unfreezeActiveMeshes();
        this.scene.freezeActiveMeshes();
    }
}