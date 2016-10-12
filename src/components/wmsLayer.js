import ol from 'openlayers';

//const attribution = '&copy; Helsingin&nbsp;kaupunki.<br><a href="help/legenda.html" target="_blank">Merkkien selitys-Legend</a><br><a href="help/tuki.html" target="_blank">Ohjeita ja tietoa</a>';

/* Työalueen extentit */
const extent = [25469000, 6667000, 25515000, 6697000];

const wmsLayer = (layername, name, style, type) => {
  return new ol.layer.Tile({
    title: name,
    style: style,
    type: type,
    extent: extent,
    serverType: 'geoserver',
    source: new ol.source.TileWMS({
      url: 'http://137.163.136.4:8080/geoserver/wms',
      attributions: false,
      params: {
        'LAYERS': layername,
        'FORMAT': 'image/png',
        'VERSION': '1.1.1',
        'BGCOLOR': '0xFFFFFF',
        'TRANSPARENT': 'TRUE'
      }
    })
  });
};

export default wmsLayer;
