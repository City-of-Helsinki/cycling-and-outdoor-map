import ol from 'openlayers';

const source = new ol.source.Vector();
const vector = new ol.layer.Vector({
  source: source,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
      color: 'rgba(145, 0, 230, 0.65)',
      lineDash: [0, 16],
      width: 14
    }),
    image: new ol.style.Circle({
      radius: 20,
      fill: new ol.style.Fill({
        color: '#66ff1a'
      })
    })
  })
});

export default vector;
