import { Animation } from '@naker/services/System/systemAnimation';

import { MeshSystem } from '../System/meshSystem';
import { point2D } from '../System/interface';

import { Vector3, Vector2, Color3 } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { EasingFunction, CubicEase, } from '@babylonjs/core/Animations/easing';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';

export interface PositionEntityInterface {
    key?: string,
    position?: point2D,
    size?: number,
}

export let houseDoorWayVector = new Vector2(4, 0);
export let storeDoorWayVector = new Vector2(0, -4);

export class StorePath {

    key: string;
    system: MeshSystem;
    tube: Mesh;
    curve: EasingFunction;
    animation: Animation;

    constructor(system: MeshSystem) {
        this.system = system;
        this.animation = new Animation(this.system);
        this.curve = new CubicEase();
        this.curve.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

        let path = [Vector3.Zero(), new Vector3(0, 1, 0)];
        this.tube = Mesh.CreateTube("tube", path, 0.5, 12, null, null, this.system.scene, true);
        this.tube.alwaysSelectAsActiveMesh = true;
        this.tube.doNotSyncBoundingInfo = true;

        this.tube.material = new PBRMaterial("storeMaterial", this.system.scene);
        this.tube.material.roughness = 1;
        this.tube.material.albedoColor = new Color3(1, 1, 0);
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
        this.tube.position.x = destination.x;
        this.tube.position.z = destination.y;
    }
}