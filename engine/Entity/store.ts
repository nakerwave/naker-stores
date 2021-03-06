import { UiSystem } from '../System/uiSystem';
import { ModalUI } from '../Ui/modal';
import { ModelEntity } from './modelEntity';
import { Road } from '../Map/road';
// import { RoadCylinder } from '../Map/roadCylinder';

import { Color3, Vector2, Vector3, Quaternion } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Control } from '@babylonjs/gui/2D/controls/control';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';
import { ExecuteCodeAction } from '@babylonjs/core/Actions/directActions';

import { ui_text, ui_image } from '../Ui/node';
import { Car, houseDoorWayVector, storeDoorWayVector } from './car';

import pancarteUrl from '../../asset/pancarte4.png';

export interface StoreInterface {
    type: string;
    match: string;
    color: Color3;
    model: string;
    scale: number;
    ingredientList: string;
    legendImage: string;
};

export interface StoreData {
    name: string;
    position: any;
    cat: string;
    lon: number;
    lat: number;
    distance: number;
}

export let storeCategories: Array < StoreInterface > = [
    {
        type: 'farm',
        match: 'garden_center farm florist',
        color: new Color3(1, 0, 0),
        model: 'panier2.gltf',
        scale: 0.8,
        ingredientList: 'Ferme_Epicerie_Fleuriste',
        legendImage: 'grocery.JPG',
    },
    {
        type: 'cheese',
        match: 'cheese',
        color: new Color3(1, 1, 0),
        model: 'Lait.glb',
        scale: 0.6,
        ingredientList: 'Fromager_Crémier',
        legendImage: 'milk.JPG',
    },
    {
        type: 'seafood',
        match: 'seafood',
        color: new Color3(0, 0, 1),
        model: 'Poisson2.glb',
        scale: 0.2,
        ingredientList: 'Poissonnier',
        legendImage: 'fish.JPG',
    },
    {
        type: 'greengrocer',
        match: 'greengrocer beverages',
        color: new Color3(0, 0.7, 0),
        model: 'Legumes_bqt.gltf',
        scale: 1.3,
        ingredientList: 'Primeur',
        legendImage: 'vegetables.JPG',
    },
    {
        type: 'alcohol',
        match: 'wine alcohol biergarten',
        color: new Color3(0.5, 0, 0),
        model: 'Vin.glb',
        scale: 0.6,
        ingredientList: 'Cave à bière_Cave à vin_Vente de liqueur',
        legendImage: 'alcohol.JPG',
    },
    {
        type: 'bakery',
        match: 'pastry bakery chocolate',
        color: new Color3(0.5, 0.3, 0),
        model: 'Pain4.gltf',
        scale: 0.4,
        ingredientList: 'Boulangerie_Patisserie_Chocolatier',
        legendImage: 'bakery.JPG',
    },
    {
        type: 'butcher',
        match: 'butcher',
        color: new Color3(1, 0.9, 0.9),
        model: 'Viande.glb',
        scale: 0.7,
        ingredientList: 'Boucher',
        legendImage: 'butcher.JPG',
    },
];

export class Store extends ModelEntity {

    color?: Array<number>;
    system: UiSystem;
    modal: ModalUI;
    car: Car;

    constructor(system: UiSystem, modal: ModalUI, car: Car) {
        super('store', system);
        this.modal = modal;
        this.car = car;

        this.setSize(2);
        this.addEventMesh();
        this.addLabel();
        this.hide();
    }

    eventMesh: Mesh;
    addEventMesh() {
        // this.mesh = MeshBuilder.CreateIcoSphere(this.key + "star", { radius: 1, flat: true, subdivisions: 2 }, this.system.scene);
        // this.mesh = this.system.StoreMesh.clone(this.key + "duststar");
        this.eventMesh = MeshBuilder.CreateBox("store", {}, this.system.scene);
        // this.mesh = this.system.storeMesh.createInstance(this.key + "duststar");
        this.eventMesh.alwaysSelectAsActiveMesh = true;
        this.eventMesh.doNotSyncBoundingInfo = true;
        this.eventMesh.isVisible = true;
        this.eventMesh.visibility = 0.0001;
        this.eventMesh.scaling = new Vector3(this.size * 1.2, this.size * 1.2, this.size * 1.2);
        this.eventMesh.parent = this.mesh;
    }

    setPosition(pos: Vector2) {
        this._setPosition(pos);
        this.mesh.position.x = pos.x;
        this.mesh.position.z = pos.y;
        this.mesh.position.y = 2;
    }

    setEvent() {
        this.on('click', () => {
            this.modal.show(this.latlng, this.name);
        });
        this.on('enter', () => {
            this.launchRotateAnimation();            
            if (this.name) this.showLabel();
            this.car.setDestination(this.position);
            this.car.checkTransportMode(this.distance);
        });
        this.on('leave', () => {
            this.stopRotateAnimation();
            this.hideLabel();
            this.car.backToHome();
        });
    }

