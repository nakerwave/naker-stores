import { UiSystem } from '../System/uiSystem';
import { ModalUI } from '../Ui/modal';
import { MeshEntity } from './meshEntity';

import { Color3 } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { Control } from '@babylonjs/gui/2D/controls/control';

import '@babylonjs/core/Culling/ray';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';
import { ExecuteCodeAction } from '@babylonjs/core/Actions/directActions';

import find from 'lodash/find';
import { ui_text } from '../Ui/node';
import { StorePath } from 'engine/Map/storePath';

export interface StoreInterface {
    name: string;
    color: Color3;
};

export let storeList: Array < StoreInterface > = [
    {
        name: 'farm',
        color: new Color3(1, 0, 0),
    },
    {
        name: 'cheese',
        color: new Color3(0, 1, 0),
    },
    {
        name: 'seafood',
        color: new Color3(0, 0, 1),
    },
    {
        name: 'greengrocer',
        color: new Color3(1, 1, 0),
    },
    {
        name: 'wine',
        color: new Color3(0, 1, 1),
    },
    {
        name: 'pastry',
        color: new Color3(1, 0, 1),
    },
];

export class Store extends MeshEntity {

    color?: Array<number>;
    system: UiSystem;
    modal: ModalUI;
    storePath: StorePath;

    constructor(system: UiSystem, modal: ModalUI, storePath: StorePath) {
        super('store', system);
        this.modal = modal;
        this.storePath = storePath;

        this.setSize(4);
        this.addMesh();
        this.addLabel();
        this.hide();
        this.setEvent();
    }

    mesh: Mesh;
    addMesh() {
        // this.mesh = MeshBuilder.CreateIcoSphere(this.key + "star", { radius: 1, flat: true, subdivisions: 2 }, this.system.scene);
        // this.mesh = this.system.StoreMesh.clone(this.key + "duststar");
        this.mesh = MeshBuilder.CreateBox("store", {}, this.system.scene);
        // this.mesh = this.system.storeMesh.createInstance(this.key + "duststar");
        this.mesh.alwaysSelectAsActiveMesh = true;
        this.mesh.doNotSyncBoundingInfo = true;
        this.mesh.isVisible = true;
        // this.mesh.rotation.y = Math.PI/3;
        this.mesh.material = new PBRMaterial("storeMaterial", this.system.scene);
        this.mesh.material.roughness = 1;
    }

    setEvent() {
        this.on('click', () => {
            this.modal.show(this.latlng);
        });
        this.on('enter', () => {
            this.showLabel();
            this.storePath.setDestination(this.position);
        });
        this.on('leave', () => {
            this.hideLabel();
            this.storePath.hide();
        });
    }

    label: ui_text;
    labelpresent = false;
    addLabel() {
        this.label = new ui_text(this.system, this.system.sceneAdvancedTexture, '', { x: 0, y: 0 }, { fontSize: 20, float: 'center' });
        this.label.setTextStyle({ textVerticalAlignment: Control.VERTICAL_ALIGNMENT_TOP });
        this.label.setStyle({ cornerRadius: 5 });
        // this.label.setStyle({ cornerRadius: 5, paddingLeft: 5, paddingRight: 5 });
        this.label.container.linkOffsetY = 60;
        this.label.container.linkWithMesh(this.mesh);
    }

    name: string;
    latlng: Array<number>
    setStore(type: string, name: string, latlng: Array<number>) {
        this.name = name;
        this.latlng = latlng;
        let storeType = find(storeList, (s) => { return s.name == type });
        this.mesh.material.albedoColor = storeType.color;
        this.label.setStyle({background: storeType.color.toHexString()});
    }

    // showAnim(callback?: Function) {
    //     // this.mesh.isVisible = true;
    //     this.scaleMesh(0);
    //     this.animation.simple(this.showAnimLength, (count, perc) => {
    //         let easePerc = this.showCurve.ease(perc);
    //         this.scaleMesh(easePerc * this.size);
    //     }, () => {
    //         this.show();
    //         if (callback) callback();
    //     });
    // }

    hideAnim(callback?: Function) {
        this.animation.simple(this.showAnimLength, (count, perc) => {
            let easePerc = this.showCurve.ease(perc);
            this.scaleMesh((1 - easePerc) * this.size);
            this.label.setOpacity(1 - easePerc);
        }, () => {
            this.hide();
            if (callback) callback();
            // this.mesh.isVisible = false;
        });
    }

    showLabel() {
        this.label.show();
        this.label.writeText(this.name);
    }

    hideLabel() {
        this.label.anim.stop();
        this.label.hide();
    }
    
    show() {
        this.scaleMesh(this.size);
    }

    hide() {
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
        if (this.mesh.actionManager == undefined) this.mesh.actionManager = new ActionManager(this.system.scene);
        let babylonevent = this.renameEvent[event];
        this.mesh.actionManager.registerAction(new ExecuteCodeAction(ActionManager[babylonevent], () => {
            funct();
        }));
    }
}