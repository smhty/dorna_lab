$('.shutdown_b').click(function(e){

    send_message({
      "_server":"shell",
      "prm": ["sudo shutdown -h now"] 
    })
})

$('.reboot_b').click(function(e){

    send_message({
      "_server":"shell",
      "prm": ["sudo reboot"] 
    })
})