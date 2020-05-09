import { NakerObservable } from '@naker/services/Tools/observable';

import '@babylonjs/loaders';
import '@babylonjs/core/Misc/dds';
import '@babylonjs/core/Materials/Textures/Loaders/ddsTextureLoader';
import '@babylonjs/core/Materials/Textures/Loaders/envTextureLoader';
import { Scene } from '@babylonjs/core/scene';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';
import { Sound } from '@babylonjs/core/Audio/sound';
import { Texture } from '@babylonjs/core/Materials/Textures/Texture';
import { VideoTexture } from '@babylonjs/core/Materials/Textures/videoTexture';
import { CubeTexture } from '@babylonjs/core/Materials/Textures/cubeTexture';
import { HDRCubeTexture } from '@babylonjs/core/Materials/Textures/hdrcubeTexture';
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";

export interface asset {
    type: 'image' | 'particle' | 'albedo' | 'ambient' | 'specular' | 'emissive' | 'reflectivity' | 'reflection' | 'refraction' | 'heightmap' | 'cubetexture' | 'bump' | 'opacity' | 'model' | 'video' | 'sound',
    url: string
};

interface LoaderEventData {
    type: asset["type"],
    success: boolean,
    remaining: number;
    total: number;
    url?: string,
    error?: string,
}

/**
 * Manage the loading of any asset type from images to videos, models, sounds, etc
 */

export class Loader extends NakerObservable<LoaderEventData> {

    /**
     * @ignore
     */
    _scene: Scene;

    /**
     * @ignore
     */
    particle: any = {};

    /**
     * @ignore
     */
    albedo: any = {};
    ambient: any = {};
    specular: any = {};
    emissive: any = {};
    bump: any = {};
    opacity: any = {};
    reflection: any = {};
    reflectivity: any = {};
    heightmap: any = {};
    cubetexture: any = {};
    image: any = {};
    video: any = {};
    model: any = {};
    sound: any = {};

    /**
     * List the current assets loading by type
     */
    remainingLoad: any;
    totalLoad: any;

    /**
     * Check if this is the first time we use the loader
     */
    firstload = true;

    onFinish: Function;

    /**
     * Creates a new loader
     * @param scene AssetsManager need to know to what scene the assets will be loaded
     */
    constructor(scene: Scene) {
        super();
        this._scene = scene;
        this.reset();
    }

    /**
     * The list of all possible asset type
     */
    assetTypeList = ['image', 'particle', 'albedo', 'ambient', 'specular', 'emissive', 'reflection', 'refraction', 'reflectivity', 'bump', 'opacity', 'cubetexture', 'heightmap', 'video', 'model', 'sound', 'upload'];

    /**
     * The list of all asset which are images
     */
    textures = ['image', 'particle', 'albedo', 'ambient', 'specular', 'emissive', 'reflection', 'reflectivity', 'bump', 'opacity'];

    /**
     * Store the functions waiting for a callback when asset will be loaded
     */
    successes: any = {};

    /**
     * Get one asset, before loading it will check if the asset doesn't already exist
     * @param type The type of asset to be loaded
     * @param url The path to where the asset must be loaded
     * @param callback Function called once loading is over
     */
    getAsset(type: asset["type"], url: string, callback: Function) {
        if (this[type][url] !== undefined) {
            // Animation can't be duplicated so we have to download model everytime (See modelSuccessWithAnimation function)
            if (type == 'model' && (this[type][url] == 'animated' || this[type][url] == 'instanced')) {
                this.loadAsset('model', url, callback);
            } else if (type == 'model') {
                let newModelParents = this.getClonedParentModel(this.model[url]);
                callback(newModelParents);
            } else {
                let asset;
                if (type == 'sound') asset = this[type][url].clone();
                else asset = this[type][url];
                callback(asset);
            }
        } else if (url) {
            this.loadAsset(type, url, callback);
        } else {
            console.error('missing asset url when loading');
        }
    }