    label: ui_text;
    board: ui_image;
    labelpresent = false;
    yLabelOfffset = 80;
    addLabel() {
        this.board = new ui_image(this.system, this.system.advancedTexture, pancarteUrl, { x: 0, y: 0 }, { width: '150px' });
        this.board.container.linkOffsetY = this.yLabelOfffset;
        this.board.container.linkWithMesh(this.mesh);

        this.label = new ui_text(this.system, this.system.advancedTexture, '', { x: 0, y: 0 }, { width: '120px', fontSize: 14, float: 'center' });
        this.label.setTextStyle({ textVerticalAlignment: Control.VERTICAL_ALIGNMENT_TOP });
        this.label.setStyle({ cornerRadius: 0, zInex: 1000, height: '100px' });
        this.label.container.linkOffsetY = this.yLabelOfffset;
        this.label.container.linkOffsetX = -10;
        this.label.container.linkWithMesh(this.mesh);

        this.hideLabel();
    }

    setData(store: StoreData) {
        this.setPosition(store.position);
        this.setStore(store.cat, store.name, [store.lon, store.lat], store.distance);
        this.addRoad(store.position);
        this.setEvent();
    }
    
    roadStopScale = new Vector2(1.1, 1);
    road: Road;
    addRoad(pos: Vector2) {
        let path = [
            houseDoorWayVector,
            new Vector2(houseDoorWayVector.x, pos.y + storeDoorWayVector.y),
            new Vector2(pos.x, pos.y + storeDoorWayVector.y).multiply(this.roadStopScale),
        ];
        this.road = new Road(path, this.system);
    }

    type: string;
    name: string;
    latlng: Array<number>;
    distance: number;
    setStore(type: string, name: string, latlng: Array<number>, distance: number) {
        this.type = type;
        this.name = name;
        this.latlng = latlng;
        this.distance = distance;
        this.setLabelText(name);
    }
    
    storeParent: TransformNode;
    addProduct(mesh: TransformNode) {
        mesh.parent = this.mesh;
        this.storeParent = mesh;
        this.setStoreModelRotation(0);
    }

    currentRotation: number = 0;
    rotating = false;
    launchRotateAnimation() {
        this.rotating = true;
        this.animation.infinite((perc, count) => {
            this.currentRotation = count / 20 % (Math.PI * 2);
            this.setStoreModelRotation(this.currentRotation);
        });
    }

    stopRotateAnimation() {
        if (!this.rotating) return;
        this.rotating = false;
        this.animation.simple(50, (perc) => {
            let easePerc = this.showCurve.ease(1 - perc);
            let rotation = easePerc * this.currentRotation;
            this.setStoreModelRotation(rotation);
        });
    }

    setStoreModelRotation(rotation: number) {
        this.storeParent.rotation.y = rotation;
        this.storeParent.rotationQuaternion = Quaternion.RotationYawPitchRoll(rotation, 0, 0);
        // this.storeParent.scaling.x = rotation;
        // this.storeParent.scaling.y = rotation;
        // this.storeParent.scaling.z = rotation;
    }

    hideAnim(callback?: Function) {
        this.animation.simple(this.showAnimLength, (perc) => {
            let easePerc = this.showCurve.ease(perc);
            this.scaleMesh((1 - easePerc) * this.size);
            this.label.setOpacity(1 - easePerc);
        }, () => {
            this.hide();
            if (callback) callback();
        });
    }

    maxLabelLength: 20;
    setLabelText(text: string) {
        let labelText = text.substring(0, this.maxLabelLength);
        this.label.setText(labelText);
        this.label.hide();
    }

    showLabel() {
        this.label.show();
        this.board.show();
    }

    hideLabel() {
        this.label.hide();
        this.board.hide();
    }
    
    show() {
        this.scaleMesh(this.size);
    }

    hide() {
        if (this.road) this.road.dispose();
        this.hideLabel();
        this.scaleMesh(0);
    }

    renameEvent = {
        click: 'OnPickTrigger',
        dbclick: 'OnDoublePickTrigger',
        rightclick: 'OnRightPickTrigger',
        leftclick: 'OnLeftPickTrigger',
        mousedown: 'OnPickDownTrigger',
        enter: 'OnPointerOverTrigger',
        leave: 'OnPointerOutTrigger',
    };
    on(event: string, funct: Function) {
        if (this.eventMesh.actionManager == undefined) this.eventMesh.actionManager = new ActionManager(this.system.scene);
        let babylonevent = this.renameEvent[event];
        this.eventMesh.actionManager.registerAction(new ExecuteCodeAction(ActionManager[babylonevent], () => {
            funct();
        }));
    }
}