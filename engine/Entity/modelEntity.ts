import { MeshEntity } from './meshEntity';

import { Mesh } from '@babylonjs/core/Meshes/mesh';

export class ModelEntity extends MeshEntity {

    model: Array<Mesh>;
    parentModel: Mesh;
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
            let parentModel = mainparents[0];
            parentModel.parent = this.mesh;
            
            this.model = model;
            this.parentModel = parentModel;
            if (callback) callback(model, parentModel);
        });
    }

    setNoShadow() {
        for (let i = 0; i < this.model.length; i++) {
            const mesh = this.model[i];
            this.system.shadowGenerator.removeShadowCaster(mesh);
        }
    }
}