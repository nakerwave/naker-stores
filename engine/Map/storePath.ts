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

        let path = [Vector3.Zero(), Vector3.Zero()]
        this.tube = Mesh.CreateTube("tube", path, 0.5, 12, null, null, this.system.scene, true);
        this.tube.alwaysSelectAsActiveMesh = true;
        this.tube.doNotSyncBoundingInfo = true;

        this.tube.material = new PBRMaterial("storeMaterial", this.system.scene);
        this.tube.material.roughness = 1;
        this.tube.material.albedoColor = new Color3(1, 1, 0);
    }

    destination: Vector2;
    setDestination(destination: Vector2) {
        this.animation.simple(20, (count, perc) => {
            let easePerc = this.curve.ease(perc);
            let progress = destination.multiply(new Vector2(easePerc, easePerc));
            this.updatePath(progress);
        });
    }

    hide() {
        this.animation.simple(20, (count, perc) => {
            let easePerc = 1 - this.curve.ease(perc);
            let progress = this.destination.multiply(new Vector2(easePerc, easePerc));
            this.updatePath(progress);
        }, () => {
            this.updatePath(Vector2.Zero());
        });
    }

    updatePath(destination: Vector2) {
        this.destination = destination;
        let newPath = [
            Vector3.Zero(),
            new Vector3(destination.x, 0, destination.y)
        ]
        this.tube = Mesh.CreateTube("tube", newPath, 0.5, null, null, null, null, null, null, this.tube);
        this.tube.alwaysSelectAsActiveMesh = true;
        this.tube.doNotSyncBoundingInfo = true;
    }
}