    /**
     * Load one asset
     * @param type The type of asset to be loaded
     * @param url The path to where the asset must be loaded
     * @param callback Function called once loading is over
     */
    loadAsset(type: asset["type"], url: string, callback: Function) {
        if (url.length == 0) return;
        let assettype = (this.textures.indexOf(type) != -1) ? 'image' : type;
        // only textures can have the same success callback, otherwise heightmap and images use the same success with different object in the callback
        let name = assettype + url;
        if (this.successes[name] !== undefined) return this.successes[name].push(callback);
        this.successes[name] = [];
        this.successes[name].push(callback);
        this.remainingLoad[type]++;
        this.totalLoad[type]++;
        if (type == 'model') {
            this.loadModel(url, name, (success, asset) => {
                if (success) this.success(type, url, name, asset);
                else this.error(type, name, asset);
            });
        } else if (this.textures.indexOf(type) != -1) {
            this.loadTexture(url, name, (success, asset) => {
                if (success) this.success(type, url, name, asset);
                else this.error(type, name, asset);
            });
        } else if (type == 'video') {
            this.loadVideo(url, name, (success, asset) => {
                if (success) this.success(type, url, name, asset);
                else this.error(type, name, asset);
            });
        } else if (type == 'heightmap') {
            this.loadHeightMap(url, name, (success, asset) => {
                if (success) this.success(type, url, name, asset);
                else this.error(type, name, asset);
            });
        } else if (type == 'cubetexture') {
            this.loadCubeTexture(url, name, (success, asset) => {
                if (success) this.success(type, url, name, asset);
                else this.error(type, name, asset);
            });
        } else if (type == 'sound') {
            this.loadSound(url, name, (success, asset) => {
                if (success) this.success(type, url, name, asset);
                else this.error(type, name, asset);
            });
        }

        // this.getFileSize(type, url);
    }

    /**
     * @ignore
     */
    loadModel(url: string, name: string, callback: Function) {
        let modelpath = this.getModelPath(url);
        SceneLoader.ImportMesh("", modelpath.folder, modelpath.file, this._scene, (meshes, particleSystems, skeletons, animationGroups) => {
            callback(true, { loadedMeshes: meshes, loadedAnimationGroups: animationGroups });
        }, null, (scene, message) => {
            callback(false, message);
        })
    }

    /**
     * @ignore
     */
    loadVideo(url: string, name: string, callback: Function) {
        let texture = new VideoTexture(name, [url], this._scene, true);
        let video = texture.video;
        video.addEventListener('error', (evt) => {
            callback(false, "Error loading file " + url);
        }, true);
        video.addEventListener('loadeddata', (evt) => {
            callback(true, { texture: texture });
        });
    }

    /**
     * @ignore
     */
    loadHeightMap(url: string, name: string, callback: Function) {
        Mesh.CreateGroundFromHeightMap(name + "height", url, 1, 1, 100, 0, 1, this._scene, false, (mesh) => {
            mesh.isVisible = false;
            // Didn't find a way to trigger file load error
            // if (!task.onSuccess) {
            //   task.onError({errorObject:{message:"Error loading height image"}});
            //   return;
            // }
            callback(true, mesh);
        });
    }

    /**
     * @ignore
     */
    loadTexture(url: string, name: string, callback: Function) {
        let texture: Texture;
        texture = new Texture(url, this._scene, false, true, Texture.TRILINEAR_SAMPLINGMODE, () => {
            callback(true, { texture: texture });
        });
    }

    /**
     * @ignore
     */
    loadCubeTexture(url: string, name: string, callback: Function) {
        let texture: CubeTexture | HDRCubeTexture;
        let extension = url.substr(url.lastIndexOf('.') + 1);
        if (extension == 'hdr') {
            texture = new HDRCubeTexture(url, this._scene, 512, false, true, false, false, () => {
                callback(true, { texture: texture });
            });
        } else if (extension == 'env') {
            texture = new CubeTexture(url, this._scene, null, false, null, () => {
                callback(true, { texture: texture });
            });
        } else if (extension == 'dds') {
            texture = new CubeTexture(url, this._scene, null, false, null, () => {
                callback(true, { texture: texture });
            }, null, undefined, true, null, true);
        }
    }

    /**
     * @ignore
     */
    loadSound(url: string, name: string, callback: Function) {
        let music = new Sound(name, url, this._scene, () => {
            // Sound has been downloaded & decoded
            music.stop();
            callback(true, music);
        });
    }

