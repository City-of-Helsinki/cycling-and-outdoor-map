/*eslint-disable no-unused-vars, no-new*/
import ol from 'openlayers';
import Geocoder from './lib/geocoder';

import wmsLayer from './components/wmsLayer';
import distanceCalculator from './components/distanceCalculator';
import projection from './components/projection';
import view from './components/baseView';

import './main.scss';
import walkImg from 'assets/img/walk32.png';

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
const Map = new ol.Map({
  target: 'map',
  view,
  layers
});

/**
 * Popup
 * @type {ol.Overlay}
 */
Map.addOverlay(new ol.Overlay({
  element: document.getElementById('popup')
}));

/**
 * Geolocation
 */
const setGeoLocation = () => {
  const iconStyle = new ol.style.Style({
    image: new ol.style.Icon(({
      anchor: [0.5, 15],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 1,
      src: walkImg
    }))
  });

  const accuracyFeature = new ol.Feature();
  const positionFeature = new ol.Feature();
  const geolocation = new ol.Geolocation({
    tracking: true,
    projection
  });

  positionFeature.setStyle(iconStyle);

  geolocation.on('change:accuracyGeometry', function() {
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
  });

  if (window.navigator.geolocation) {
    geolocation.on('change:position', function() {
      let locationCoordinates = geolocation.getPosition();
      Map.getView().setCenter(locationCoordinates);
      Map.getView().setZoom(14);
      positionFeature.setGeometry(locationCoordinates ? new ol.geom.Point(locationCoordinates) : null);
    });
    new ol.layer.Vector({
      map: Map,
      source: new ol.source.Vector({
        features: [accuracyFeature, positionFeature]
      })
    });
  }
};

// Expose to window
window.setGeoLocation = setGeoLocation;

/**
 * Switch layer
 * @param lyr
 */
const layerSwitch = (layer) => {
  for (var i = 0, ii = 2; i < ii; ++i) {
    layers[i].set('visible', (layers[i].get('style') === layer));
  }
};

// Set default layer
layerSwitch('pk');

// Expose to window
window.layerSwitch = layerSwitch;

/**
 * Export png
 * @type {Element}
 */
var exportPNGElement = document.getElementById('export-png');

if ('download' in exportPNGElement) {
  exportPNGElement.addEventListener('click', function() {
    Map.once('postcompose', function(event) {
      let canvas = event.context.canvas;
      exportPNGElement.href = canvas.toDataURL('image/png');
    });
    Map.renderSync();
  }, false);
} else {
  let info = document.getElementById('no-download');
  info.style.display = '';
}

/**
 * Export GPX
 * @type {Element}
 */
var exportGPXElement = document.getElementById('export-gpx');

if ('download' in exportGPXElement) {
  let vectorSource = (distanceCalculator.getSource());
  exportGPXElement.addEventListener('click', function() {
    if (!exportGPXElement.href) {
      let features = [];
      vectorSource.forEachFeature(function(feature) {
        let clone = feature.clone();
        clone.getGeometry().transform(projection, 'EPSG:4326');
        features.push(clone);
      });
      let node = new ol.format.GPX().writeFeatures(features);
      let fixgpx = node.replace(/\s/g, '');
      fixgpx = fixgpx.replace(/gpxxmlns/g, 'gpx xmlns');
      fixgpx = fixgpx.replace(/rteptlat/g, 'rtept lat');
      fixgpx = fixgpx.replace(/lon=/g, ' lon=');
      let base64 = window.btoa(unescape(encodeURIComponent(fixgpx)));
      exportGPXElement.href = 'data:gpx+xml;base64,' + base64;
    }
  }, false);
} else {
  let info = document.getElementById('no-download');
  info.style.display = 'Valitettavasti gpx-tuonti ei toimi selaimessasi';
}

/**
 * GeoCoder
 */
const geocoder = new Geocoder('nominatim', {
  provider: 'kmo',
  placeholder: 'Etsi katunimellä ...',
  keepOpen: true
});

Map.addControl(geocoder);

/**
 * Listen when an address is chosen
 */
geocoder.on('addresschosen', function(evt) {
  var coord = evt.coordinate;
  var content;
  content.innerHTML = '<p>' + evt.address.formatted + '</p>';
  overlay.setPosition(coord);
});

/**
 * Popup
 */
var container = document.getElementById('search'),
  content = document.getElementById('popup-content'),
  closer = document.getElementById('popup-closer'),
  overlay = new ol.Overlay({
    element: container,
    offset: [0, -40]
  });

closer.onclick = function() {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

Map.addOverlay(overlay);

export default Map;
