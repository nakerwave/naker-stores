import { MouseCatcher } from '@naker/services/Catchers/mouseCatcher';
import { Animation } from '@naker/services/System/systemAnimation';
import { EventsName } from '@naker/services/Tools/observable';

import { MeshSystem } from '../System/meshSystem';
import { TileMap } from './tileMap';

import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Vector2, Vector3, Color3 } from '@babylonjs/core/Maths/math';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Scene } from '@babylonjs/core/scene'
import { EasingFunction, CubicEase, } from '@babylonjs/core/Animations/easing';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';

import grassAlbedoTexture from '../../asset/grass1.png';
import grassNormalTexture from '../../asset/grassnorm1.png';

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
    fogAnimation: Animation;
    tileMap: TileMap;
    mouseCatcher: MouseCatcher;

    constructor(system: MeshSystem, tileMap: TileMap, mouseCatcher: MouseCatcher) {
        this.system = system;
        this.tileMap = tileMap;
        this.mouseCatcher = mouseCatcher;
        this.animation = new Animation(this.system);
        this.fogAnimation = new Animation(this.system);

        this.cameraMove = new CubicEase();
        this.cameraMove.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        this.cameraZoom = new CubicEase();
        this.cameraZoom.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);

        this.system.scene.fogEnabled = true;
        this.system.scene.fogMode = Scene.FOGMODE_EXP;
        this.system.scene.fogDensity = 0;
        this.system.scene.fogColor = new Color3(0.3, 0.6, 0.3);

        this.addGround();
        this.setEvents(mouseCatcher);
        this.setCameraRotation(Vector2.Zero());
        this.addDragAndDrop();
    }

    sensitivity = 1;
    sensitivityRatio = 20;
    realSensitivity = 1;
    setEvents(mouseCatcher: MouseCatcher) {
        mouseCatcher.addListener((mousePosition: Vector2) => {
            if (this.drag) this.setCameraTarget(mousePosition);
            if (this.sensitivity != 0) this.setCameraRotation(mousePosition);
        });

        this.system.on(EventsName.Resize, (ratio) => {
            this.checkSensitivity(ratio);
        });
    }

    maxRatio = 0.1;
    checkSensitivity(ratio: number) {
        ratio = Math.abs(ratio);
        let ratioS = Math.pow(1 + ratio, 2);
        this.realSensitivity = this.sensitivity * this.sensitivityRatio / ratioS;
    }

    setCameraRotation(mousePosition: Vector2) {
        let newRot = new Vector2(mousePosition.y / 20, mousePosition.x / 20);
        this.system.camera.alpha = -0.1 * newRot.y * this.realSensitivity - Math.PI / 2;
        this.system.camera.beta = -0.1 * newRot.x * this.realSensitivity + Math.PI / 4;
    }

    pixelRatio = 40;
    maxGap = 50;
    startMousePosition = Vector2.Zero();
    currentTarget: Vector3;
    startTarget: Vector3;
    currentPosition: Vector3;
    startPosition: Vector3;
    setCameraTarget(mousePosition: Vector2) {
        let newPos = new Vector2(-mousePosition.x * this.pixelRatio, mousePosition.y * this.pixelRatio);
        if (!this.startMousePosition) this.startMousePosition = newPos.clone();
        let change = newPos.subtract(this.startMousePosition);

        if (Math.abs(this.currentTarget.x + change.x) <= this.maxGap) {
            this.currentTarget.x = this.startTarget.x + change.x;           
            this.currentPosition.x = this.startPosition.x + change.x;
        }
        if (Math.abs(this.currentTarget.z + change.y) <= this.maxGap) {
            this.currentTarget.z = this.startTarget.z + change.y;           
            this.currentPosition.z = this.startPosition.z + change.y;
        }
        this.system.camera.setTarget(this.currentTarget);
        this.system.camera.setPosition(this.currentPosition);
    }

    drag = false;
    addDragAndDrop() {
        this.system.scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERDOWN:
                        this.startDrag();
                    break;
                case PointerEventTypes.POINTERUP:
                        this.stopDrag();
                    break;
            }
        });
    }

    startDrag() {
        this.mouseCatcher.animation.stop();
        this.drag = true;
        this.startMousePosition = null;
        this.currentTarget = this.system.camera.target.clone();
        this.startTarget = this.system.camera.target.clone();

        this.currentPosition = this.system.camera.position.clone();
        this.startPosition = this.system.camera.position.clone();
    }

    stopDrag() {
        // setTimeout(() => {
            this.drag = false;
        // }, 200);
    }

    ground: Mesh;
    // groundMaterial: PBRMaterial;
    material: PBRMaterial;
    addGround() {
        // var sideO = Mesh.BACKSIDE;
        // this.ground = Mesh.Createground("ground", this.paths, false, false, 0, this.system.scene, true, sideO);
        this.ground = Mesh.CreatePlane("ground", mapSize * 20, this.system.scene);
        // this.ground.alwaysSelectAsActiveMesh = true;
        // this.ground.doNotSyncBoundingInfo = true;
        this.ground.receiveShadows = true;
        // this.ground.convertToFlatShadedMesh();
        // this.gridground.renderingGroupId = 3;
        // this.ground.isVisible = false;
        this.ground.rotation.x = Math.PI/2;
        this.addGroundMaterial();
        this.ground.material = this.groundMaterial;
    }

    groundMaterial: PBRMaterial;
    // groundMaterial: StandardMaterial;
    addGroundMaterial() {
        this.groundMaterial = new PBRMaterial("groundMaterial", this.system.scene);
        this.groundMaterial.roughness = 1;
        this.groundMaterial.metallic = 0.2;
        this.groundMaterial.albedoColor = new Color3(1 / 255, 105 / 255, 16 / 255);
        // this.groundMaterial = new StandardMaterial("groundMaterial", this.system.scene);
        // this.groundMaterial.diffuseColor = new Color3(1 / 255, 255 / 255, 56 / 255);
    }

    treeModel: Mesh;
    rockModel: Mesh;
    grassModel: Mesh;
    bushModel: Mesh;
    loadDecor() {
        let url = this.system.assetUrl + 'low_poly_trees_grass_and_rocks/scene.gltf'; 
        this.system.loader.loadModel(url, '', (success, model) => {
            if (!success) return;

            let meshes = model.loadedMeshes;
            for (let i = 0; i < meshes.length; i++) {
                const mesh = meshes[i];
                // console.log(mesh.name);
                // if (mesh.parent) console.log(mesh.parent.name);
                if (mesh.name == 'Tree1_Tree1_2.001_0') {
                    this.treeModel = mesh.parent;
                    // this.treeModel.position = new Vector3(0, -0.5, 0);
                    this.treeModel.scaling = new Vector3(1, -1, 1);
                }
                if (mesh.name == 'Rock3_Rock1_1.001_0') {
                    this.rockModel = mesh.parent;
                    this.rockModel.position = new Vector3(0, 0.5, 0);
                    this.rockModel.scaling = new Vector3(1, -1, 1);
                }
                if (mesh.name == 'Grass1_Grass1_1.001_0') {
                    this.grassModel = mesh.parent;
                    this.grassModel.position = new Vector3(0, 0.5, 0);
                    this.grassModel.scaling = new Vector3(0.1, -0.1, 0.1);
                }
                if (mesh.name == 'Bush1_Bush1_1_0') {
                    this.bushModel = mesh.parent;
                    this.bushModel.position = new Vector3(0, 0.5, 0);
                    this.bushModel.scaling = new Vector3(0.5, -0.5, 0.5);
                }
                mesh.isVisible = false;
                // mesh.receiveShadow = true;
                mesh.alwaysSelectAsActiveMesh = true;
                mesh.doNotSyncBoundingInfo = true;
                // this.system.shadowGenerator.getShadowMap().renderList.push(mesh);
            }

            this.addAllTreeGroup();
            this.system.updateShadows();
            this.tileMap.resetGridSpot();
            this.moveTreeGroup();
        });
    }

    newDecor(callback: Function) {
        this.animFog(() => {
            this.moveTreeGroup();
            callback();
        });
    }

    treeDistance = 150;
    moveTreeGroup() {
        for (let i = 0; i < this.treeGroups.length; i++) {
            const treeGroup = this.treeGroups[i];
            let randomX = Math.random() * this.treeDistance - this.treeDistance/2;
            let randomY = Math.random() * this.treeDistance - this.treeDistance/2;
            let pos = this.tileMap.getFreeSpot(new Vector2(randomX, randomY));
            treeGroup.position.x = pos.x;
            treeGroup.position.z = pos.y;
        }
        this.system.updateShadows();
    }

    showFog(callback?: Function) {
        this.fogAnimation.simple(50, (count, perc) => {
            let easePerc = this.cameraMove.ease(perc);
            this.system.scene.fogDensity = easePerc;
        }, () => {
            if (callback) callback();
        });
    }

    hideFog(callback?: Function) {
        this.fogAnimation.simple(50, (count, perc) => {
            let easePerc = this.cameraMove.ease(perc);
            this.system.scene.fogDensity = 1 - easePerc;
        }, () => {
            if (callback) callback();
        });
    }

    animFog(halfcallback: Function, callback?: Function) {
        let test = false;
        this.fogAnimation.simple(100, (count, perc) => {
            this.system.scene.fogDensity = Math.min(perc * 2, 2 - perc * 2)/10;
            if (perc > 0.5 && !test) {
                test = true;
                halfcallback();
            } 
        }, () => {
            if (callback) callback();
        });
    }

    addAllTreeGroup() {
        for (let i = 0; i < 20; i++) {
            this.addTreeGroup();
        }
    }

    treeGroups: Array<TransformNode> = [];
    addTreeGroup() {
        let treeGroupParent = new TransformNode('treeParent' + this.treeGroups.length.toString(), this.system.scene);
        let randomPos = this.getRandomPosition(1);
        treeGroupParent.position.x = randomPos.x;
        treeGroupParent.position.z = randomPos.y;
        this.treeGroups.push(treeGroupParent);
        for (let i = 0; i < 2; i++) {
            this.addTree(treeGroupParent);
        }
        for (let i = 0; i < 2; i++) {
            this.addRock(treeGroupParent);
        }
        for (let i = 0; i < 2; i++) {
            this.addGrass(treeGroupParent);
        }
        for (let i = 0; i < 2; i++) {
            this.addBush(treeGroupParent);
        }
    }

    addTree(parent: TransformNode): Mesh {
        let tree = this.system.groupInstance(this.treeModel);
        // let tree = this.treeModel.clone('tree');
        this.addGroundMesh(tree, parent);
        return tree;
    }

    addRock(parent: TransformNode): Mesh {
        let rock = this.system.groupInstance(this.rockModel);
        // let rock = this.rockModel.clone('rock');
        this.addGroundMesh(rock, parent);
        return rock;
    }

    addGrass(parent: TransformNode): Mesh {
        let grass = this.system.groupInstance(this.grassModel);
        // let grass = this.grassModel.clone('grass');
        this.addGroundMesh(grass, parent);
        return grass;
    }

    addBush(parent: TransformNode): Mesh {
        let bush = this.system.groupInstance(this.bushModel);
        // let bush = this.bushModel.clone('bush');
        this.addGroundMesh(bush, parent);
        return bush;
    }

    addGroundMesh(mesh: Mesh, parent: TransformNode) {
        let children = mesh.getChildren();
        for (let i = 0; i < children.length; i++) {
            const child: Mesh = children[i];
            child.isVisible = true;
            child.alwaysSelectAsActiveMesh = true;
            child.doNotSyncBoundingInfo = true;
            if (this.system.shadowGenerator) this.system.shadowGenerator.addShadowCaster(child);
        }
        let randomPos = this.getPositionAround();
        mesh.position.x = randomPos.x;
        mesh.position.z = randomPos.y;
        mesh.parent = parent;
    }

    getPositionAround(): Vector2 {
        return new Vector2((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
    }

    getRandomPosition(ratio: number): Vector2 {
        return new Vector2((Math.random() - 0.5) * mapSize * ratio, (Math.random() - 0.5) * mapSize * ratio);
    }
}