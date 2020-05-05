import { MeshSystem } from '../System/meshSystem';
import { point2D } from '../System/interface';

import { Vector2 } from '@babylonjs/core/Maths/math';

export interface PositionEntityInterface {
    key?: string,
    position ? : point2D,
    size?: number,
}

export class PositionEntity {

    key: string;
    system: MeshSystem;

    velocity?: number;
    
    constructor(type:string, system: MeshSystem) {
        this.system = system;
        this.key = type + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    
    position: Vector2;
    _setPosition(pos: Vector2) {
        this.position = pos;
    }
    
    size: number;
    _setSize(size: number) {
        this.size = size;
    }
}