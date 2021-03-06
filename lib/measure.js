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
  var pointerMoveHandler = function(evt) {
	if (evt.dragging) {
	  return;
	}
	/** @type {string} */
	var helpMsg = 'Klikkaa uusi matkanmittaus käyntiin';
	var helpMsg = '';

	if (sketch) {
		helpMsg = continueLineMsg;
	}

	helpTooltipElement.innerHTML = helpMsg;
	helpTooltip.setPosition(evt.coordinate);

	helpTooltipElement.classList.remove('hidden');
  };
  map.on('pointermove', pointerMoveHandler);
  map.getViewport().addEventListener('mouseout', function() {
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
	 steps = Math.round(output * (1/0.7));
	/* } */
	/*return output + ' m<br>' + steps + ' askelta';*/
	return  steps + ' askelta*<br>' + output + ' m';
  };

  function addInteraction() {
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
	//map.addInteraction(draw);

	createMeasureTooltip();
	createHelpTooltip();

	var listener;
	draw.on('drawstart',
		function(evt) {
		  // set sketch
		  sketch = evt.feature;
		  /** @type {ol.Coordinate|undefined} */
		  var tooltipCoord = evt.coordinate;
		  listener = sketch.getGeometry().on('change', function(evt) {
			var geom = evt.target;
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
  }
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
	map.addOverlay(helpTooltip);
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
	map.addOverlay(measureTooltip);
  }
addInteraction();