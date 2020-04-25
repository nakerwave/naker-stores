import { SystemAnimation } from '@naker/services/System/systemAnimation';

import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Color3, Color4, Vector3, Vector2 } from '@babylonjs/core/Maths/math';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalcamera';
import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture';

import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';
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

export class System extends SystemAnimation {
  
    /**
     * Creates a new System
     * @param canvas Element where the scene will be drawn
     */
    constructor(canvas: HTMLCanvasElement) {
        super(canvas)

        this.paramScene();
        // this.addLight();

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    size = 300;
    paramScene() {
        this.scene.ambientColor = new Color3(0.0, 0.0, 0.0);
        this.scene.clearColor = new Color4(0.0, 0.0, 0.0, 0.0);
        // this.scene.autoClear = false; // Color buffer
        // this.scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously
        this.scene.blockfreeActiveMeshesAndRenderingGroups = true;
        this.scene.fogEnabled = true;

        this.sceneAdvancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("scene", true, this.scene);
        // Can't freeze because of particles
        // Can't blockMaterialDirtyMechanism because of PBR
        // this.scene.blockMaterialDirtyMechanism = true;
        // this.scene.setRenderingAutoClearDepthStencil(renderingGroupIdx, autoClear, depth, stencil);
        this.setCamera();
        
        this.setLimitFPS(true);

        // setInterval(() => {
        //     let fps = this.engine.getFps();
        //     if (fps < 50) this.setLimitFPS(true);
        //     else this.setLimitFPS(false);
        // }, 1000);
    }

    shadowGenerator: ShadowGenerator;
    light: DirectionalLight;
    addLight() {
        this.light = new DirectionalLight('light', new Vector3(-1, -2, -1), this.scene);
        this.light.intensity = 1;
        console.log(this.light);
        
        this.scene.shadowsEnabled = true;
        this.shadowGenerator = new ShadowGenerator(4096, this.light);
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