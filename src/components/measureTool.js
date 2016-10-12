import ol from 'openlayers';
import { Map } from './map';

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
//var helpTooltipElement;
/**
 * Overlay to show the help messages.
 * @type {ol.Overlay}
 */
//var helpTooltip;
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
var continueLineMsg = 'Anna seuraava mittauspiste, tuplaklikkaus lopettaa mittauksen';
/**
 * Handle pointer move.
 * @param {ol.MapBrowserEvent} evt The event.
 */

var source = new ol.source.Vector();

var vector = new ol.layer.Vector({
  source: source,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
      color: '#ffcc33',
      width: 4
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: '#ffcc33'
      })
    })
  })
});

Map.addLayer(vector);

var showPrompt = function(contents) {
  if (contents !== '') {
    $('#notification-area .notification-content').show('fast');
  } else {
    $('#notification-area .notification-content').hide('fast');
  }
  $('.notification-text').html(contents);
};

var pointerMoveHandler = function(evt) {

  if (!measuringEnabled) {
    var helpMsg = '';
    //helpTooltipElement.innerHTML = helpMsg;
    //showPrompt(helpMsg);
    return;
  }
  if (evt.dragging) {
    return;
  }
  /** @type {string} */
  helpMsg = 'Aloita mittaus klikkaamalla reitille aloituspiste';

  if (sketch) {
    helpMsg = continueLineMsg;
  }

  //helpTooltipElement.innerHTML = helpMsg;
  showPrompt(helpMsg);
  //helpTooltip.setPosition(evt.coordinate);

  //helpTooltipElement.classList.remove('hidden');
};

/*
Map.getViewport().addEventListener('mouseout', function() {
  helpTooltipElement.classList.add('hidden');
});
*/
Map.on('pointermove', pointerMoveHandler);

var draw; // global so we can remove it later
/**
 * Format length output.
 * @param {ol.geom.LineString} line The line.
 * @return {string} The formatted length.
 */
var formatLength = function(line) {
  var length;

  if (line) {
    length = Math.round(line.getLength() * 100) / 100;
  } else {
    length = 0;
  }

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
  return '<div class="measure-set measure--meters"><span class="measure-value">' + output + '</span><span class="measure-unit"> m</span></div><div class="measure-set measure--steps">' + '<span class="measure-value">' + steps + '</span><span class="measure-unit"> askelta</span></div>';
};

/**
 * Creates a new help tooltip
 
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
*/

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
    offset: [0, -45],
    positioning: 'center-center'
  });
  Map.addOverlay(measureTooltip);
}

function updateMeasureDisplay(newContent) {
  if (newContent === '') {
    $('#measureDisplay').html(formatLength());
  } else {
    $('#measureDisplay').html(newContent);
  }
}

function initInteraction(){

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
        lineDash: [1, 20],
        width: 7
      }),
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: 'rgba(255, 186, 0, 1)'
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 186, 0, 1)'
        })
      })
    })
  });

  //createHelpTooltip();

  var listener;
  var clickListener;
  var measurementsOutput;
  var northernMost = [0, -100000000];

  draw.on('drawstart',
    function(evt) {
      // set sketch
      sketch = evt.feature;

      /** @type {ol.Coordinate|undefined} */
      //var tooltipCoord = evt.coordinate;
      listener = sketch.getGeometry().on('change', function(e) {
        var geom = e.target;
        measurementsOutput = formatLength(geom);
        //tooltipCoord = geom.getLastCoordinate();
        //measureTooltipElement.innerHTML = output;
        //measureTooltip.setPosition(tooltipCoord);
        updateMeasureDisplay(measurementsOutput);
      });
      clickListener = Map.on('click', function(e) {

        if (e.coordinate[1] > northernMost[1]) {
          northernMost = e.coordinate;
        }
        console.log(northernMost);
      });
    }, this);

  draw.on('drawend',
    function() {
      createMeasureTooltip();
      measureTooltipElement.innerHTML = measurementsOutput;
      /* Matkanmittauksen infoboxin asemointi! */
      measureTooltip.setPosition(northernMost);
      measureTooltipElement.className = 'tooltip tooltip-static';
      measureTooltip.setOffset([0, -66]);
      // unset sketch
      sketch = null;
      // unset tooltip so that a new one can be created
      measureTooltipElement = null;
      northernMost = [0, -100000000];
      createMeasureTooltip();
      ol.Observable.unByKey(listener);
      ol.Observable.unByKey(clickListener);
      $('#clearButton').show();
      updateMeasureDisplay('');
    }, this);
}

initInteraction();

var measuringEnabled = false;

export const toggleMeasuring = function() {
  if (!measuringEnabled) {
    measuringEnabled = true;
    Map.addInteraction(draw);
    $('#map').addClass('is-measuring');
    updateMeasureDisplay('');
    $('#measureDisplay').show();
    $('#measureButton').addClass('active');
    //document.getElementById('measureButton').style.background = 'yellow';
    //document.getElementById('measureButton').innerHTML = 'Lopeta mittaus';

  } else {
    measuringEnabled = false;
    if (sketch) {
      draw.finishDrawing();
    }
    Map.removeInteraction(draw);
    $('#map').removeClass('is-measuring');
    $('#measureDisplay').hide();
    $('#measureButton').removeClass('active');
    //document.getElementById('measureButton').style.background = 'lightblue';
    //document.getElementById('measureButton').innerHTML = 'Mittaustyökalu';
  }
};

export const clearRoutes = function() {
  var elementsToRemove = document.getElementsByClassName('tooltip-static');

  while (elementsToRemove.length > 0) {
    elementsToRemove[0].remove();
    console.log('removed');
  }

  updateMeasureDisplay('');
  $('#clearButton').hide();
  source.clear();

};
