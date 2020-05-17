import { UiSystem } from '../System/uiSystem';
import { Store, StoreData, storeCategories } from '../Entity/store';
import { Car } from '../Entity/car';
import { Ground } from './Ground';
import { ModalUI } from '../Ui/modal';
import { TileMap } from './tileMap';

import { Vector2 } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import find from 'lodash/find';
import filter from 'lodash/filter';

import stores from '../../asset/stores2.json';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class StoreMap {

    system: UiSystem;
    ground: Ground;
    tileMap: TileMap;
    modal: ModalUI;
    car: Car;

    constructor(system: UiSystem, tileMap: TileMap, ground: Ground, car: Car, modal: ModalUI) {
        this.system = system;
        this.ground = ground;
        this.modal = modal;
        this.tileMap = tileMap;
        this.car = car;
    }

    base: Array<Mesh> = [];
    baseCat = {};
    loadBaseModel() {
        let url = this.system.assetUrl + 'commerce_txtr.gltf';
        this.system.loader.loadModel(url, '', (success, model) => {
            this.base = model.loadedMeshes;
            for (let i = 0; i < this.base.length; i++) {
                const mesh = this.base[i];
                mesh.isVisible = false;
                mesh.scaling.x = 10;
                mesh.scaling.y = 10;
                mesh.scaling.z = 10;
            }
            for (let i = 0; i < storeCategories.length; i++) {
                const storeType = storeCategories[i];
                let cloned = this.base[1].clone();
                cloned.material = this.base[1].material.clone('');
                cloned.material.albedoColor = storeType.color;
                this.baseCat[storeType.type] = cloned;
            }
        });
    }

    storesModel = {};
    loadStoresModel() {
        for (let i = 0; i < storeCategories.length; i++) {
            const storeType = storeCategories[i];
            this.system.loadModel(storeType.model, (model) => {
                this.storesModel[storeType.type] = model[0];
            });
        }
    }

    center = Vector2.Zero();
    storesNearby: Array<any> = [];
    updateStores(latlng: Array<number>) {
        // this.center = this.ground.getRandomPosition(0.5);
        let storesNearby = this.getStoresInBox(latlng);
        this.tileMap.resetGridSpot();
        this.storesNearby = this.setStorePositionInGrid(storesNearby);
        this.ground.newDecor(() => {
            this.addStoresModels(this.storesNearby);
        });
        this.hideCurrentStores();
    }

    hideCurrentStores() {
        for (let i = 0; i < this.storesList.length; i++) {
            const storeModel = this.storesList[i];
            storeModel.hideAnim();
        }
    }

    spotWidthNumber = 20;
    setStorePositionInGrid(storesNearby: Array<StoreData>): Array<StoreData> {
        for (let i = 0; i < storesNearby.length; i++) {
            const store = storesNearby[i];
            store.position = this.tileMap.getFreeSpot(store.position);
        }
        return storesNearby;
    }

    maxStores = 20;
    maxStoreByType = 3;
    searchDistance = 0.3;
    ratioDistance = 50;
    getStoresInBox(latlng: Array<number>): Array<StoreData> {
        let storesInBox = [];

        // Get all closest stores
        for (let i = 0; i < stores.length; i++) {
            const store = stores[i];
            let xDist = store.lon - latlng[0];
            let yDist = store.lat - latlng[1];
            if (Math.abs(xDist) < this.searchDistance && Math.abs(yDist) < this.searchDistance) {
                let pos = new Vector2(xDist, yDist);
                store.position = pos.subtract(this.center);
                store.distance = Vector2.Distance(Vector2.Zero(), store.position);
                storesInBox.push(store);
            }
        }

        // Sort by Distance
        let storesSorted = storesInBox.sort((a, b) => {
            return a.distance - b.distance;
        });

        // Limit number by Type
        let storeTypeNumber = {};
        let storesByTpeLimit = [];
        for (let i = 0; i < storesSorted.length; i++) {
            const store = storesSorted[i];
            let storeType = this.getStoreType(store.cat);
            if (storeType) {
                let type = storeType.type;
                if (!storeTypeNumber[type]) storeTypeNumber[type] = 1;
                else storeTypeNumber[type]++;
                if (storeTypeNumber[type] <= this.maxStoreByType) storesByTpeLimit.push(store);
            } else {
                console.log(store.cat);
            }
        }

        // Limit total number of stores
        let storesLimit = storesByTpeLimit.splice(0, this.maxStores);
        let furthestStore = storesLimit[storesLimit.length - 1];
        let furthestDistance = furthestStore.distance;
        
        // Update coordinates to keep the same distance ratio
        let ratioVector = new Vector2(this.ratioDistance / furthestDistance, this.ratioDistance / furthestDistance);
        for (let i = 0; i < storesLimit.length; i++) {
            const store = storesLimit[i];
            store.position.multiplyInPlace(ratioVector);
        }
        return storesLimit;
    }

    getStoreType(category: string) {
        return find(storeCategories, (s) => { return s.match.indexOf(category) != -1 });
    }

    getBase(type: string): Array<Mesh> {
        let storeType = this.getStoreType(type);
        let baseMeshes = [];
        for (let i = 0; i < this.base.length; i++) {
            let mesh = this.base[i].createInstance('');
            mesh.alwaysSelectAsActiveMesh = true;
            mesh.doNotSyncBoundingInfo = true;
            baseMeshes.push(mesh);
        }
        baseMeshes[0].dispose();
        baseMeshes[0] = this.baseCat[storeType.type].createInstance('');
        return baseMeshes;
    }

    getProduct(type: string): TransformNode {
        let storeType = this.getStoreType(type);
        let parent = this.storesModel[storeType.type];
        let parentMesh = this.system.groupInstance(parent)
        
        parentMesh.position.y = 2;
        parentMesh.scaling.x = 4 * storeType.scale;
        parentMesh.scaling.y = 4 * storeType.scale;
        parentMesh.scaling.z = -4 * storeType.scale;
        return parentMesh;
    }

    storesList: Array<Store> = [];
    addStoresModels(stores: Array<StoreData>) {
        let j = 0;
        for (let i = 0; i < stores.length; i++) {
            let store = stores[i];
            let storeType = this.getStoreType(store.cat);
            if (!storeType) {
                console.log('missing ' + store.cat)
            } else {
                let newStore = new Store(this.system, this.modal, this.car);
                let base = this.getBase(store.cat);
                newStore.addMeshesToParent(base);
                let product = this.getProduct(store.cat);
                newStore.addProduct(product);
                newStore.setData(store);
                this.storesList.push(newStore);
                // Removed timeout to avoid stop rendering wich create lag
                // setTimeout(() => {
                newStore.show();
                // this.storesList[i].showAnim();
                // j++;
                // if (j == this.maxStores) this.system.updateShadows();
                // }, i * 200);
            }
        }
        setTimeout(() => {
            this.system.checkActiveMeshes();
            this.system.updateShadows();
        }, 100);
    }

    animateTypeModel(type: string) {
        let typedStores = filter(this.storesList, (s) => { return s.type == type });
        for (let i = 0; i < typedStores.length; i++) {
            typedStores[i].launchRotateAnimation();
        }
    }

    stopAllModelAnimation() {
        for (let i = 0; i < this.storesList.length; i++) {
            this.storesList[i].stopRotateAnimation();
        }
    }
}