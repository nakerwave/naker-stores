import { el, unmount, mount } from 'redom';

import '../../style/legend.sass';
import { storeCategories } from '../Entity/store';
import { UiSystem } from '../System/uiSystem';

export class LegendUI {

    container: HTMLElement;
    constructor(system: UiSystem) {
        // let imageUrl = system.assetUrl + 'images/';
        let imageUrl = 'https://test.naker.io/stores/asset/images/';

        this.container = el('div.legend',
            el('div.legend-center', storeCategories.map(p =>
                el('div.legend-icon', [
                    el('div.image', { style: { 'background-image': 'url(' + imageUrl + p.legendImage + ')' } }),
                    el('div.text', { innerHTML: p.ingredientList.split('_').join('<br>') })
                ])
            )
        ));
        // this.show();
    }

    show() {
        mount(document.body, this.container)
    }

    hide() {
        unmount(document.body, this.container)
    }

}
