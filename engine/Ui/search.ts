import { el, setStyle, mount, setAttr } from 'redom';
import { mapboxKey, ModalUI } from './modal';
import axios from 'axios';
import Suggestions from 'suggestions';
import find from 'lodash/find';

import '../../style/search.sass';
import '../../style/input.sass';
import '../../style/select.sass';

export class SearchUI {
    
    onResult: Function;
    modal: ModalUI;

    constructor(modal: ModalUI) {
        this.modal = modal;
        // el('div.dashboard-button', {
        //     onclick: (evt) => {  },
        // }),

        this.addSearchBar();
        this.addSelect();
    }
    
    loaderEl: HTMLElement;
    searchInput: HTMLElement;
    form: HTMLElement;
    addSearchBar() {
        this.form = el('form.form', { autocomplete: "off", onsubmit: (evt) => { evt.preventDefault(); } },
            [
                el('h1', 'Trouvez des producteurs proches de chez vous!'),
                this.searchInput = el('input.project-name', {
                    type: 'text',
                    placeholder: "Mon adresse",
                    // autocomplete: "none",
                    autocomplete: "off",
                    onblur: (evt) => {  },
                    onkeyup: (evt) => { this.checkKeyUp(evt) }
                }),
                this.loaderEl = el('div.loader'),
            ]
        );
        mount(document.body, this.form);

    }
    
    selectlabels: Array<any> = [];
    suggestion: Suggestions;
    list: Suggestions["List"];
    addSelect() {
        this.suggestion = new Suggestions(this.searchInput, [], {
            minLength: 0
        });
        this.suggestion.handleInputChange = () => { }
        this.list = this.suggestion.list;
    
        this.list.handleMouseUp = (item) => {
            this.list.hide();
            let address = item.string;
            setAttr(this.searchInput, { value: address});
            let geo = find(this.results, (r) => { return r.place_name == address });
            let latlng = geo.center;
            this.onResult(latlng);
            this.modal.setStart(latlng);
            setStyle(this.form, {top: '-30px'});
        };
    }

    results: Array<any>;
    options: Array<string>;
    setSearchResult(addresses: Array<any>) {
        this.results = addresses;
        this.options = [];
        for (let i = 0; i < addresses.length; i++) {
            const element = addresses[i];
            this.options.push(element.place_name);
        }
        this.suggestion.update(this.options);
        this.list.clear();
        for (var i = 0; i < this.options.length; i++) {
            this.list.add({ string: this.options[i] });
        }
        this.list.draw();
        this.list.show();
    }

    typing = false;
    timeOutCheck;
    checkKeyUp(evt: Event) {
        let text = evt.target.value;
        if (evt.keyCode == 13) {
            this.searchAddress(text);
        } else {
            clearTimeout(this.timeOutCheck);
            this.timeOutCheck = setTimeout(() => {
                this.searchAddress(text);
            }, 500);
        }
        
    }

    searchAddress(text: string) {
        text = encodeURIComponent(text);
        let url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+text+'.json?access_token='+mapboxKey+'&cachebuster=1585773561743&autocomplete=true&types=address&bbox=-4.942444204026032%2C42.20149500003373%2C8.382824723309028%2C51.12632215957635&language=fr';
        axios({ method: 'get', url: url, responseType: 'json' })
            .then((response) => { 
                this.setSearchResult(response.data.features);
             })
            .catch((error) => {
                throw 'Naker : ' + error;
            });
    }

    searchAnimation() {
        setStyle(this.loaderEl, { opacity: 1 });
        setTimeout(() => {
            setStyle(this.loaderEl, { opacity: 0 });
        }, 1000)
    }
}
