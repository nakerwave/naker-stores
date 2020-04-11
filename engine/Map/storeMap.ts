import { UiSystem } from '../System/uiSystem';
import { Store } from '../Entity/store';
import { House } from '../Entity/house';

import { EasingFunction } from '@babylonjs/core/Animations/easing';
import { Vector2 } from '@babylonjs/core/Maths/math';

import stores from '../../asset/stores.json';
import { Ground } from './Ground';
import { ModalUI } from 'engine/Ui/modal';
import { StorePath } from './storePath';
import { Road } from './road';

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
    storePath: StorePath;

    constructor(system: UiSystem, ground: Ground, modal: ModalUI) {
        this.system = system;
        this.ground = ground;
        this.modal = modal;
        this.storePath = new StorePath(system);

        this.house = new House(this.system);
    }

    center = Vector2.Zero();
    updateStores(latlng: Array<number>) {
        // this.center = this.ground.getRandomPosition(0.5);
        
        this.ground.animFog(() => {
            this.showStoresOnMap(latlng);
        });
        this.hideCurrentStores();
    }

    hideCurrentStores() {
        this.house.hideAnim();
        for (let i = 0; i < this.storeModels.length; i++) {
            const storeModel = this.storeModels[i];
            storeModel.hideAnim();
        }
    }

    storesNearby: Array<any> = [];
    showStoresOnMap(latlng: Array<number>) {
        let storesNearby = this.getStoresInBox(latlng);
        this.storesNearby = this.setStorePositionInGrid(storesNearby);
        this.addStoresModels(this.storesNearby);
        this.addStoresRoads(this.storesNearby);
    }

    gridSpot: Array<Array<any>>;
    spotWidthNumber = 20;
    setStorePositionInGrid(storesNearby: Array<any>): Array<any> {
        this.gridSpot = Array(this.spotWidthNumber).fill().map(() => Array(this.spotWidthNumber).fill());
        
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
    getStoresInBox(latlng: Array<number>): Array<any> {
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
        
        let ratioVector = new Vector2(30 / furthestDistance, 30 / furthestDistance);
        for (let i = 0; i < storesLimit.length; i++) {
            const store = storesLimit[i];
            store.position.multiplyInPlace(ratioVector);
        }
        return storesLimit;
    }

    storeModels: Array<Store> = [];
    addStoresModels(stores: Array<any>) {
        this.house.setPosition(this.center);
        this.house.showAnim();
        let j = 0;
        for (let i = 0; i < stores.length; i++) {
            setTimeout(() => {
                let store = stores[j];
                let newStore = new Store(this.system, this.modal, this.storePath);
                newStore.setPosition(store.position);
                newStore.setStore(store.cat, store.name, [store.lon, store.lat]);
                newStore.showAnim();
                this.storeModels.push(newStore);
                j++;
                this.system.checkActiveMeshes();
            }, i * 200);
        }
    }

    addStoresRoads(stores: Array<any>) {
        let SouthWestPath: Array<Vector2> = [ Vector2.Zero() ];
        let SouthEstPath: Array<Vector2> = [ Vector2.Zero() ];
        let NorthWestPath: Array<Vector2> = [ Vector2.Zero() ];
        let NorthEstPath: Array<Vector2> = [ Vector2.Zero() ];
        let doorWayVector = new Vector2(0, 3);
        for (let i = 0; i < stores.length; i++) {
            let store = stores[i];
            let pos = store.position;
            let doorPos = pos.subtract(doorWayVector);
            if (pos.x <= 0 && pos.y < 0) SouthWestPath.push(doorPos);
            if (pos.x > 0 && pos.y <= 0) SouthEstPath.push(doorPos);
            if (pos.x <= 0 && pos.y > 0) NorthWestPath.push(doorPos);
            if (pos.x > 0 && pos.y >= 0) NorthEstPath.push(doorPos);
        }

        console.log(SouthWestPath, SouthEstPath, NorthWestPath, NorthEstPath);
        
        if (SouthWestPath.length > 1) new Road({ path: SouthWestPath, width: 1, closed: false, standardUV: false }, this.system.scene);
        if (SouthEstPath.length > 1) new Road({ path: SouthEstPath, width: 1, closed: false, standardUV: false }, this.system.scene);
        if (NorthWestPath.length > 1) new Road({ path: NorthWestPath, width: 1, closed: false, standardUV: false }, this.system.scene);
        if (NorthEstPath.length > 1) new Road({ path: NorthEstPath, width: 1, closed: false, standardUV: false }, this.system.scene);

    }
}