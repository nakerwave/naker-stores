import { UiSystem } from './System/uiSystem';
import { Ground } from './Map/Ground';
import { SearchUI } from './Ui/search';
import { StoreMap } from './Map/storeMap';
import { ModalUI } from './Ui/modal';
import { Pipeline } from './System/pipeline';

import { MouseCatcher } from '@naker/services/Catchers/mouseCatcher';
import { TouchCatcher } from '@naker/services/Catchers/touchCatcher';
import { setStyle } from 'redom';

// Nord-Sud pas bon avec l'itinéraire
// Ajouter flèche sur les côtés 
// Améliorer route texture
// Temps de trajet pour aller au magasins
// Texture meilleure
// Rotation voiture, grossir et mettre dans bon sens
// Raccourcir phrase d'intro
// Voir problème pain
// Faire en sorte que la scène soit plus clair, plus vive
// Tester converttoflatshadedmesh

export interface GameInterface {
    canvas?: HTMLCanvasElement,
}

export class GameEngine {

    system: UiSystem;
    touchCatcher: TouchCatcher;
    mouseCatcher: MouseCatcher;

    ground: Ground;
    searchInput: SearchUI;
    modal: ModalUI;
    storeMap: StoreMap;
    pipeline: Pipeline;

    constructor(gameOptions: GameInterface) {
        this.system = new UiSystem(gameOptions.canvas);
        // this.system.optimize();
        this.system.improveQualityAtBreak(true);

        this.touchCatcher = new TouchCatcher(window);
        this.mouseCatcher = new MouseCatcher(this.system, this.touchCatcher);
        this.mouseCatcher.start();
        this.pipeline = new Pipeline(this.system);
        
        // setInterval(() => {
        //     this.pipeline.defaultPipeline.depthOfField.focusDistance += 1000;
        //     console.log(this.pipeline.defaultPipeline.depthOfField.focusDistance);
        // }, 100);

        this.pipeline.setFocalLength(10000);
        // Value for orthographic camera
        // this.pipeline.setFocalDistance(-1);
        this.pipeline.setFocalDistance(90);
        this.pipeline.addCamera(this.system.camera);
        this.pipeline.setVignette([0, 0, 0, 0.08]);
        
        this.modal = new ModalUI();
        this.searchInput = new SearchUI(this.modal);
        this.searchInput.onResult = (latlng: Array<number>) => {
            this.storeMap.updateStores(latlng);
        };
        
        this.ground = new Ground(this.system, this.mouseCatcher);
        this.storeMap = new StoreMap(this.system, this.ground, this.modal);

        // setTimeout(() => {
        //     this.storeMap.updateStores([-1.414176, 48.680365]);
        //     this.modal.setStart([-1.414176, 48.680365]);
        //     setStyle(this.searchInput.form, { top: '-30px' });
        // }, 5000);
        
        // this.system.scene.freezeActiveMeshes();
        // this.system.camera.attachControl(gameOptions.canvas);
 
        this.system.launchRender();
        this.system.setSky(() => {
            // this.system.soundManager.load();
        });
    }
}

new GameEngine({ canvas: document.getElementById('gameCanvas') });
