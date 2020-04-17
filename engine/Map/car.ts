import { Animation } from '@naker/services/System/systemAnimation';

import { MeshSystem } from '../System/meshSystem';
import { point2D } from '../System/interface';
import { MeshEntity } from '../Entity/meshEntity';

import { Vector2 } from '@babylonjs/core/Maths/math';
import { EasingFunction, CubicEase, } from '@babylonjs/core/Animations/easing';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

export interface PositionEntityInterface {
    key?: string,
    position?: point2D,
    size?: number,
}

export let houseDoorWayVector = new Vector2(4, 0);
export let storeDoorWayVector = new Vector2(0, -4);

export class Car extends MeshEntity {

    curve: EasingFunction;
    animation: Animation;

    constructor(system: MeshSystem) {
        super('car', system);
        this.animation = new Animation(this.system);
        this.curve = new CubicEase();
        this.curve.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

        this.addMesh();
        this.setSize(1);
        this.hide();
        this.addModel();
        this.setPosition(houseDoorWayVector);
    }


    mesh: TransformNode;
    addMesh() {
        this.mesh = new TransformNode(this.key, this.system.scene);
    }

    addModel() {
        this.loadModel('car', 'Voiture2.glb', (model) => {
            for (let i = 0; i < model.length; i++) {
                const mesh = model[i];
                mesh.rotation.z = -Math.PI / 2;
                mesh.position.y = 1;
            }
            this.showAnim();
        });
    }

    destination: Vector2;
    animLength = 50;
    setDestination(destination: Vector2) {
        let doorWayDestination = destination.add(storeDoorWayVector);
        let change = doorWayDestination.subtract(houseDoorWayVector);
        this.animation.simple(this.animLength, (count, perc) => {
            let easePerc = this.curve.ease(perc);
            let progress: Vector2;
            if (easePerc < 0.5) progress = change.multiply(new Vector2(0, easePerc * 2));
            else progress = change.multiply(new Vector2(2 * easePerc - 1, 1));
            let pos = houseDoorWayVector.add(progress);
            this.destination = pos;
            this.setPosition(pos);
        });
    }

    hide() {
        if (!this.destination) return;
        let change = this.destination.subtract(houseDoorWayVector);
        this.animation.simple(this.animLength, (count, perc) => {
            let easePerc = 1 - this.curve.ease(perc);
            let progress: Vector2;
            if (easePerc < 0.5) progress = change.multiply(new Vector2(0, easePerc * 2));
            else progress = change.multiply(new Vector2(2 * easePerc - 1, 1));
            let pos = houseDoorWayVector.add(progress);
            this.setPosition(pos);
        }, () => {
            this.setPosition(houseDoorWayVector);
        });
    }

    setPosition(destination: Vector2) {
        this.mesh.position.x = destination.x;
        this.mesh.position.z = destination.y;
    }
}