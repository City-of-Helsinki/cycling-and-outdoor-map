import ol from 'openlayers';
import wmsLayer from './wmsLayer';
import view from './baseView';
import distanceCalculator from './distanceCalculator';

/**
 * Layers
 * @type {*[]}
 */
const layers = [
  wmsLayer('Ulkoilukartta_2m', 'Ulkoilukartta', 'uk', 'base'),
  wmsLayer('Pyorailykartta_2m', 'Pyöräilykartta', 'pk', 'base'),
  distanceCalculator /* matkanmittausvektori! */
];

/**
 * Main map
 * @type {ol.Map}
 */
export const Map = new ol.Map({
  target: 'map',
  view,
  layers
});

/**
 * Switch layer
 * @param lyr
 */
export const layerSwitch = (layer) =>{
  for (var i = 0, ii = 2; i < ii; ++i) {
    layers[i].set('visible', (layers[i].get('style') === layer));
  }
};
