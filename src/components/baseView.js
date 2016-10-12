import ol from 'openlayers';
import projection from './projection';

/**
 * Baseview for Map
 * @type {ol.View}
 */
const baseView = new ol.View({
  projection,
  center: [25496750, 6673050],
  extent: [25469000, 6669000, 25515000, 6697000],
  zoom: 5,
  maxZoom: 7,
  minZoom: 3
});

export default baseView;
