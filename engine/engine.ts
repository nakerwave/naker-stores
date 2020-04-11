import { UiSystem } from './System/uiSystem';
import { Ground } from './Map/Ground';
import { SearchUI } from './Ui/search';

import { MouseCatcher } from '@naker/services/Catchers/mouseCatcher';
import { ResponsiveCatcher } from '@naker/services/Catchers/responsiveCatcher';
import { TouchCatcher } from '@naker/services/Catchers/touchCatcher';
import { StoreMap } from './Map/storeMap';
import { ModalUI } from './Ui/modal';
import { setStyle } from 'redom';

// Improve dive function to reproduce planet attraction effect
// Trou noir attaque uniquement les leaders
// Faire étoile filante plutôt que point blanc
// Tableau de récap à la fin
// Create particle in show/hide to avoid creating 100 particleSystem
// Add menu with Sound, twitter and discoord
// Explosion create a wave on the grid Or simple rotate/shake a bit the grid
// Use Saved Star and avoid checkactivemeshes


export interface GameInterface {
    canvas?: HTMLCanvasElement,
}

export class GameEngine {

    system: UiSystem;
    touchCatcher: TouchCatcher;
    mouseCatcher: MouseCatcher;
    responsiveCatcher: ResponsiveCatcher;

    ground: Ground;
    searchInput: SearchUI;
    modal: ModalUI;
    storeMap: StoreMap;

    constructor(gameOptions: GameInterface) {
        this.system = new UiSystem(gameOptions.canvas);
        this.system.optimize();

        this.touchCatcher = new TouchCatcher(window);
        this.mouseCatcher = new MouseCatcher(this.system, this.touchCatcher);
        this.mouseCatcher.start();
        this.responsiveCatcher = new ResponsiveCatcher(this.system, true);
        
        this.modal = new ModalUI();
        this.searchInput = new SearchUI(this.modal);
        this.searchInput.onResult = (latlng: Array<number>) => {
            this.storeMap.updateStores(latlng);
        };
        
        this.ground = new Ground(this.system, this.mouseCatcher, this.responsiveCatcher);
        this.storeMap = new StoreMap(this.system, this.ground, this.modal);

        setTimeout(() => {
            this.storeMap.updateStores([-1.414176, 48.680365]);
            this.modal.setStart([-1.414176, 48.680365]);
            setStyle(this.searchInput.form, { top: '-30px' });
        }, 5000);
        
        this.system.scene.freezeActiveMeshes();
        // this.system.camera.attachControl(gameOptions.canvas);
 
        this.system.launchRender();
        this.ground.addTrees();
        this.system.setSky(() => {

            // this.system.soundManager.load();
        });
    }
}

new GameEngine({canvas: document.getElementById('gameCanvas')});
