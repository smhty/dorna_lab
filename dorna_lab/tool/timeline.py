from dorna_motion import timeline

async def timeline_data(ws, server_loop, point_data, time_start=0, ticks_per_sec=100000, sample_per_sec=5):
	rtn = {"to": "?", "result": "?", "broadcast": False, "error": 0}		
	rtn["result"] = await asyncio.get_running_loop().run_in_executor(None, timeline.points_to_plot, point_data, time_start, ticks_per_sec, sample_per_sec)
	server_loop.add_callback(ws.emit_message, json.dumps(rtn))
	return rtn

	
			