import { UiSystem } from '../System/uiSystem';
import { Store, StoreData } from '../Entity/store';
import { Car } from './car';
import { Ground } from './Ground';
import { ModalUI } from '../Ui/modal';
import { TileMap } from './tileMap';

import { Vector2 } from '@babylonjs/core/Maths/math';

import stores from '../../asset/stores.json';

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
        for (let i = 0; i < this.storeModels.length; i++) {
            const storeModel = this.storeModels[i];
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
    searchDistance = 0.3;
    ratioDistance = 50;
    getStoresInBox(latlng: Array<number>): Array<StoreData> {
        let storesInBox = [];
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

        let storesSorted = storesInBox.sort((a, b) => {
            return a.distance - b.distance;
        });
        let storesLimit = storesSorted.splice(0, this.maxStores);
        let furthestStore = storesLimit[storesLimit.length - 1];
        let furthestDistance = furthestStore.distance;
        
        let ratioVector = new Vector2(this.ratioDistance / furthestDistance, this.ratioDistance / furthestDistance);
        for (let i = 0; i < storesLimit.length; i++) {
            const store = storesLimit[i];
            store.position.multiplyInPlace(ratioVector);
        }
        return storesLimit;
    }

    storeModels: Array<Store> = [];
    addStoresModels(stores: Array<StoreData>) {
        let j = 0;
        for (let i = 0; i < stores.length; i++) {
            let newStore = new Store(this.system, this.modal, this.car);
            let store = stores[i];
            newStore.setData(store);
            this.storeModels.push(newStore);
            // Removed timeout to avoid stop rendering wich create lag
            // setTimeout(() => {
            this.storeModels[i].showAnim();
            // j++;
            // if (j == this.maxStores) this.system.updateShadows();
            // }, i * 200);
        }
        this.system.checkActiveMeshes();
        setTimeout(() => {
            this.system.updateShadows();
        }, 2000);
    }
}