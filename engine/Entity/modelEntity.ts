import { MeshEntity } from './meshEntity';

import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Vector3 } from '@babylonjs/core/Maths/math';

export class ModelEntity extends MeshEntity {

    model: Array<Mesh>;
    loadModel(modelFile: string, callback?: Function) {
        this.system.loadModel(modelFile, (model) => {
            let mainMesh = model[0];
            this.addParentModel(model);
            let children = mainMesh.getChildMeshes();
            this.addMeshes(children);
            this.model = children;
            this.system.checkActiveMeshes();
            if (callback) callback(mainMesh, children);
        });
    }

    addMeshes(meshes: Array<Mesh>) {
        for (let i = 0; i < meshes.length; i++) {
            const mesh: Mesh = meshes[i];
            mesh.isVisible = true;
            // mesh.receiveShadow = true;
            mesh.alwaysSelectAsActiveMesh = true;
            mesh.doNotSyncBoundingInfo = true;
            if (this.system.shadowGenerator) this.system.shadowGenerator.addShadowCaster(mesh);
        }  
    }

    addMeshesToParent(meshes: Array<Mesh>) {
        for (let i = 0; i < meshes.length; i++) {
            const mesh: Mesh = meshes[i];
            mesh.parent = this.mesh;
            mesh.isVisible = true;
            mesh.scaling.z = -mesh.scaling.z;
            // mesh.receiveShadow = true;
            mesh.alwaysSelectAsActiveMesh = true;
            mesh.doNotSyncBoundingInfo = true;
            if (this.system.shadowGenerator) this.system.shadowGenerator.addShadowCaster(mesh);
        }
    }

    addParentModel(meshes: Array<Mesh>) {
        for (let i = 0; i < meshes.length; i++) {
            const mesh: Mesh = meshes[i];
            mesh.parent = this.mesh;
        }
    }

    scaleMesh(scale: number) {
        this.mesh.scaling.x = scale;
        this.mesh.scaling.y = scale;
        this.mesh.scaling.z = scale;
    }

    setNoShadow() {
        for (let i = 0; i < this.model.length; i++) {
            const mesh = this.model[i];
            if (this.system.shadowGenerator) this.system.shadowGenerator.removeShadowCaster(mesh);
        }
    }

    hideMeshes(meshes: Array<Mesh>) {
        this.setMeshesVisible(meshes, false);
    }

    showMeshes(meshes: Array<Mesh>) {
        this.setMeshesVisible(meshes, true);
    }

    setMeshesVisible(meshes: Array<Mesh>, visible: boolean) {
        for (let i = 0; i < meshes.length; i++) {
            meshes[i].isVisible = visible;
        }
    }

    setMeshesSize(meshes: Array<Mesh>, size: number) {
        for (let i = 0; i < meshes.length; i++) {
            meshes[i].scaling.x *= size;
            meshes[i].scaling.y *= size;
            meshes[i].scaling.z *= size;
        }
    }

    setMeshesRotation(meshes: Array<Mesh>, rotation: Vector3) {
        for (let i = 0; i < meshes.length; i++) {
            meshes[i].rotation.x = rotation.x;
            meshes[i].rotation.y = rotation.y;
            meshes[i].rotation.z = rotation.z;
        }
    }
}