import '@babylonjs/core/Materials/standardMaterial';
import '@babylonjs/loaders';
import '@babylonjs/core/Misc/dds';
import '@babylonjs/core/Culling/ray';

import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';

import { PearlMesh } from '../Entity/pearlMesh';
import { EnvironmentSystem } from './environmentSystem';
import { SoundManager } from './sound';
import { Loader } from './loader';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class MeshSystem extends EnvironmentSystem {
   
    /**
     * Creates a new System
     * @param canvas Element where the scene will be drawn
     */

    soundManager: SoundManager;
    loader: Loader;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.addStoreMesh();

        this.soundManager = new SoundManager(this.scene);
        this.loader = new Loader(this.scene);
    }


    storeMesh: PearlMesh;
    storeMaterial: PBRMaterial;
    addStoreMesh() {
        this.storeMesh = new PearlMesh("planet", this.scene);
        this.storeMesh.alwaysSelectAsActiveMesh = true;
        this.storeMesh.doNotSyncBoundingInfo = true;
        this.storeMaterial = new PBRMaterial("storeMaterial", this.scene);
        // this.storeMaterial.roughness = 1;
        // this.meshMaterial.emissiveColor = color;
        this.storeMesh.material = this.storeMaterial;
        this.storeMesh.isVisible = false;
    }

    unfreezeMaterials() {
        for (let i = 0; i < this.scene.materials.length; i++) {
            const material = this.scene.materials[i];
            material.unfreeze();
        }
        // this.storeMaterial.unfreeze();
        // this.ribbonMaterial.unfreeze();
    }

    freezeMaterials() {
        for (let i = 0; i < this.scene.materials.length; i++) {
            const material = this.scene.materials[i];
            material.freeze();
        }
        // this.storeMaterial.freeze();
        // this.ribbonMaterial.freeze();
    }

    checkMaterials() {
        // Freeze all material to have better performance
        this.unfreezeMaterials();
        this.scene.render();
        this.freezeMaterials();
        // setTimeout(() => {
        //     this.freezeMaterials();
        // }, 100);
    }

    checkActiveMeshes() {
        console.log('che');
        
        this.scene.unfreezeActiveMeshes();
        this.scene.freezeActiveMeshes();
        this.checkMaterials();
    }

    groupInstance (masterParent: Mesh) {
        // parents MUST be clones, and NOT instances, it seems. Verify to be sure.
        var newParent = masterParent.clone('', null, true);

        // make a new instance for each of masterParent's children
        let children = masterParent.getChildren();
        for (var i = 0; i < children.length; i++) {
            let instchild;
            if (children[i].createInstance) instchild = children[i].createInstance();  // intancedChild
            else instchild = this.groupInstance(children[i]);  // intancedChild
            instchild.parent = newParent;  // parent the instancedChild to the new groupWidget
        }
        return newParent;  // return the new group widget.
    }

    getModelPath(url: string) {
        let path = { file: '', folder: '' };
        let urlsplit = url.split('/');
        path.file = urlsplit.pop();
        path.folder = urlsplit.join('/') + '/';
        return path;
    }

    assetUrl = 'https://test.naker.io/stores/asset/v2/';
    model = {};
    loadModel(modelFile: string, callback: Function) {
        this.loader.getModel(this.assetUrl + modelFile, callback);
    }
}