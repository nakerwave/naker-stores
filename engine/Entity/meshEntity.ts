import { MeshSystem } from '../System/meshSystem';

import { Vector2 } from '@babylonjs/core/Maths/math';
import { PositionEntity } from './positionEntity';
import { Animation } from '@naker/services/System/systemAnimation';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { EasingFunction, CubicEase, } from '@babylonjs/core/Animations/easing';

export class MeshEntity extends PositionEntity {

    animation: Animation;
    showCurve: EasingFunction;

    constructor(name: string, system: MeshSystem) {
        super(name, system);
        this.animation = new Animation(this.system);
        this.showCurve = new CubicEase();
        this.showCurve.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    }

    mesh: TransformNode;
    setSize(size: number) {
        this._setSize(size);
    }

    scaleMesh(scale: number) {
        this.mesh.scaling.x = scale;
        this.mesh.scaling.y = scale;
        this.mesh.scaling.z = -scale;
    }

    setPosition(pos: Vector2) {
        this._setPosition(pos);
        this.mesh.position.x = pos.x;
        this.mesh.position.z = pos.y;
        this.mesh.position.y = 0.1;
    }

    setRotation(rot: number) {
        this.mesh.rotation.y = rot;
    }

    showAnimLength = 20;
    showAnim(callback?: Function) {
        // this.mesh.isVisible = true;
        this.scaleMesh(0);
        this.animation.simple(this.showAnimLength, (count, perc) => {
            let easePerc = this.showCurve.ease(perc);
            this.scaleMesh(easePerc * this.size);
        }, () => {
            this.show();
            if (callback) callback();
        });
    }

    hideAnim(callback?: Function) {
        this.animation.simple(this.showAnimLength, (count, perc) => {
            let easePerc = this.showCurve.ease(perc);
            this.scaleMesh((1 - easePerc) * this.size);
        }, () => {
            this.hide();
            if (callback) callback();
            // this.mesh.isVisible = false;
        });
    }

    show() {
        // this.mesh.isVisible = true;
        this.scaleMesh(this.size);
    }

    hide() {
        this.scaleMesh(0);
    }
}