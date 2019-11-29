<?php
//set headers to allow for CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *") ;
//get the json data from the body of the fetch request
//trims, strips and escapes special characters to make sure the input is safe
function test_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
  }
$str_json = file_get_contents('php://input');

//decodes json object into php array
$arr = json_decode($str_json, true);
foreach ($arr as &$value) {
  $value = test_input($value);
}

//encodes php array into JSON object and echoes the response.
echo json_encode($arr);

?>