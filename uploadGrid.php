<?php

	$grid = $_POST['grid'];
	$diff = $_POST['diff'];
	$num = $_POST['num'];
	//$data = json_decode($dat,true);
	$f = fopen('./' . $diff . '/' . $num . '.json', 'w');
	fwrite($f, $grid);
	fclose($f);
	//print($data["grid"]);
?>