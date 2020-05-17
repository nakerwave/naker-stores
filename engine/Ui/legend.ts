import '../../style/legend.sass';
import { storeCategories } from '../Entity/store';
import { UiSystem } from '../System/uiSystem';
import { StoreMap } from 'engine/Map/storeMap';

import { el, unmount, mount, setStyle } from 'redom';

export class LegendUI {

    container: HTMLElement;
    legendList: HTMLElement;
    storeMap: StoreMap
    constructor(system: UiSystem, storeMap: StoreMap) {
        // let imageUrl = system.assetUrl + 'images/';
        this.storeMap = storeMap;
        
        let imageUrl = 'https://test.naker.io/stores/asset/images/';
        this.container = el('div.legend', { onmouseleave: () => { this.mouseout() } },
            this.legendList = el('div.legend-center', storeCategories.map(p =>
                el('div.legend-icon.legend-' + p.type, { onmouseover: (evt) => { this.hover(p.type, evt) }, onmouseleave: () => { this.legendMouseout() } }, [
                    el('div.image', { style: { 'background-image': 'url(' + imageUrl + p.legendImage + ')' } }),
                    el('div.text', { innerHTML: p.ingredientList.split('_').join('<br>') })
                ])
            )
        ));
    }

    hover(cat: string, evt: Event) {
        let storeType = this.storeMap.getStoreType(cat);
        this.storeMap.animateTypeModel(storeType.type);
        this.focus(cat)
    }

    mouseout() {
        this.storeMap.stopAllModelAnimation();
        this.setAllOpacity(1);
    }

    legendMouseout() {
        this.storeMap.stopAllModelAnimation();
    }

    focus(cat: string) {
        this.setAllOpacity(0.2);
        let target = document.querySelector('.legend-' + cat);
        setStyle(target, { opacity: 1 });
    }
    
    setAllOpacity(opacity: number) {
        let allLegends = this.legendList.children;
        for (let i = 0; i < allLegends.length; i++) {
            setStyle(allLegends[i], { opacity: opacity });
        }
    }

    show() {
        mount(document.body, this.container)
    }

    hide() {
        unmount(document.body, this.container)
    }

}
