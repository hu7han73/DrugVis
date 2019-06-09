<?php

    $mongoDB = new MongoClient();

    $database = $mongoDB->selectDB('neighbor');

    $collName = $_GET['coll'];

    $collection = new MongoCollection($database,$collName);

    $coordinate = $_GET['coor'];

    $pieces = explode(",", $coordinate);
    $coordinates = array();

    $arrlength = count($pieces);
    for($x = $arrlength - 1; $x >= 0; $x-=2) {
        array_push($coordinates,array(floatval($pieces[$x]),floatval($pieces[$x-1])));
    }


     $query =    array('loc'=>
                        array('$geoWithin' =>
                            array('$geometry'=>
                                array(  'type'=>'Polygon',
                                        'coordinates'=>array($coordinates)
                                )
                            )
                        )
                    );

    $query_result = $collection->find($query);
    // $query_result->limit(25000);
    $result = Array();
    foreach ($query_result as $doc) {
        array_push($result, $doc);
    }
    echo json_encode($result, true);
?>
