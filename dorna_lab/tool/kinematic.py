from dorna_motion import Dorna_c_knmtc
import asyncio
import json
import math

class kinematic_class(object):
	"""docstring for kinematic_class"""
	def __init__(self,model):
		super(kinematic_class, self).__init__()
		self.knmtc = Dorna_c_knmtc()
		if model=="Dorna 2s":
			self.knmtc.dof.n_dof = 5 # number of degrees of freedom, choose between [5,6]
			self.knmtc.dof.alpha = [0, 0, math.pi/2, 0, 0, 0, 0] # Rotation of Ci with respect to C(i-1) around the x axis of Ci
			self.knmtc.dof.delta = [0, 0, 0, 0, 0, math.pi/2, 0] 
			self.knmtc.dof.a = [0, 0 , 95.4333, 203.1997, 152.398, 0, 0]#[0, 0 , 100.0, 300.0, 208.5, 0, 0]
			self.knmtc.dof.d = [0, 218.529, 0, 0, 1, 13.275, 0]#[0, 309.7, 0, 0,  -133.1, 90.5, 9.707]
			print("Model set to be: ",model)
		if model=="Dorna 2":
			pass
		
	async def fw(self, ws, server_loop, cmd_id, joint):
		rtn = {"to": "?", "result": "?", "broadcast": False, "cmd_id": cmd_id, "error": 0}		
		rtn["result"] = await asyncio.get_running_loop().run_in_executor(None, self.knmtc.fw, joint)
		server_loop.add_callback(ws.emit_message, json.dumps(rtn))
		return rtn

	async def inv(self, ws, server_loop, cmd_id, xyzabg, joint_current = None, all_sol=False):
		rtn = {"to": "?", "result": "?", "broadcast": False,"cmd_id": cmd_id, "error": 0}		
		rtn["result"] = await asyncio.get_running_loop().run_in_executor(None, self.knmtc.inv, xyzabg, joint_current, all_sol)
		server_loop.add_callback(ws.emit_message, json.dumps(rtn))
		return rtn
		
	async def base(self, ws, server_loop):
		pass

	async def tcp(self, ws, server_loop):
		pass
