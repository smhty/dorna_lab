from dorna_motion import Dorna_c_knmtc
import asyncio

class kinematic_class(object):
	"""docstring for kinematic_class"""
	def __init__(self):
		super(kinematic_class, self).__init__()
		self.knmtc = Dorna_c_knmtc()
		
	async def fw(self, ws, server_loop, joint):
		rtn = {"to": "?", "result": "?", "broadcast": False, "error": 0}		
		rtn["result"] = await asyncio.get_running_loop().run_in_executor(None, self.knmtc.fw, joint)
		server_loop.add_callback(ws.emit_message, json.dumps(rtn))
		return rtn

	async def inv(self, ws, server_loop, xyzabg, joint_current, all_sol=False):
		rtn = {"to": "?", "result": "?", "broadcast": False, "error": 0}		
		rtn["result"] = await asyncio.get_running_loop().run_in_executor(None, self.knmtc.inv, xyzabg, joint_current, all_sol)
		server_loop.add_callback(ws.emit_message, json.dumps(rtn))
		return rtn

	async def base(self, ws, server_loop):
		pass

	async def tcp(self, ws, server_loop):
		pass