    // getFileSize (type, url) {
    //   var fileSize = '';
    //   var http = new XMLHttpRequest();
    //   http.open('HEAD', url, true); // true = Asynchronous
    //   http.onreadystatechange = function () {
    //     if (this.readyState == this.DONE) {
    //       if (this.status === 200) {
    //         fileSize = this.getResponseHeader('Content-Length');
    //         console.log(type+' '+url+' = ' + fileSize);
    //         // ok here is the only place in the code where we have our request result and file size ...
    //         // the problem is that here we are in the middle of anonymous function nested into another function and it does not look pretty
    //         // this stupid ASYNC pattern makes me hate Javascript even more than I already hate it :)
    //       }
    //     }
    //   };
    //   http.send(); // it will submit request and jump to the next line immediately, without even waiting for request result b/c we used ASYNC XHR call
    //   return ('At this moment, we do not even have Request Results b/c we used ASYNC call to follow with stupid JavaScript pattern');
    // }

    /**
     * When an asset finish loading, we check the asset data ad return the result to the callback
     * @param type The type of asset successfully loaded
     * @param url The path to where the asset must be loaded
     * @param name Name of the asset
     * @param task Object which contains the asset data
     */
    success(type: asset["type"], url: string, name: string, asset) {
        try {
            // Models use different success function to handle animations
            if (type == 'model') {
                this.modelSucces(url, name, asset);
            } else {
                if (type == 'sound') asset = asset.clone();
                this[type][url] = asset;
                for (let i = 0; i < this.successes[name].length; i++) {
                    this.successes[name][i](asset);
                }
                // Must delete success url or loading the same file later will not work
            }
            delete this.successes[name];
        } catch (e) {
            console.log(e)
        }
        this.remainingLoad[type]--;
        this.notifyAll({ type: type, success: true, url: url, remaining: this.remaining, total: this.total })
        this.checkFinished();
    }

    /**
     * When an asset didn't load correctly, we send a false result to the waiting callback
     * @param type The type of asset not successfully loaded
     * @param name Name of the asset
     * @param error Object which contains the error
     */
    error(type: asset["type"], name: string, error: string) {
        // console.log(error)
        // console.log('error', type, url)
        // console.log(error.errorObject.exception.message)
        // Some loading get several error and sometimes success is undefined
        if (this.successes[name]) {
            for (let i = 0; i < this.successes[name].length; i++) {
                this.successes[name][i](false);
            }
        }

        // Must delete success url or loading the same file later will not work
        delete this.successes[name];
        this.remainingLoad[type]--;
        this.checkFinished();
        this.notifyAll({ type: type, success: false, error: error, remaining: this.remaining, total: this.total })
    }

    remaining = 0;
    total = 0;
    checkFinished() {
        this.remaining = 0;
        this.total = 0;
        for (const key in this.remainingLoad) {
            this.remaining += this.remainingLoad[key];
            this.total += this.totalLoad[key];
        }

        if (!this.remaining && this.onFinish) {
            this.onFinish();
            this.reset();
        }
    }

    /**
     * Initiate the loading types
     */
    reset() {
        this.remainingLoad = {};
        this.totalLoad = {};
        for (let i = 0; i < this.assetTypeList.length; i++) {
            this.remainingLoad[this.assetTypeList[i]] = 0;
            this.totalLoad[this.assetTypeList[i]] = 0;
        }
    }

    /**
     * For the model asset, the url path must be splited
     * @param url Url of the model
     */
    getModelPath(url: string) {
        let path = { file: '', folder: '' };
        let urlsplit = url.split('/');
        path.file = urlsplit.pop();
        path.folder = urlsplit.join('/') + '/';
        return path;
    }

