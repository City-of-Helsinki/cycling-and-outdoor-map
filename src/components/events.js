/* Kartan vaihtofunktio */
const layerSwitch = (lyr) => {
  var style = lyr;
  var i, ii;
  for (i = 0, ii = 2; i < ii; ++i) {
    layers[i].set('visible', (layers[i].get('style') === style));
  }
};

/* Oletuskarttatason asettaminen */
layerSwitch('pk');

window.layerSwitch = layerSwitch;

export default {
  layerSwitch
};
