import { MeshSystem } from '../System/meshSystem';
import { MeshEntity } from './meshEntity';

import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

export class Tree extends MeshEntity {

    constructor(system: MeshSystem) {
        super('tree', system);

        this.addMesh();
        this.setSize(1);
        this.setRotation(Math.PI / 2);
        this.addModel();
    }

    mesh: TransformNode;
    addMesh() {
        this.mesh = new TransformNode(this.key, this.system.scene);
    }

    addModel() {
        this.loadModel('tree', 'low_poly_trees_grass_and_rocks/scene.gltf', (model) => {
            console.log(model);
            
        });
    }
}