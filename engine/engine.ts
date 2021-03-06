import { UiSystem } from './System/uiSystem';
import { Ground } from './Map/Ground';
import { SearchUI } from './Ui/search';
import { StoreMap } from './Map/storeMap';
import { ModalUI } from './Ui/modal';
import { Pipeline } from './System/pipeline';
import { House } from './Entity/house';
import { Car } from './Entity/car';

import { MouseCatcher } from '@naker/services/Catchers/mouseCatcher';
import { TouchCatcher } from '@naker/services/Catchers/touchCatcher';
import { setStyle } from 'redom';
import { TileMap } from './Map/tileMap';
import { LegendUI } from './Ui/legend';

// Au départ on ne comprend pas le but: ajouter une phrase d'accroche
// Si possible horaire d'ouverture et numéro de téléphone
// Responsive pas encore ouf, drag and drop pas bon et page résultat non plus
// Ajouter site de Pierre

export interface GameInterface {
    canvas?: HTMLCanvasElement,
}

export class GameEngine {

    system: UiSystem;
    touchCatcher: TouchCatcher;
    mouseCatcher: MouseCatcher;

    ground: Ground;
    tileMap: TileMap;
    searchInput: SearchUI;
    legendUI: LegendUI;
    modal: ModalUI;
    storeMap: StoreMap;
    pipeline: Pipeline;
    house: House;
    car: Car;

    constructor(gameOptions: GameInterface) {
        this.system = new UiSystem(gameOptions.canvas);
        this.system.setHorizontalFixed(false);
        this.touchCatcher = new TouchCatcher(window);
        this.mouseCatcher = new MouseCatcher(this.system, this.touchCatcher);
        this.mouseCatcher.start();
        this.pipeline = new Pipeline(this.system);

        this.house = new House(this.system);
        this.car = new Car(this.system);
        
        this.modal = new ModalUI();
        this.searchInput = new SearchUI(this.modal);
        this.searchInput.onResult = (latlng: Array<number>) => {
            this.storeMap.updateStores(latlng);
            this.legendUI.show();
        };

        this.tileMap = new TileMap();
        this.ground = new Ground(this.system, this.tileMap, this.mouseCatcher);
        this.storeMap = new StoreMap(this.system, this.tileMap, this.ground, this.car, this.modal);

        // Value for orthographic camera
        // this.pipeline.setFocalDistance(-1);
        
        this.legendUI = new LegendUI(this.system, this.storeMap);
        
        // setTimeout(() => {
        //     this.storeMap.updateStores([-1.414176, 48.680365]);
        //     this.modal.setStart([-1.414176, 48.680365]);
        //     setStyle(this.searchInput.form, { top: '-30px' });
        //     this.legendUI.show();
        // }, 5000);
        
        // this.system.camera.attachControl(gameOptions.canvas);
 
        this.system.updateShadows();
        this.system.setSky(() => {
            this.ground.loadDecor();
            this.car.show();
            this.house.show();
            // this.system.updateShadows();
            this.system.checkActiveMeshes();
            setTimeout(() => {
                this.system.launchRender();
                this.system.checkActiveMeshes();
                this.storeMap.loadBaseModel();
                this.storeMap.loadStoresModel();

                this.pipeline.setFocalLength(10000);
                this.pipeline.setFocalDistance(this.system.cameraDistance);
                this.pipeline.setVignette([0, 0, 0, 0.2]);
                this.pipeline.addCamera(this.system.camera);
            }, 1000)
            // this.system.soundManager.load();
        });

        let test = 0;
        this.system.scene.registerBeforeRender(() => {
            let fps = this.system.engine.getFps();
            if ( fps < 50 ) test ++;
            else test = 0;
            if ( test > 40 ) {
                this.pipeline.removeCamera(this.system.camera);
            } else {
                this.pipeline.addCamera(this.system.camera);
            }
            
        })
    }
}

new GameEngine({ canvas: document.getElementById('gameCanvas') });
