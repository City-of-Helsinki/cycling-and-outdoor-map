<?php

$serverRoot = "http://137.163.136.4:8080/geoserver/wms";
$layers    = $_GET["LAYERS"];

if ($layers == 'Ulkoilukartta_2m' || $layers == 'Pyorailykartta_2m') {
    $MapFile = $layers;
} else {
    $MapFile = 'hel:Karttasarja';
}

$queryStr = http_build_query(array(
    'Service'     => 'WMS',
    'LAYERS'      => $MapFile,
    'FORMAT'      => 'image/png',
    'TRANSPARENT' => 'FALSE',
    'HEIGHT'      => $_GET['HEIGHT'],
    'WIDTH'       => $_GET['WIDTH'],
    'BGCOLOR'     => '0x000000',
    'REQUEST'     => 'GetMap',
    'BBOX'        => $_GET['BBOX'],
    'SRS'         => 'EPSG:3879',
    'STYLES'      => null,
    'VERSION'     => '1.1.1',
));

$image = file_get_contents("{$serverRoot}/?{$queryStr}");

header('content-type: image/png');
echo $image;
