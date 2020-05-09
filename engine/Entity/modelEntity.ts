import { MeshEntity } from './meshEntity';

import { Mesh } from '@babylonjs/core/Meshes/mesh';

export class ModelEntity extends MeshEntity {

    model: Array<Mesh>;
    loadModel(modelFile: string, callback?: Function) {
        this.system.loadModel(modelFile, (model) => {
            let mainMesh = model[0];
            
            let children = mainMesh.getChildMeshes();
            this.addMeshes(children);
            this.model = mainMesh;
            if (callback) callback(mainMesh, children);
        });
    }

    addMeshes(meshes: Array<Mesh>) {
        for (let i = 0; i < meshes.length; i++) {
            const mesh: Mesh = meshes[i];
            mesh.parent = this.mesh;
            mesh.isVisible = true;
            // mesh.receiveShadow = true;
            mesh.alwaysSelectAsActiveMesh = true;
            mesh.doNotSyncBoundingInfo = true;
            if (this.system.shadowGenerator) this.system.shadowGenerator.addShadowCaster(mesh);
        }  
    }

    scaleMesh(scale: number) {
        this.mesh.scaling.x = scale;
        this.mesh.scaling.y = scale;
        this.mesh.scaling.z = -scale;
    }

    setNoShadow() {
        for (let i = 0; i < this.model.length; i++) {
            const mesh = this.model[i];
            if (this.system.shadowGenerator) this.system.shadowGenerator.removeShadowCaster(mesh);
        }
    }
}