from dorna2 import Kinematic
import asyncio
import json
import math
import numpy as np
import os
from scipy.optimize import minimize
from kinematic import kinematic_class
import sys


def frame_set(knmtc, msg):
	j1 = msg["point_1"]
	j2 = msg["point_2"]
	j3 = msg["point_3"]
	j4 = msg["point_4"]

	p1 = np.array(knmtc.knmtc.fw(j1)[:3])
	p2 = np.array(knmtc.knmtc.fw(j2)[:3])
	p3 = np.array(knmtc.knmtc.fw(j3)[:3])
	p4 = np.array(knmtc.knmtc.fw(j4)[:3])

	#center is given
	center = p1
	#x is the difference of p3 and p1
	x = p3 - center 
	pz = p4 - center
	#normalize x
	x = x / np.linalg.norm(x)
	#y is the difference of p2 and p1
	y = p2 - center
	#make y orthogonal to x
	y = y - x * np.dot(x,y)
	#normalize y
	y = y / np.linalg.norm(y)
	#calculating z is easy now
	z = np.cross(x,y)

	if(np.dot(z,pz)<0):
		y = -y
		z = -z

	result_matrix = [	[x[0] , y[0] , z[0], center[0]],
								[x[1] , y[1] , z[1], center[1]],
								[x[2] , y[2] , z[2], center[2]],
								[0 	  , 0    , 0   , 1		  ]]

	if np.isnan(result_matrix).any():
		return

	knmtc.frame_list[msg["name"]] = result_matrix
	knmtc.save_frame_list()



def tcp_set(knmtc, msg):

	j1 = msg["point_1"]
	j2 = msg["point_2"]
	j3 = msg["point_3"]
	j4 = msg["point_4"]
	j5 = msg["point_5"]
	j6 = msg["point_6"]

	t1 = knmtc.knmtc.t_flange_r_world(joint = j1)
	t2 = knmtc.knmtc.t_flange_r_world(joint = j2)
	t3 = knmtc.knmtc.t_flange_r_world(joint = j3)
	t4 = knmtc.knmtc.t_flange_r_world(joint = j4)
	t5 = knmtc.knmtc.t_flange_r_world(joint = j5)
	t6 = knmtc.knmtc.t_flange_r_world(joint = j6)

	def loss_function(v):
		vector = np.array([[v[0], v[1], v[2], 1]])
		v1 = (np.matmul(t1, vector.T).T)[0]
		v2 = (np.matmul(t2, vector.T).T)[0]
		v3 = (np.matmul(t3, vector.T).T)[0]
		v4 = (np.matmul(t4, vector.T).T)[0]
		loss_value = np.linalg.norm(v1-v2) + np.linalg.norm(v2-v3) + np.linalg.norm(v3-v4)
		return loss_value

	result_pos =  minimize(loss_function, [0,0,0], method='BFGS').x

	base_v1 = [0,0,0]
	base_v2 = [0,0,0]

	if(msg["point_5_base_dir"]=="0"):
		base_v1 = [1,0,0,0]
	if(msg["point_5_base_dir"]=="1"):
		base_v1 = [0,1,0,0]
	if(msg["point_5_base_dir"]=="2"):
		base_v1 = [0,0,1,0]
	if(msg["point_5_base_dir"]=="3"):
		base_v1 = [-1,0,0,0]
	if(msg["point_5_base_dir"]=="4"):
		base_v1 = [0,-1,0,0]
	if(msg["point_5_base_dir"]=="5"):
		base_v1 = [0,0,-1,0]

	if(msg["point_6_base_dir"]=="0"):
		base_v2 = [1,0,0,0]
	if(msg["point_6_base_dir"]=="1"):
		base_v2 = [0,1,0,0]
	if(msg["point_6_base_dir"]=="2"):
		base_v2 = [0,0,1,0]
	if(msg["point_6_base_dir"]=="3"):
		base_v2 = [-1,0,0,0]
	if(msg["point_6_base_dir"]=="4"):
		base_v2 = [0,-1,0,0]
	if(msg["point_6_base_dir"]=='5'):
		base_v2 = [0,0,-1,0]

	base_v1 = np.array([base_v1]).T
	base_v2 = np.array([base_v2]).T

	vz = (np.matmul(np.linalg.inv(t5), base_v1).T)
	vx = (np.matmul(np.linalg.inv(t6), base_v2).T)
	vz = np.array([vz[0,0],vz[0,1],vz[0,2]])
	vx = np.array([vx[0,0],vx[0,1],vx[0,2]])

	vz = vz  / np.linalg.norm(vz)
	vx = vx - vz*np.dot(vz,vx)
	vx = vx / np.linalg.norm(vx)
	vy = np.cross(vz,vx)

	result_matrix = [	[vx[0] , vy[0] , vz[0], result_pos[0]],
						[vx[1] , vy[1] , vz[1], result_pos[1]],
						[vx[2] , vy[2] , vz[2], result_pos[2]],
						[0 	  , 0    , 0   , 1		  ]]	
	if np.isnan(result_matrix).any():
		return

	knmtc.tcp_list[msg["name"]] = result_matrix
	knmtc.save_tcp_list()


def save_frame_tcp(name="empty", tcp=False, frame=True, matrix=None, xyzabc=None):
	knmtc = kinematic_class('dorna_ta')
	
	if xyzabc is not None:
		matrix = knmtc.knmtc.cf_test.xyzabc_to_mat(xyzabc)

	if matrix is None:
		return

	if tcp:
		knmtc.tcp_list[name] = matrix
		knmtc.save_tcp_list()

	if frame:
		knmtc.frame_list[name] = matrix
		knmtc.save_frame_list()



if __name__ == "__main__":
	function = sys.argv[1]
	msg = json.loads(sys.argv[2])
	knmtc = kinematic_class('dorna_ta')

	if function == "frame_set":
		frame_set(knmtc, msg)

	if function == "tcp_set":
		tcp_set(knmtc, msg)	
