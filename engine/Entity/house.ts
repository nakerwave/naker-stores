import { UiSystem } from '../System/uiSystem';
import { MeshEntity } from './meshEntity';

import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

import '@babylonjs/core/Culling/ray';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';
import { ExecuteCodeAction } from '@babylonjs/core/Actions/directActions';

export class House extends MeshEntity {

    color?: Array<number>;
    system: UiSystem;

    constructor(system: UiSystem) {
        super('house', system);
        this.addMesh();
        this.setSize(13);
        this.hide();
        this.addModel();
    }
    
    mesh: TransformNode;
    addMesh() {
        this.mesh = new TransformNode(this.key, this.system.scene);
    }
    
    addModel() {
        this.loadModel('house', 'maison.glb', (model) => {
            for (let i = 0; i < model.length; i++) {
                const mesh = model[i];
                mesh.rotation.y = Math.PI;
            }
            this.showAnim();
        });
    }

    // GLTF MODEL +WEIRD SCALE
    scaleMesh(scale: number) {
        this.mesh.scaling.x = scale;
        this.mesh.scaling.y = scale/5;
        this.mesh.scaling.z = -scale;
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