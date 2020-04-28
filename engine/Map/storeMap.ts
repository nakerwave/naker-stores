import { UiSystem } from '../System/uiSystem';
import { Store, StoreData } from '../Entity/store';
import { House } from '../Entity/house';
import { Car } from './car';
import { Ground } from './Ground';
import { ModalUI } from '../Ui/modal';

import { EasingFunction } from '@babylonjs/core/Animations/easing';
import { Vector2 } from '@babylonjs/core/Maths/math';

import stores from '../../asset/stores.json';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class StoreMap {

    system: UiSystem;
    curve: EasingFunction;
    house: House;
    ground: Ground;
    modal: ModalUI;
    car: Car;

    constructor(system: UiSystem, ground: Ground, modal: ModalUI) {
        this.system = system;
        this.ground = ground;
        this.modal = modal;
        this.car = new Car(system);

        this.house = new House(this.system);
    }

    center = Vector2.Zero();
    storesNearby: Array<any> = [];
    updateStores(latlng: Array<number>) {
        // this.center = this.ground.getRandomPosition(0.5);
        let storesNearby = this.getStoresInBox(latlng);
        this.storesNearby = this.setStorePositionInGrid(storesNearby);
        this.ground.newDecor(this.gridSpot, () => {
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

    gridSpot: Array<Array<string>>;
    spotWidthNumber = 20;
    setStorePositionInGrid(storesNearby: Array<StoreData>): Array<StoreData> {
        this.gridSpot = Array(this.spotWidthNumber).fill().map(() => Array(this.spotWidthNumber).fill());
        // Do not put store where the house is
        this.gridSpot[this.spotWidthNumber/2][this.spotWidthNumber/2] = 'house';
        for (let i = 0; i < storesNearby.length; i++) {
            const store = storesNearby[i];
            store.position = this.getStoreSpot(store);
        }
        // console.log(storesNearby);
        return storesNearby;
    }

    spotWidth = 10;
    getStoreSpot(store) {
        let pos = store.position;
        let roundPos = { x: Math.round(pos.x / this.spotWidth), y: Math.round(pos.y / this.spotWidth) };
       
        let offset = this.spotWidthNumber / 2;
        let gridPos = { x: roundPos.x + offset, y: roundPos.y + offset };
        
        while (this.gridSpot[gridPos.x][gridPos.y]) {
            gridPos.x += Math.round((Math.random() - 0.5) * 2);
            gridPos.y += Math.round((Math.random() - 0.5) * 2);
        }
        this.gridSpot[gridPos.x][gridPos.y] = store.name;

        pos.x = (gridPos.x - offset) * this.spotWidth;
        pos.y = (gridPos.y - offset) * this.spotWidth;
        return pos;
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
            setTimeout(() => {
                this.storeModels[j].showAnim();
                this.system.checkActiveMeshes();
                j++;
                if (j == this.maxStores) this.system.updateShadows();
            }, i * 200);
        }
    }
}