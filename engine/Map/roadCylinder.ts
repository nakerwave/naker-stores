import { Animation } from '@naker/services/System/systemAnimation';

import { MeshSystem } from '../System/meshSystem';
import { point2D } from '../System/interface';

import { Vector3, Vector2, Color3 } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { EasingFunction, CubicEase, } from '@babylonjs/core/Animations/easing';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';

import roadTexture from '../../asset/road5.jpg';

export interface PositionEntityInterface {
    key?: string,
    position?: point2D,
    size?: number,
}

export class RoadCylinder {

    key: string;
    system: MeshSystem;
    tube: Mesh;
    curve: EasingFunction;
    animation: Animation;

    constructor(points: Array<Vector2>, system: MeshSystem) {
        this.system = system;
        this.animation = new Animation(this.system);
        this.curve = new CubicEase();
        this.curve.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

        this.createTube(points);

        // this.setPath(points);
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
            Vector2.Zero(),
            destination
        ];
        this.setPath(newPath);
    }

    radiusSize = 2;
    getPathFromVector2(points: Array<Vector2>): Array<Vector3> {
        let newPath: Array<Vector3> = [];
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            newPath.push(new Vector3(point.x, -this.radiusSize + 0.5, point.y));
        }
        return newPath;
    }

    createTube(points: Array<Vector2>) {
        let newPath = this.getPathFromVector2(points);
        // let path = [Vector3.Zero(), Vector3.Zero()]
        
        this.tube = Mesh.CreateTube("tube", newPath, this.radiusSize, 12, null, null, this.system.scene, true);
        this.tube.alwaysSelectAsActiveMesh = true;
        this.tube.doNotSyncBoundingInfo = true;

        let material = new PBRMaterial("storeMaterial", this.system.scene);
        material.roughness = 1;
        material.emissiveColor = new Color3(0.5, 0.5, 0.2);
        // material.albedoTexture = new Texture(roadTexture, this.system.scene);
        this.tube.material = material;
    }
    
    setPath(points: Array<Vector2>) {
        let newPath = this.getPathFromVector2(points);
        this.tube = Mesh.CreateTube("tube", newPath, 0.5, null, null, null, null, null, null, this.tube);
        this.tube.alwaysSelectAsActiveMesh = true;
        this.tube.doNotSyncBoundingInfo = true;

    }
}