<?php

    $mongoDB = new MongoClient();

    $database = $mongoDB->selectDB('drug_viz_data');

    $dbname = $_GET['dbname'];


    $collections = $database->dropCollection($dbname);


    echo json_encode($collections, true);

?>