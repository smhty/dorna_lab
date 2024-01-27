from dorna2 import Kinematic
import asyncio
import json
import math
import numpy as np
import os
from scipy.optimize import minimize
 

class kinematic_class(object):
	"""docstring for kinematic_class"""
	def __init__(self,model):
		super(kinematic_class, self).__init__()
		self.knmtc = Kinematic(model)
		self.model = model
		#load frame list file 
		self.frame_list_path = os.path.join(os.path.dirname(os.path.abspath(os.path.join(os.path.dirname(__file__)))), 'userData', 'frame_list.json')
		self.tcp_list_path = os.path.join(os.path.dirname(os.path.abspath(os.path.join(os.path.dirname(__file__)))), 'userData', 'tcp_list.json')

		self.frame_list = {"Base": [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]}
		self.tcp_list = {"Flange": [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]}

		self.read_tcp_frame_from_file()



	
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
	
	def update_tcp_frame_list(self, ws, server_loop):
		self.read_tcp_frame_from_file()
		rtn = {}
		rtn["to"] = "tcp_frame_list"
		rtn["result"] = {"frame_list":self.frame_list , "tcp_list":self.tcp_list}
		server_loop.add_callback(ws.emit_message, json.dumps(rtn))

	def select_frame(self,msg):
		name = msg["name"]
		if name in self.frame_list:
			self.knmtc.set_frame_tcp (frame=np.matrix(self.frame_list[name]) , tcp = None )

	def read_tcp_frame_from_file(self):
		try:
			with open(self.frame_list_path, 'r') as file:
				self.frame_list = json.load(file)
		except:
			pass

		try:
			with open(self.tcp_list_path, 'r') as file:
				self.tcp_list = json.load(file)
		except:
			pass

	def select_tcp(self,msg):
		name = msg["name"]
		if name in self.tcp_list:
			self.knmtc.set_frame_tcp (frame = None, tcp=np.matrix(self.tcp_list[name]))

	def get_info_dic(self):
		return {"to":"knmtc_params" ,
                    "model":self.model,
                    "n_dof":self.knmtc.n_dof,
                    "alpha":self.knmtc.alpha,
                    "delta":self.knmtc.delta,
                    "a":self.knmtc.a,
                    "d":self.knmtc.d,
                    "rail_vec":self.knmtc.rail_vec_r_base,
                    "rail_limit":self.knmtc.rail_limit,
                    "rail_mat": np.array(self.knmtc.T_rail_r_world).ravel().tolist(),
                    "tcp_mat":np.array(self.knmtc.T_tcp_r_flange).ravel().tolist(),
                    "rail_on":self.knmtc.rail_on
                }

	def save_tcp_list(self):
		with open(self.tcp_list_path, 'w') as file:
			json.dump(self.tcp_list, file, indent=2)


	def save_frame_list(self):
		with open(self.frame_list_path, 'w') as file:
			json.dump(self.frame_list, file, indent=2)

	async def base(self, ws, server_loop):
		pass

	async def tcp(self, ws, server_loop):
		pass
