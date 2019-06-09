<?php 

$m = new MongoClient();
$db = $m->selectDB("neighbor");

$myArray = json_decode($_POST['kvcArray']);

$tableName = $myArray -> {'TableName'};

$data = $myArray -> {'Data'};

$collection = new MongoCollection($db, $tableName);

// looping through $json
foreach ($data as $document){
  // another looping to get 'statuses'
  $collection->insert($document);
}

// echo json_encode($tableName, true);

?>