<?php

    $mongoDB = new MongoClient();

    $database = $mongoDB->selectDB('drug_viz_data');


    $collections = $database->getCollectionNames();

    echo json_encode($collections, true);

?>