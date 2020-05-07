import { UiSystem } from '../System/uiSystem';
import { ModelEntity } from './modelEntity';

import { Vector2 } from '@babylonjs/core/Maths/math';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';
import { ExecuteCodeAction } from '@babylonjs/core/Actions/directActions';

export class House extends ModelEntity {

    color?: Array<number>;
    system: UiSystem;

    constructor(system: UiSystem) {
        super('house', system);
        this.addMesh();
        this.setSize(7);
        this.setPosition(Vector2.Zero());
        this.setRotation(Math.PI);
        this.addModel();
    }
    
    mesh: TransformNode;
    addMesh() {
        this.mesh = new TransformNode(this.key, this.system.scene);
    }
    
    addModel() {
        this.loadModel('Maison-txtr.gltf', (model) => {
            this.hide();
        });
    }

    setPosition(pos: Vector2) {
        this._setPosition(pos);
        this.mesh.position.x = pos.x + 7;
        this.mesh.position.z = pos.y + 1;
        this.mesh.position.y = 1;
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