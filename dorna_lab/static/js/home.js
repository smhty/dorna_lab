$(".home_joint_b").on("click", function(e) {
	e.preventDefault();
	
	let index = $(this).attr("data-key")
	let value = Number($(`.set_joint_v[index=${index}]`).prop("value"))
	let dir = $(this).attr("data-dir")			
	
	let msg = {
	  "_server": "shell",
	  "prm":  ["cd /home/dorna/Downloads/example/home/ && sudo python3 main.py --Host localhost --Index "+index+ " --Value "+value+ " --Dir "+dir ],

	}
	send_message(msg)
});