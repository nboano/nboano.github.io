<?php
	$o = json_decode(file_get_contents("https://genius.com/api/search/multi?q=" . str_replace(" ", "+", $_GET["q"])), true);
	echo file_get_contents($o["response"]["sections"][1]["hits"][0]["result"]["url"]);
?>