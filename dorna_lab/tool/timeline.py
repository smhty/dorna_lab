"""
series of commands are given to the robot and break it to a way points
"""
class waypoint(object):
	"""docstring for waypoint"""
	def __init__(self, arg):
		super(waypoint, self).__init__()
		self.current = []
	
	def cmds_to_groups(self, cmds):
		grps = []
		while len(cmds) != 0
			# init group
			grp = []
			while len(cmds) != 0:
				if len(grp) == 0:
					grp.append(cmds.pop(0))

					# circle
					if grp[0]["cmd"] == "cmove":
						break

					# cont == 0 or no cont
					if "cont" not in grp[0] or grp[0]["cont"] == 0:
						break

				else:
					# different cmd
					if cmds[0]["cmd"] != grp[-1]["cmd"]:
						break

					# add to group
					grp.append(cmds.pop(0))

					# cont == 0
					if "cont" in grp[-1] and grp[-1]["cont"] == 0:
						break
			
			# check for the size
			if len(grp):
				grps.append(grp)

		return grps

	# create based on new set of cmds
	def create(self, cmds):
		grps = self.cmds_to_groups(list(cmds))

		# frame data: velocity and position 
		for grp in grps:
			pass

		self.


	# add a new cmd
	def update(self, cmds):
		# compare to



	
			