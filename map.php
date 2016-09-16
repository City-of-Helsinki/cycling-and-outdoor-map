<?php
/* 
******* HUOM!!! TÄMÄ VERSIO ON SEUDULLINEN PK-S ETRS-GK25 -koordinaatistoa käyttävä!! *****************
WMS-> WMS proxy OpenLayers-sovellukselle
21.11.2013
*/
$PubServer = "http://137.163.136.4:8080/geoserver/wms";
$BBOX = $_GET["BBOX"];
$LAYERS = $_GET["LAYERS"];
$SRS = "EPSG:3879";
$WIDTH = $_GET["WIDTH"];
$HEIGHT = $_GET["HEIGHT"];
// karttatiilen koko pikseleinä! HUOM Tämän pitää olla asetettu samaksi kuin OL:n tiilikoko!!
//$WIDTH = "256";
//$HEIGHT = "256";
$splitbbox = explode(",",$BBOX);
$ly = $splitbbox[0];
$lx = $splitbbox[1];
$uy = $splitbbox[2];
$ux = $splitbbox[3];

if ( $LAYERS=="Ulkoilukartta_2m" || $LAYERS==Pyorailykartta_2m){
	$MapFile = $LAYERS;
}else{
	$MapFile ="hel:Karttasarja";
}
$puburl = "$PubServer/?Service=WMS&LAYERS=$MapFile&FORMAT=image/png&TRANSPARENT=FALSE&HEIGHT=$HEIGHT&BGCOLOR=0x000000&REQUEST=GetMap&WIDTH=$WIDTH&BBOX=$BBOX&SRS=$SRS&STYLES=&VERSION=1.1.1";
$image = file_get_contents($puburl);
header('content-type: image/png');
print $image;
?>