    /**
     * For the models we differenciate several model type on success (normal, animated and instanciated)
     * @param url The path to where the asset must be loaded
     * @param name Name of the asset
     * @param task Object which contains the asset data
     */
    modelSucces(url: string, name: string, task) {
        let animations = task.loadedAnimationGroups;
        if (animations.length != 0) {
            this.modelSuccessWithAnimation(url, name, task);
        } else if (this.checkInstanceInModel(task.loadedMeshes)) {
            this.modelSuccessWithInstance(url, name, task);
        } else {
            this.modelSuccessWithoutAnimation(url, name, task);
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
    modelSuccessWithAnimation(url: string, name: string, task) {
        this.model[url] = 'animated';
        let modelParents = this.getModelParents(task.loadedMeshes);
        this.successes[name][0](modelParents, task.loadedAnimationGroups);
        if (this.successes[name].length == 1) return;
        let modelpath = this.getModelPath(url);
        // Animation can't be duplicated so we have to download model everytime (See getAsset function)
        for (let i = 1; i < this.successes[name].length; i++) {
            let callback = this.successes[name][i];
            SceneLoader.ImportMesh(null, modelpath.folder, modelpath.file, this._scene, (meshes, particleSystems, skeletons, animationGroups) => {
                let modelParents = this.getModelParents(meshes);
                callback(modelParents, animationGroups);
            });
        }
    }

    /**
     * When model have instance we can't clone it
     * So we reload it in order to make sure it works
     * @param url The path to where the asset must be loaded
     * @param name Name of the asset
     * @param task Object which contains the asset data
     */
    modelSuccessWithInstance(url: string, name: string, task) {
        this.model[url] = 'instanced';
        let modelParents = this.getModelParents(task.loadedMeshes);
        this.successes[name][0](modelParents);
        if (this.successes[name].length == 1) return;
        let modelpath = this.getModelPath(url);
        // Animation can't be duplicated so we have to download model everytime (See getAsset function)
        for (let i = 1; i < this.successes[name].length; i++) {
            let callback = this.successes[name][i];
            SceneLoader.ImportMesh(null, modelpath.folder, modelpath.file, this._scene, (meshes, particleSystems, skeletons) => {
                let modelParents = this.getModelParents(meshes);
                callback(modelParents);
            });
        }
    }

    /**
     * Normal success function for model wihtou instance or animations
     * @param url The path to where the asset must be loaded
     * @param name Name of the asset
     * @param task Object which contains the asset data
     */
    modelSuccessWithoutAnimation(url: string, name: string, task) {
        let meshes = task.loadedMeshes;
        if (meshes == undefined) return console.warn('Missing meshes in model file');
        for (let i = 0; i < meshes.length; i++) {
            meshes[i].isVisible = false;
        }
        // If no animation we save meshes for easy and fast model duplication
        let modelParents = this.getModelParents(meshes);
        this.model[url] = modelParents;
        for (let i = 0; i < this.successes[name].length; i++) {
            let newModelParents = this.getClonedParentModel(modelParents);
            this.successes[name][i](newModelParents);
        }
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

    getParticle(url: string, callback: Function) {
        this.getAsset('particle', url, callback);
    }

    getAlbedo(url: string, callback: Function) {
        this.getAsset('albedo', url, callback);
    }

    getAmbient(url: string, callback: Function) {
        this.getAsset('ambient', url, callback);
    }

    getSpecular(url: string, callback: Function) {
        this.getAsset('specular', url, callback);
    }

    getEmissive(url: string, callback: Function) {
        this.getAsset('emissive', url, callback);
    }

    getBump(url: string, callback: Function) {
        this.getAsset('bump', url, callback);
    }

    getOpacity(url: string, callback: Function) {
        this.getAsset('opacity', url, callback);
    }

    getReflection(url: string, callback: Function) {
        this.getAsset('reflection', url, callback);
    }

    getRefraction(url: string, callback: Function) {
        this.getAsset('reflection', url, callback);
    }

    getReflectivity(url: string, callback: Function) {
        this.getAsset('reflectivity', url, callback);
    }

    getCubeTexture(url: string, callback: Function) {
        this.getAsset('cubetexture', url, callback);
    }

    getHeightMap(url: string, callback: Function) {
        this.getAsset('heightmap', url, callback);
    }

    getModel(url: string, callback: Function) {
        this.getAsset('model', url, callback);
    }

    getImage(url: string, callback: Function) {
        this.getAsset('image', url, callback);
    }

    getVideo(url: string, callback: Function) {
        this.getAsset('video', url, callback);
    }

    getSound(url: string, callback: Function) {
        this.getAsset('sound', url, callback);
    }
}
