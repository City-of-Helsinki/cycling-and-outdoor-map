import ol from 'openlayers';
import proj4 from 'proj4';

ol.proj.setProj4(proj4);
proj4.defs('EPSG:3879', '+proj=tmerc +lat_0=0 +lon_0=25 +k=1 +x_0=25500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

const projection = new ol.proj.Projection({
  code: 'EPSG:3879',
  extent: [25469000, 6667000, 25515000, 6697000],
  units: 'm'
});

ol.proj.addProjection(projection);

export default projection;
