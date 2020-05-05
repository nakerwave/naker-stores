import { MeshEntity } from './meshEntity';

import { Mesh } from '@babylonjs/core/Meshes/mesh';

export class ModelEntity extends MeshEntity {

    model: Array<Mesh>;
    loadModel(modelFile: string, callback?: Function) {
        this.system.loadModel(modelFile, (model) => {
            for (let i = 0; i < model.length; i++) {
                const mesh = model[i];
                // mesh.parent = this.mesh;
                // mesh.receiveShadow = true;
                mesh.alwaysSelectAsActiveMesh = true;
                mesh.doNotSyncBoundingInfo = true;
                this.system.shadowGenerator.addShadowCaster(mesh);
            }
            let mainparents = this.system.getModelParents(model);
            mainparents[0].parent = this.mesh;
            
            this.model = model;
            if (callback) callback(model);
        });
    }

    scaleMesh(scale: number) {
        this.mesh.scaling.x = scale;
        this.mesh.scaling.y = scale;
        this.mesh.scaling.z = -scale;
    }

    setNoShadow() {
        for (let i = 0; i < this.model.length; i++) {
            const mesh = this.model[i];
            this.system.shadowGenerator.removeShadowCaster(mesh);
        }
    }
}