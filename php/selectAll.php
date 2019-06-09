<?php

    $mongoDB = new MongoClient();

    $database = $mongoDB->selectDB('drug_viz_data');

    $collName = $_GET['coll'];

    $collection = new MongoCollection($database,$collName);

    $query_result = $collection->find();

    $result = Array();
    foreach ($query_result as $doc) {
        array_push($result, $doc);
    }
    
    echo json_encode($result, true);
    //echo json_encode(iterator_to_array($query_result));
?>
