<?php

    $mongoDB = new MongoClient();

    $database = $mongoDB->selectDB('drug_viz_data');

    $dbname = $_GET['dbname'];


    $collections = $database->createCollection($dbname);


    echo json_encode($collections, true);

?>