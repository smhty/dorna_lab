$('.update_b').click(function(e){
	//$(this).prop("disabled",true);

    send_message({
      "_server":"update",
      "prm": [$(this).attr("data-value")] 
    })
})

$('.update_b_check').click(function(e){
	//$(this).prop("disabled",true);
    send_message({
      "_server":"update_check"
    })
})

function update_print(data) {
	$(".update_msg").text(data)
	$(".update_msg").addClass("d-block")
	$(".update_msg").removeClass("d-none")
}

function update_check(data) {
	// no internet
	if (Object.keys({"ali":1}).lengt == 0){
			$(".outdate").hide()
			$(".update").hide()
			$(".internet").show()
	
	}else{
		let outdate = false
		for (let key of Object.keys(data)) {
			// latest version
			let latest = data[key]
			$(`.version_v[data-latest=${key}]`).text(latest)

			// current version
			let current = $(`.version_v[data-current=${key}]`).text()
			
			if (latest !== current){
				outdate = true
				break
			}
		}
		// show update message
		if(outdate){
			$(".outdate").show()
			$(".update").hide()
			$(".internet").hide()
		}else{
			$(".outdate").hide()
			$(".update").show()
			$(".internet").hide()
		}		
	}
}