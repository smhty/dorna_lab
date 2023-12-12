from dorna2 import Kinematic
import asyncio
import json
import base64
import numpy as np
import cv2
import io
from PIL import Image

def grayscale(image):
	return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

def vision_play(ws, msg):
	#create input image list
	im = []
	preview_list = []
	for image_data in msg['images']:

		image_bytes = base64.b64decode(image_data.split(",")[1])
		nparr = np.frombuffer(image_bytes, np.uint8)
		cv2_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
		im.append(cv2_img)

	#run code
	exec(msg['code'])

	send_back_preview_data = []

	for im in preview_list:
		_, encoded_image = cv2.imencode('.jpg', im)
		processed_image_base64 = base64.b64encode(encoded_image).decode('utf-8')
		send_back_preview_data.append(processed_image_base64)
    
	rtn = {"to": "vision_preview", "images":send_back_preview_data , "error": 0}		
	ws.emit_message(json.dumps(rtn))	
    # Send the processed image back to the client
    #emit('processed_image', {'processed_image': processed_image_base64})