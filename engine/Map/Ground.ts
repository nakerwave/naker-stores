import { MouseCatcher } from '@naker/services/Catchers/mouseCatcher';
import { Animation } from '@naker/services/System/systemAnimation';

import { MeshSystem } from '../System/meshSystem';
import { Tree } from '../Entity/tree';

import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Vector2, Vector3, Color3 } from '@babylonjs/core/Maths/math';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { Scene } from '@babylonjs/core/scene'
import { EasingFunction, CubicEase, } from '@babylonjs/core/Animations/easing';
import { ResponsiveCatcher } from '@naker/services/Catchers/responsiveCatcher';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export let mapSize = 150;

export class Ground {

    system: MeshSystem;
    cameraMove: EasingFunction;
    cameraZoom: EasingFunction;
    animation: Animation;

    constructor(system: MeshSystem, mouseCatcher: MouseCatcher, responsiveCatcher: ResponsiveCatcher) {
        this.system = system;
        this.animation = new Animation(this.system);

        this.cameraMove = new CubicEase();
        this.cameraMove.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        this.cameraZoom = new CubicEase();
        this.cameraZoom.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);

        this.system.scene.fogEnabled = true;
        this.system.scene.fogMode = Scene.FOGMODE_EXP;
        this.system.scene.fogDensity = 0;
        this.system.scene.fogColor = new Color3(0.3, 0.6, 0.3);

        this.addGround();
        this.setEvents(mouseCatcher, responsiveCatcher);
    }

    ground: Mesh;
    // groundMaterial: PBRMaterial;
    material: PBRMaterial;
    addGround() {
        // var sideO = Mesh.BACKSIDE;
        // this.ground = Mesh.Createground("ground", this.paths, false, false, 0, this.system.scene, true, sideO);
        this.ground = Mesh.CreatePlane("ground", mapSize * 2, this.system.scene);
        this.ground.alwaysSelectAsActiveMesh = true;
        this.ground.doNotSyncBoundingInfo = true;
        this.ground.receiveShadows = true;
        // this.ground.convertToFlatShadedMesh();
        // this.gridground.renderingGroupId = 3;
        // this.ground.isVisible = false;
        this.ground.rotation.x = Math.PI/2;

        this.ground.material = this.system.groundMaterial;
    }

    currentTarget = Vector2.Zero();
    moveCameraToCenter(center: Vector2, callback?: Function) {
        let change = this.currentTarget.subtract(center);
        // let currentPosition = this.system.camera.position.clone();
        this.animation.simple(50, (count, perc) => {
            let easePerc = this.cameraMove.ease(perc);
            let progress = change.multiply(new Vector2(easePerc, easePerc));
            let newTarget = this.currentTarget.add(progress);
            let target = new Vector3(newTarget.x, 0, newTarget.y);
            this.system.camera.setTarget(target);
            // let newPos = currentPosition.add(new Vector3(currentPosition.x - change.x, currentPosition.y, currentPosition.z - change.y));
            // this.system.camera.setPosition(newPos);
        }, () => {
            this.currentTarget = center;
            if (callback) callback();
        });
    }

    showFog(callback?: Function) {
        this.animation.simple(50, (count, perc) => {
            let easePerc = this.cameraMove.ease(perc);
            this.system.scene.fogDensity = easePerc;
        }, () => {
            if (callback) callback();
        });
    }

    hideFog(callback?: Function) {
        this.animation.simple(50, (count, perc) => {
            let easePerc = this.cameraMove.ease(perc);
            this.system.scene.fogDensity = 1 - easePerc;
        }, () => {
            if (callback) callback();
        });
    }

    animFog(callback?: Function) {
        this.animation.simple(100, (count, perc) => {
            this.system.scene.fogDensity = Math.min(perc * 2, 2 - perc * 2)/10;
        }, () => {
            if (callback) callback();
        });
    }

    addTrees() {
        for (let i = 0; i < 20; i++) {
            let tree = new Tree(this.system);
            let randomPos = this.getRandomPosition(1);
            tree.setPosition(randomPos);
            tree.showAnim();
        }
    }

    getRandomPosition(ratio: number): Vector2 {
        return new Vector2((Math.random() - 0.5) * mapSize * ratio, (Math.random() - 0.5) * mapSize * ratio);
    }

    sensitivity = 1;
    sensitivityRatio = 20;
    realSensitivity = 1;
    setEvents(mouseCatcher: MouseCatcher, responsiveCatcher: ResponsiveCatcher) {
        mouseCatcher.addListener((mousepos: Vector2) => {
            if (this.sensitivity != 0) {
                let newrot = new Vector2(mousepos.y / 5, mousepos.x / 5);
                this.setCameraRotation(newrot);
            }
        });

        responsiveCatcher.addListener((ratio) => {
            this.checkSensitivity(ratio);
        });
    }

    maxRatio = 0.1;
    checkSensitivity(ratio: number) {
        ratio = Math.abs(ratio);
        let ratioS = Math.pow(1 + ratio, 2);
        this.realSensitivity = this.sensitivity * this.sensitivityRatio / ratioS;
    }

    mousePosition = new Vector2(0, 0);
    setCameraRotation(rot: Vector2) {
        this.system.camera.alpha = -0.1 * rot.y * this.realSensitivity - Math.PI / 4;
        this.system.camera.beta = -0.1 * rot.x * this.realSensitivity + Math.PI / 4;
    }

}