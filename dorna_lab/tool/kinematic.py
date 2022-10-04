from dorna_motion import Dorna_c_knmtc
import asyncio

class kinematic_class(object):
	"""docstring for kinematic_class"""
	def __init__(self):
		super(kinematic_class, self).__init__()
		self.knmtc = Dorna_c_knmtc()
		
	def fw(self, ws, server_loop, joint):
		rtn = {"to": "?", "result": "?", "broadcast": False, "error": 0}		
		rtn["result"] = await asyncio.get_running_loop().run_in_executor(None, self.knmtc.fw, joint)
		server_loop.add_callback(ws.emit_message, json.dumps(rtn))
		return rtn

	def inv(self, ws, server_loop, xyzabg, joint_current, all_sol=False):
		joint = knmtc.inv(xyzabg, joint_current=joint_current, all_sol=all_sol)
		rtn = {"to": "?", "result": "?", "broadcast": False, "error": 0}		
		rtn["result"] = await asyncio.get_running_loop().run_in_executor(None, self.knmtc.inv, xyzabg, joint_current, all_sol)
		server_loop.add_callback(ws.emit_message, json.dumps(rtn))
		return rtn

	def base(self, ws, server_loop):
		pass

	def tcp(self, ws, server_loop):
		pass
