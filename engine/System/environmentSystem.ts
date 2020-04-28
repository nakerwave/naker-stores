import '@babylonjs/core/Animations/animatable';
import '@babylonjs/core/Materials/Textures/Loaders/envTextureLoader';

import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Color3, Vector3, Vector2 } from '@babylonjs/core/Maths/math';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { CubeTexture } from '@babylonjs/core/Materials/Textures/cubetexture';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer';

// import sparkleTexture from '../../asset/star_08.png';
// import smokeTexture from '../../asset/smoke_04.png';
// import circleTexture from '../../asset/circle_05.png';
// import offlineEnvTexture from '../../asset/ENV/mapcolor5.env';
import remove from 'lodash/remove';

import { System } from './system';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class EnvironmentSystem extends System {

    /**
     * BabylonJS starGlowLayer
     */
    starGlowLayer: GlowLayer;

    /**
     * BabylonJS starGlowLayer
     */
    dustGlowLayer: GlowLayer;

    /**
     * BabylonJS Skybox
     */
    skybox: Mesh;

    /**
     * BabylonJS Skybox Material
     */
    skyboxMaterial: PBRMaterial;

    // sparkleTexture: Texture;
    // smokeTexture: Texture;
    // circleTexture: Texture;

    /**
     * Creates a new System
     * @param canvas Element where the scene will be drawn
     */
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        // Glow layer takes too much performance
        // this.addGlow();
        // this.addSky();
        // this.addGroundMaterial();
        // this.sparkleTexture = new Texture(sparkleTexture, this.scene);
        // this.smokeTexture = new Texture(smokeTexture, this.scene);
        // this.circleTexture = new Texture(circleTexture, this.scene);
    }

    addGlow() {
        this.starGlowLayer = new GlowLayer("glow", this.scene, {
            mainTextureFixedSize: 2,
            blurKernelSize: 32
        });
        this.starGlowLayer.intensity = 100;
        // let int = 0;
        // this.scene.registerBeforeRender(() => {
        //     this.starGlowLayer.intensity = 100 + Math.cos(int / 20) * 10;
        //     int++;
        // });
    }

    addSky() {
        this.skybox = MeshBuilder.CreateSphere("sbsphere", { diameter: 32 }, this.scene);
        this.skybox.scaling = new Vector3(this.size + 20, this.size + 20, this.size + 20);
        this.skyboxMaterial = new PBRMaterial("skyBox", this.scene);
        this.skyboxMaterial.backFaceCulling = false;
        this.skyboxMaterial.roughness = 0.2;
        this.skybox.material = this.skyboxMaterial;
        
        // let alpha = 0;
        // this.scene.registerBeforeRender(() => {
        //     alpha += 0.01;
        //     this.scene.environmentTexture.setReflectionTextureMatrix(Matrix.RotationY(alpha));
        // });
    }

    sceneTexture: CubeTexture;
    setSky(callback?: Function) {
        let asseturl = 'https://d2uret4ukwmuoe.cloudfront.net/environment_v1/';
        let envUrl = asseturl + 'sky_light.env';
        // let envUrl = offlineEnvTexture;
        this.sceneTexture = new CubeTexture(envUrl, this.scene, null, false, null, () => {
            // this.sceneTexture.gammaSpace = false;
            this.scene.environmentTexture = this.sceneTexture;
            console.log(this.scene.environmentTexture);
            
            this.scene.environmentTexture.level = 0.00001;
            // this.skyboxMaterial.reflectionTexture = this.sceneTexture.clone();
            // this.skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
            // this.groundMaterial.reflectionTexture = this.sceneTexture.clone();
            this.sendToSkyChangeListeners();
            if (callback) callback();
        });
    }

    listeners: Array<Function> = [];
    addSkyChangeListener(callback: Function) {
        this.listeners.push(callback);
    }

    removeSkyChangeListener(callback: Function) {
        remove(this.listeners, (c) => { c == callback });
    }

    sendToSkyChangeListeners() {
        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i](this.sceneTexture);
        }
    }
}