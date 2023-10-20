from time import time
import cv2
import base64
import asyncio

class Camera(object):
	camera_thread_stop = False

	def __init__(self):
		self.cap  = cv2.VideoCapture(0) 
		frame_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
		frame_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
		frame_rate = self.cap.get(cv2.CAP_PROP_FPS)

		print(f"Frame Width: {frame_width}")
		print(f"Frame Height: {frame_height}")
		print(f"Frame Rate: {frame_rate} FPS")

	def get_frame(self):
		return self.cap.read()

	async  def capture_webcam_data(self,ws_handler):
		while not self.camera_thread_stop:
			ret, frame = self.cap.read()
			
			#cv2.imshow("Webcam Preview", frame)
			

			#Process and encode the frame (e.g., to JPEG)
			_, encoded_image = cv2.imencode('.jpg', frame)
			image_data = base64.b64encode(encoded_image.tobytes()).decode('utf-8')
			ws_handler.write_message({'to':"cam_r",'image_data': image_data})
			ws_handler.write_message({'to':"cam_l",'image_data': image_data})

			#key = cv2.waitKey(1)
			#if key & 0xFF == ord('q'):
			#	break
			await asyncio.sleep(0.1)