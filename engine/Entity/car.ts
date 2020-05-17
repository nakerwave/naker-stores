import { Animation } from '@naker/services/System/systemAnimation';

import { MeshSystem } from '../System/meshSystem';
import { ModelEntity } from './modelEntity';

import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Vector2, Vector3, Quaternion } from '@babylonjs/core/Maths/math';
import { EasingFunction, CubicEase, } from '@babylonjs/core/Animations/easing';

export let houseDoorWayVector = new Vector2(4, 0);
export let storeDoorWayVector = new Vector2(0, -4);

export class Car extends ModelEntity {

    curve: EasingFunction;
    animation: Animation;

    constructor(system: MeshSystem) {
        super('car', system);
        this.animation = new Animation(this.system);
        this.curve = new CubicEase();
        this.curve.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

        this.setSize(4);
        this.addModel();
        this.setPosition(houseDoorWayVector);
    }

    carModel: Array<Mesh>;
    scooterModel: Array<Mesh>;
    shoeModel: Array<Mesh>;
    addModel() {
        this.loadModel('Voiture2.glb', (parent, children) => {
            this.carModel = children;
            parent.position = new Vector3(0, 0.1, 0);
            this.checkAllModelLoaded();
        });
        this.loadModel('trottinette.gltf', (parent, children) => {
            this.scooterModel = children;
            parent.position = new Vector3(0.2, -0.1, 0);
            this.checkAllModelLoaded();
        });
        this.loadModel('chaussure.gltf', (parent, children) => {
            this.shoeModel = children;
            parent.rotation = new Vector3(0, Math.PI / 2, 0);
            parent.position = new Vector3(0, -0.1, 0);
            this.checkAllModelLoaded();
        });
        this.setRotation(0);
    }
    
    modelLoaded = 0;
    checkAllModelLoaded() {
        this.modelLoaded++;
        if (this.modelLoaded == 3) {
            this.setModel('car');
            this.hide();
            this.setNoShadow();
        }
    }

    checkTransportMode(distance: number) {
        if (distance > 0.06) this.setModel('car');
        else if (distance > 0.01) this.setModel('scooter');
        else this.setModel('shoe');
    }

    setModel(model: 'car' | 'scooter' | 'shoe') {
        this.hideMeshes(this.carModel);
        this.hideMeshes(this.scooterModel);
        this.hideMeshes(this.shoeModel);

        if (model == 'car') this.showMeshes(this.carModel);
        else if (model == 'scooter') this.showMeshes(this.scooterModel);
        else if (model == 'shoe') this.showMeshes(this.shoeModel);
        this.system.checkActiveMeshes();
    }

    setRotation(rotation: number) {
        this.mesh.rotation.y = rotation;
        this.mesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(rotation, 0, 0);
    }

    destination: Vector2;
    animLength = 50;
    setDestination(destination: Vector2) {
        let doorWayDestination = destination.add(storeDoorWayVector);
        let change = doorWayDestination.subtract(houseDoorWayVector);
        this.animation.simple(this.animLength, (perc) => {
            let easePerc = this.curve.ease(perc);
            let progress: Vector2;
            if (easePerc < 0.5) {
                progress = change.multiply(new Vector2(0, easePerc * 2));
                if (destination.y > 0) this.setRotation(Math.PI);
                else this.setRotation(0);
            } else {
                if (destination.x > 0) this.setRotation(-Math.PI / 2);
                else this.setRotation(Math.PI/2);
                progress = change.multiply(new Vector2(2 * easePerc - 1, 1));
            }
            
            let pos = houseDoorWayVector.add(progress);
            this.destination = pos;
            this.setPosition(pos);
        });
    }

    backToHome() {
        if (!this.destination) return;
        let change = this.destination.subtract(houseDoorWayVector);
        this.animation.simple(this.animLength, (perc) => {
            let easePerc = 1 - this.curve.ease(perc);
            let progress: Vector2;
            if (easePerc > 0.5) {
                progress = change.multiply(new Vector2(2 * easePerc - 1, 1));
                if (change.x > 0) this.setRotation(Math.PI / 2);
                else this.setRotation(-Math.PI / 2);
            } else {
                progress = change.multiply(new Vector2(0, easePerc * 2));
                if (change.y > 0) this.setRotation(0);
                else this.setRotation(Math.PI);
            }
            let pos = houseDoorWayVector.add(progress);
            this.setPosition(pos);
        }, () => {
            this.setPosition(houseDoorWayVector);
        });
    }

    setPosition(pos: Vector2) {
        this._setPosition(pos);
        this.mesh.position.x = pos.x;
        this.mesh.position.z = pos.y;
        this.mesh.position.y = 1;
    }
}