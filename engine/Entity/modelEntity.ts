import { MeshEntity } from './meshEntity';

import { Mesh } from '@babylonjs/core/Meshes/mesh';

export class ModelEntity extends MeshEntity {

    model: Array<Mesh>;
    loadModel(modelFile: string, callback?: Function) {
        this.system.loadModel(modelFile, (model) => {
            for (let i = 0; i < model.length; i++) {
                const mesh = model[i];
                mesh.parent = this.mesh;
                // mesh.receiveShadow = true;
                mesh.alwaysSelectAsActiveMesh = true;
                mesh.doNotSyncBoundingInfo = true;
                this.system.shadowGenerator.addShadowCaster(mesh);
            }
            if (callback) callback(model);
            this.model = model;
        });
    }
}