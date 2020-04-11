import { el, setStyle, mount } from 'redom';
import axios from 'axios';
// import mapboxgl from 'mapbox-gl';
declare let mapboxgl;

import '../../style/modal.sass';
export let mapboxKey = 'pk.eyJ1IjoiYXBleHNlYXJjaHVzZXIiLCJhIjoiY2pxc2V6bjVyMHVxcjQ4cXE4cmg1a242diJ9.TMZ9oWhH_fF4ccYkaMeyAw';

export class ModalUI {

    map: mapboxgl.Map;
    constructor() {
        this.addModal();
        
        mapboxgl.accessToken = mapboxKey;
        this.map = new mapboxgl.Map({
            container: 'mapbox',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-79.4512, 43.6568],
            zoom: 13
        });
    }

    mapEl: HTMLElement;
    modal: HTMLElement;
    addModal() {
        this.modal = el('div.modal-background', {onclick: () => {this.hide(); }},
            el('div.modal',
                [
                    el('h1', 'Voici comment y aller!'),
                    this.mapEl = el('div.map', { id: 'mapbox' }),
                ]
            )
        );
        mount(document.body, this.modal);

    }

    show(end: Array<number>) {
        setStyle(this.modal, { display:'block', opacity: 1 });
        this.map.resize();
        // this.map.setCenter(this.start);
        let route = this.getRoute(end);
    }

    hide() {
        setStyle(this.modal, { opacity: 0 });
        setTimeout(() => {
            setStyle(this.modal, { display: 'none' });
        }, 500)
    }

    start: Array<number>
    setStart(latlng: Array<number>) {
        this.start = latlng;
        console.log(latlng);
        
        this.map.setCenter(latlng);
    }

    // create a function to make a directions request
    getRoute(end: Array<number>) {
        // make a directions request using cycling profile
        // an arbitrary start will always be the same
        // only the end or destination will change

        var url = 'https://api.mapbox.com/directions/v5/mapbox/cycling/' + this.start[0] + ',' + this.start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;

        // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.onload = () => {
            var json = JSON.parse(req.response);
            var data = json.routes[0];
            var route = data.geometry.coordinates;
            
            var geojson = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: route
                }
            };
            // if the route already exists on the map, reset it using setData
            if (this.map.getSource('route')) {
                this.map.getSource('route').setData(geojson);
                this.fitMapToLine(geojson)
            } else { // otherwise, make a new request
                console.log('addLayer');
                this.fitMapToLine(geojson)
                
                this.map.addLayer({
                    id: 'route',
                    type: 'line',
                    source: {
                        type: 'geojson',
                        data: geojson
                    },
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#3887be',
                        'line-width': 5,
                        'line-opacity': 0.75
                    }
                });
            }
            // add turn instructions here at the end
        };
        req.send();
    }

    fitMapToLine(geojson) {
        // Geographic coordinates of the LineString
        var coordinates = geojson.geometry.coordinates;

        // Pass the first coordinates in the LineString to `lngLatBounds` &
        // wrap each coordinate pair in `extend` to include them in the bounds
        // result. A variation of this technique could be applied to zooming
        // to the bounds of multiple Points or Polygon geomteries - it just
        // requires wrapping all the coordinates with the extend method.
        var bounds = coordinates.reduce(function (bounds, coord) {
            return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        this.map.fitBounds(bounds, {
            padding: 20
        });
    }

}

