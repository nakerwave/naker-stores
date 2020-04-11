import '@babylonjs/core/Materials/standardMaterial';
import '@babylonjs/loaders';
import '@babylonjs/core/Misc/dds';

import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Color3, Vector3 } from '@babylonjs/core/Maths/math';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';

import { PearlMesh } from '../Entity/pearlMesh';
import { EnvironmentSystem } from './environmentSystem';
import { SoundManager } from './sound';
import { Loader } from './loader';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export let StarTemperatures: Array<number> = [
    3000,
    5000,
    12000,
    30000,
];

export class MeshSystem extends EnvironmentSystem {
   
    /**
     * Creates a new System
     * @param canvas Element where the scene will be drawn
     */

    soundManager: SoundManager;
    loader: Loader;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.addDustMesh();
        this.addUpperDustMesh();
        this.addStoreMesh();

        this.soundManager = new SoundManager(this.scene);
        this.loader = new Loader(this.scene);
    }

    dustMesh: Mesh;
    dustMesh1: Mesh;
    dustMesh2: Mesh;
    dustMesh3: Mesh;
    dustMesh4: Mesh;
    addDustMesh() {
        this.dustMaterial = this.getNewDustMaterial();
        this.dustMaterial.emissiveColor = new Color3(1, 1, 0);
        this.dustMesh = this.getNewDust();
        this.dustMesh.material = this.dustMaterial; 
    }

    upperDustMesh: Mesh;
    upperDustMaterial: StandardMaterial;
    addUpperDustMesh() {
        this.upperDustMaterial = this.getNewDustMaterial();
        this.upperDustMaterial.emissiveColor = new Color3(1, 1, 1);
        this.upperDustMesh = this.getNewDust();
        this.upperDustMesh.material = this.upperDustMaterial;
        this.upperDustMesh.scaling = new Vector3(0.06, 0.06, 0.06);
    }
    
    getNewDust(): Mesh {
        // this.mesh = MeshBuilder.CreateIcoSphere(this.key + "star", { radius: 1, flat: true, subdivisions: 2 }, this.system.scene);
        // this.mesh.isBlocker = false;
        let dustMesh = MeshBuilder.CreateSphere("dust", { diameter: 1 }, this.scene);
        dustMesh.alwaysSelectAsActiveMesh = true;
        dustMesh.doNotSyncBoundingInfo = true;
        dustMesh.isVisible = false;
        return dustMesh;
    }
    
    dustMaterial: StandardMaterial;
    getNewDustMaterial(): StandardMaterial {
        let dustMaterial = new StandardMaterial("dustMaterial1", this.scene);
        dustMaterial.maxSimultaneousLights = 0;
        dustMaterial.diffuseColor = Color3.Black();
        dustMaterial.specularColor = Color3.Black();
        return dustMaterial;
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
        // for (let i = 0; i < this.scene.materials.length; i++) {
        //     const material = this.scene.materials[i];
        //     material.unfreeze();
        // }
        this.dustMaterial.unfreeze();
        this.storeMaterial.unfreeze();
        this.ribbonMaterial.unfreeze();
    }

    freezeMaterials() {
        // for (let i = 0; i < this.scene.materials.length; i++) {
        //     const material = this.scene.materials[i];
        //     material.freeze();
        // }
        this.dustMaterial.freeze();
        this.storeMaterial.freeze();
        this.ribbonMaterial.freeze();
    }

    checkMaterials() {
        // Freeze all material to have better performance
        this.unfreezeMaterials();
        this.freezeMaterials();
        // setTimeout(() => {
        //     this.freezeMaterials();
        // }, 100);
    }

    getModelPath(url: string) {
        let path = { file: '', folder: '' };
        let urlsplit = url.split('/');
        path.file = urlsplit.pop();
        path.folder = urlsplit.join('/') + '/';
        return path;
    }

    model = {};
    loadModel(url: string, name: string, callback: Function) {
        let modelpath = this.getModelPath(url);
        SceneLoader.ImportMesh("", modelpath.folder, modelpath.file, this.scene, (meshes, particleSystems, skeletons, animationGroups) => {
            callback(meshes);
            // this.modelSucces(url, name, { loadedMeshes: meshes, loadedAnimationGroups: animationGroups }, callback);
        }, null, (scene, message) => {
            console.log(message);
            
            callback(false, message);
        })
    }

    /**
    * For the models we differenciate several model type on success (normal, animated and instanciated)
    * @param url The path to where the asset must be loaded
    * @param name Name of the asset
    * @param task Object which contains the asset data
    */
    modelSucces(url: string, name: string, task, callback: Function) {
        let animations = task.loadedAnimationGroups;
        if (animations.length != 0) {
            this.modelSuccessWithAnimation(url, name, task, callback);
        } else if (this.checkInstanceInModel(task.loadedMeshes)) {
            this.modelSuccessWithInstance(url, name, task, callback);
        } else {
            this.modelSuccessWithoutAnimation(url, name, task, callback);
        }
    }

    /**
     * Check if model uses instancedMesh
     * @param meshes List of model meshes
     */
    checkInstanceInModel(meshes: Array<Mesh>) {
        for (let i = 0; i < meshes.length; i++) {
            if (meshes[i] instanceof InstancedMesh) return true;
        }
        return false;
    }

    /**
     * When model have animation we can't clone it and keep animation attach to meshes
     * So we reload it in order to make sure every model as its own animations
     * @param url The path to where the asset must be loaded
     * @param name Name of the asset
     * @param task Object which contains the asset data
     */

    // See topic here: https://forum.babylonjs.com/t/how-to-clone-a-glb-model-and-play-seperate-animation-on-each-clone/2351/10
    modelSuccessWithAnimation(url: string, name: string, task, callback: Function) {
        this.model[url] = 'animated';
        let modelParents = this.getModelParents(task.loadedMeshes);
        callback(modelParents, task.loadedAnimationGroups);
        // if (this.successes[name].length == 1) return;
        // let modelpath = this.getModelPath(url);
        // // Animation can't be duplicated so we have to download model everytime (See getAsset function)
        // for (let i = 1; i < this.successes[name].length; i++) {
        //     let callback = this.successes[name][i];
        //     SceneLoader.ImportMesh(null, modelpath.folder, modelpath.file, this.scene, (meshes, particleSystems, skeletons, animationGroups) => {
        //         let modelParents = this.getModelParents(meshes);
        //         callback(modelParents, animationGroups);
        //     });
        // }
    }

    /**
     * When model have instance we can't clone it
     * So we reload it in order to make sure it works
     * @param url The path to where the asset must be loaded
     * @param name Name of the asset
     * @param task Object which contains the asset data
     */
    modelSuccessWithInstance(url: string, name: string, task, callback: Function) {
        this.model[url] = 'instanced';
        let modelParents = this.getModelParents(task.loadedMeshes);
        callback(modelParents);
        // if (this.successes[name].length == 1) return;
        // let modelpath = this.getModelPath(url);
        // // Animation can't be duplicated so we have to download model everytime (See getAsset function)
        // SceneLoader.ImportMesh(null, modelpath.folder, modelpath.file, this.scene, (meshes, particleSystems, skeletons) => {
        //     let modelParents = this.getModelParents(meshes);
        //     callback(modelParents);
        // });
    }

    /**
     * Normal success function for model wihtou instance or animations
     * @param url The path to where the asset must be loaded
     * @param name Name of the asset
     * @param task Object which contains the asset data
     */
    modelSuccessWithoutAnimation(url: string, name: string, task, callback: Function) {
        let meshes = task.loadedMeshes;
        if (meshes == undefined) return console.warn('Missing meshes in model file');
        for (let i = 0; i < meshes.length; i++) {
            meshes[i].isVisible = false;
        }
        // If no animation we save meshes for easy and fast model duplication
        let modelParents = this.getModelParents(meshes);
        let newModelParents = this.getClonedParentModel(modelParents);
        callback(newModelParents);
    }

    /**
     * Look for all the main model parent
     * @param meshes List of model meshes
     */
    getModelParents(meshes: Array<AbstractMesh>) {
        let mainParentListId: Array<string> = [];
        let mainParentList: Array<any> = [];
        for (let i = 0; i < meshes.length; i++) {
            let mesh = meshes[i];
            let rootParent = this.getMeshRootParent(mesh);
            if (mainParentListId.indexOf(rootParent.id) == -1) {
                mainParentListId.push(rootParent.id);
                mainParentList.push(rootParent);
            }
        }
        return mainParentList;
    }

    /**
     * Clone the main model parent in order to duplicate a model
     * @param modelParents List of model parents
     */
    getClonedParentModel(modelParents: Array<Mesh>) {
        let newModelParents: Array<Mesh> = [];
        for (let i = 0; i < modelParents.length; i++) {
            // Clone meshes on order to have a new model
            newModelParents.push(modelParents[i].clone());
        }
        return newModelParents;
    }

    /**
     * Loop which get the last parent of a Mesh
     * @param mesh mesh which parent need to be find
     */
    getMeshRootParent(mesh: AbstractMesh) {
        while (mesh.parent) {
            mesh = mesh.parent;
        }
        return mesh;
    }
}