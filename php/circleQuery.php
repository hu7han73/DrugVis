<?php

    $mongoDB = new MongoClient();

    $database = $mongoDB->selectDB('neighbor');

    $collName = $_GET['coll'];

    $collection = new MongoCollection($database,$collName);

    $latitude = (float) $_GET['lat'];
    $longitude = (float) $_GET['lng'];
    $max = (int) $_GET['radi'];
    $min = (int) "0";

    $query =    array('loc'=>
                        array('$near' =>
                            array('$geometry'=>
                                array(  'type'=>'Point',
                                        'coordinates'=>array($longitude,$latitude)
                                ),
                                '$minDistance' => $min,
                                '$maxDistance' => $max
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
    //echo json_encode(iterator_to_array($query_result));
?>
