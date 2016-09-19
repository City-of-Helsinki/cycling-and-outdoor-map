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
const layerSwitch = (layer) =>{
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

/**
 * Code for measuring distance
 */
/**
 * Currently drawn feature.
 * @type {ol.Feature}
 */
var sketch;
/**
 * The help tooltip element.
 * @type {Element}
 */
var helpTooltipElement;
/**
 * Overlay to show the help messages.
 * @type {ol.Overlay}
 */
var helpTooltip;
/**
 * The measure tooltip element.
 * @type {Element}
 */
var measureTooltipElement;
/**
 * Overlay to show the measurement.
 * @type {ol.Overlay}
 */
var measureTooltip;
/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
var continueLineMsg = 'Anna seuraava mittauspiste, tuplaklikki lopettaa mittauksen';
/**
 * Handle pointer move.
 * @param {ol.MapBrowserEvent} evt The event.
 */

var source = new ol.source.Vector();

var pointerMoveHandler = function(evt) {
  if (evt.dragging || !measuringEnabled) {
    return;
  }
  /** @type {string} */
  var helpMsg = 'Klikkaa uusi matkanmittaus käyntiin';
  //var helpMsg = '';

  if (sketch) {
    helpMsg = continueLineMsg;
  }

  helpTooltipElement.innerHTML = helpMsg;
  helpTooltip.setPosition(evt.coordinate);

  helpTooltipElement.classList.remove('hidden');
};

Map.on('pointermove', pointerMoveHandler);
Map.getViewport().addEventListener('mouseout', function() {
  helpTooltipElement.classList.add('hidden');
});

var draw; // global so we can remove it later
/**
 * Format length output.
 * @param {ol.geom.LineString} line The line.
 * @return {string} The formatted length.
 */
var formatLength = function(line) {
  var length;
  length = Math.round(line.getLength() * 100) / 100;
  var output;
  /*if (length > 100) {
   output = (Math.round(length / 1000 * 100) / 100) +
   ' ' + 'km';
   } else {

   output = (Math.round(length * 100) / 100) +
   */
  output = (Math.round(length));
  var steps;
  steps = Math.round(output * (1 / 0.7));
  /* } */
  /*return output + ' m<br>' + steps + ' askelta';*/
  return steps + ' askelta*<br>' + output + ' m';
};

//function addInteraction() {

var type = ('LineString');
draw = new ol.interaction.Draw({
  source: source,
  type: /** @type {ol.geom.GeometryType} */ (type),
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
      color: 'rgba(255, 186, 0, 1)',
      lineDash: [2, 15],
      width: 10
    }),
    image: new ol.style.Circle({
      radius: 5,
      stroke: new ol.style.Stroke({
        color: 'rgba(255, 186, 0, 1)'
      }),
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      })
    })
  })
});
//Map.addInteraction(draw);

createMeasureTooltip();
createHelpTooltip();

var listener;

draw.on('drawstart',
  function(evt) {
    // set sketch
    sketch = evt.feature;
    /** @type {ol.Coordinate|undefined} */
    var tooltipCoord = evt.coordinate;
    listener = sketch.getGeometry().on('change', function(e) {
      var geom = e.target;
      var output;
      output = formatLength(geom);
      tooltipCoord = geom.getLastCoordinate();
      measureTooltipElement.innerHTML = output;
      measureTooltip.setPosition(tooltipCoord);
    });
  }, this);

draw.on('drawend',
  function() {
    /* Matkanmittauksen infoboxin asemointi! */
    measureTooltipElement.className = 'tooltip tooltip-static';
    measureTooltip.setOffset([0, -30]);
    // unset sketch
    sketch = null;
    // unset tooltip so that a new one can be created
    measureTooltipElement = null;
    createMeasureTooltip();
    ol.Observable.unByKey(listener);
  }, this);

//}
/**
 * Creates a new help tooltip
 */
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'tooltip hidden';
  helpTooltip = new ol.Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left'
  });
  Map.addOverlay(helpTooltip);
}
/**
 * Creates a new measure tooltip
 */
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'tooltip tooltip-measure';
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  });
  Map.addOverlay(measureTooltip);
}
//addInteraction();

var measuringEnabled = false;

var toggleMeasuring = () => {
  if (!measuringEnabled) {
    measuringEnabled = true;
    Map.addInteraction(draw);
    //console.log(measuringEnabled);
    //console.log(draw);
  } else {
    measuringEnabled = false;
    Map.removeInteraction(draw);
    //console.log(measuringEnabled);
  }

};

window.toggleMeasuring = toggleMeasuring;

export default Map;
