$(".home_joint_b").on("click", function(e) {
	e.preventDefault();
	
	let msg = {
	  "_server": "shell",
	  "prm":  ["sudo python3 /home/dorna/Downloads/dorna_python/example/home/main.py --Host localhost --Index "+$(this).attr("data-key")],

	}
	send_message(msg)
});