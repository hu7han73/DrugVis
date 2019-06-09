<?php 

$m = new MongoClient();
$db = $m->selectDB("neighbor");

$dbname = $_GET['dbname'];

$collection = new MongoCollection($db, $dbname);


$collection->ensureIndex(array("loc" => "2dsphere"));

echo json_encode($dbname, true);


?>