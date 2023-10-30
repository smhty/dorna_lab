from time import time
import cv2
import base64
import asyncio

class Camera(object):
	camera_thread_stop = False

	def __init__(self):
		self.cap_r  = cv2.VideoCapture(0) #these two must be changed for webcam
		self.cap_l  = cv2.VideoCapture(0) 

		frame_width = int(self.cap_r.get(cv2.CAP_PROP_FRAME_WIDTH))
		frame_height = int(self.cap_r.get(cv2.CAP_PROP_FRAME_HEIGHT))
		frame_rate = self.cap_r.get(cv2.CAP_PROP_FPS)

		print(f"Frame Width: {frame_width}")
		print(f"Frame Height: {frame_height}")
		print(f"Frame Rate: {frame_rate} FPS")

	async  def capture_webcam_data(self,ws_handler):
		while not self.camera_thread_stop:
			ret_r, frame_r = self.cap_r.read()
			#ret_l, frame_l = self.cap_l.read()			

			#Process and encode the frame (e.g., to JPEG)
			_, encoded_image = cv2.imencode('.jpg', frame_r)
			image_data = base64.b64encode(encoded_image.tobytes()).decode('utf-8')
			ws_handler.write_message({'to':"cam_r",'image_data': image_data})


			#_, encoded_image = cv2.imencode('.jpg', frame_l)
			#image_data = base64.b64encode(encoded_image.tobytes()).decode('utf-8')
			ws_handler.write_message({'to':"cam_l",'image_data': image_data})


			await asyncio.sleep(0.04)