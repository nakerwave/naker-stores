import { UiSystem } from '../System/uiSystem';
import { MeshEntity } from './meshEntity';

import { Color3 } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';

import '@babylonjs/core/Culling/ray';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';
import { ExecuteCodeAction } from '@babylonjs/core/Actions/directActions';

export class House extends MeshEntity {

    color?: Array<number>;
    system: UiSystem;

    constructor(system: UiSystem) {
        super('house', system);
        this.setSize(2);
        this.addMesh();
        this.hide();
    }

    mesh: Mesh;
    addMesh() {
        // this.mesh = MeshBuilder.CreateIcoSphere(this.key + "star", { radius: 1, flat: true, subdivisions: 2 }, this.system.scene);
        // this.mesh = this.system.StoreMesh.clone(this.key + "duststar");
        this.mesh = MeshBuilder.CreateSphere("house", {}, this.system.scene);
        // this.mesh = this.system.storeMesh.createInstance(this.key + "duststar");
        this.mesh.alwaysSelectAsActiveMesh = true;
        this.mesh.doNotSyncBoundingInfo = true;
        this.mesh.isVisible = true;
        this.mesh.rotation.y = Math.PI/3;
        this.mesh.material = new PBRMaterial("storeMaterial", this.system.scene);
        this.mesh.material.roughness = 1;
    }

    setEvent() {
        this.on('enter', () => {
            
        });
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