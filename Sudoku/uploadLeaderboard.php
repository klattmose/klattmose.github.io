<?php

	$lb = $_POST['lb'];
	$hi = $_POST['hi'];
	$diff = $_POST['diff'];
	$f = fopen('./' . $diff . '/leaderboard' . $hi . '.json', 'w');
	fwrite($f, $lb);
	fclose($f);
	
?>