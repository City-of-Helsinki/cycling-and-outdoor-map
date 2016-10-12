import ol from 'openlayers';
import walkImg from 'assets/img/walk32.png';
import projection from './projection';
import { Map } from './map';

let lastIcon;
let geolocation;

export const setGeoLocation = () => {

  geolocation = new ol.Geolocation({
    tracking: true,
    projection: projection
  });

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

  positionFeature.setStyle(iconStyle);

  /**
   * Track changes on geolocation
   */
  geolocation.on('change', () => {
    let locationCoordinates = geolocation.getPosition();
    Map.getView().setCenter(locationCoordinates);
    Map.getView().setZoom(5);
    positionFeature.setGeometry(locationCoordinates ? new ol.geom.Point(locationCoordinates) : null);
    removeLastIcon();
    var vectorLayer = new ol.layer.Vector({
      map: Map,
      source: new ol.source.Vector({
        features: [accuracyFeature, positionFeature]
      })
    });
    lastIcon = vectorLayer;
    Map.addLayer(vectorLayer);
  });

  setTimeout(function(){ Map.updateSize(); }, 100);
};

const removeLastIcon = () => {
  Map.removeLayer(lastIcon);
};
