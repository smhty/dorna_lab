import os
import time
import json
import asyncio

import tornado.ioloop
import tornado.web
import tornado.websocket
from flask_to_tornado import BaseHandler

from dorna2 import Dorna, __version__ as V_API
from tool import db,folder,shell, update, kinematic, timeline
import config

PATH = os.path.dirname(os.path.abspath(__file__))
STATIC_PATH_DIR = os.path.join(PATH, 'static')

# change directory
os.chdir(os.path.join(PATH))

V_LAB = "2.0.3" 

CONFIG = config.config
config_file = open('config.log')
version_data = json.load(config_file)
loop = tornado.ioloop.IOLoop.current()
kin = kinematic.kinematic_class(version_data["model"])



class gui(BaseHandler):
    def get(self, **kwargs):
        data = {"host_ip": CONFIG['server']['host'],
                "port": CONFIG['server']['port'], "dorna_lab": V_LAB, "api": V_API}
        return self.render_jinja('index.html', data=data, cmd=CONFIG["cmd"], config=CONFIG)



class DornaConnection(object):
    def __init__(self):
        self.robot = Dorna()
        self.robot.log("connecting")
        self.robot.connect(CONFIG['robot_server']['host'])
        self.robot.log("connected")

        self.robot.register_callback(self.send_message_to_browser)
        self.ws_list = []

    
    def register_ws(self, ws):
        self.ws_list.append(ws)
        ws.shell_process(version_data["startup"])

    def deregister_ws(self, ws):
        self.ws_list.remove(ws)

    def send_message_to_robot(self, msg):
        try:
            if self.robot._connected:
                self.robot.play(0, msg)
        except Exception as ex:
            self.robot.log("error9: "+ str(ex))
            #print("error0"+ str(ex))
    async def send_message_to_browser(self, msg, sys):
        loop.add_callback(self.emit_all, msg)

    def emit_all(self, msg):
        for ws in self.ws_list:
            ws.emit_message(msg)


DORNA = DornaConnection()
DATABASE = db.db_class(os.path.join(PATH, 'flaskr.sqlite'))
PROCESSES = []


class WebSocket(tornado.websocket.WebSocketHandler):
    async def open(self):
        DORNA.register_ws(self)

    def on_message(self, msg):
        msg = json.loads(msg)

        if '_server' in msg:
            if msg["_server"] == "shell":
                if 'dir' in msg:
                    self.shell_process(msg["prm"][0], msg['dir'])
                else:
                    self.shell_process(msg["prm"][0])

            elif msg["_server"] == "kill":
                self.shell_kill(msg["prm"][0])
 
            elif msg["_server"] == "config":
                loop.add_callback(self.emit_message, json.dumps({"to":"config" ,
                    "model":version_data["model"],
                    "startup":version_data["startup"],
                    "n_dof":kin.knmtc.dof.n_dof,
                    "alpha":kin.knmtc.dof.alpha,
                    "delta":kin.knmtc.dof.delta,
                    "a":kin.knmtc.dof.a,
                    "d":kin.knmtc.dof.d
                    }))

            elif msg["_server"] == "update":
                self.update_process(msg["prm"][0])

            elif msg["_server"] == "update_check":
                self.update_check_process()

            elif msg["_server"] == "func":
                self.func_process(msg)

            elif msg["_server"] == "startup":
                version_data["startup"] = msg["text"]
                json_object = json.dumps(version_data, indent=4)
                with open("config.log", "w") as outfile:
                    outfile.write(json_object)

            elif msg["_server"] == "db":
                self.database(msg["prm"][0])

            elif msg["_server"] == "folder":
                self.folder_process(msg)   

            elif msg["_server"] == "knmtc":
                self.knmtc(msg)   

            elif msg["_server"] == "code":
                try:
                    eval(msg["code"])#needs to be compatible with asyncio and does the results need to be sent back to the client?
                except:
                    DORNA.robot.log("error1: running message error.")
                    #print("error1")
        else:
            DORNA.send_message_to_robot(json.dumps(msg))

    def on_close(self):
        DORNA.deregister_ws(self)

    # client running a shell
    def shell_process(self, msg, dir = None):
        try:
            process = shell.Shell(msg)
            asyncio.create_task(process.run(DORNA, self, loop, DATABASE, dir))
            PROCESSES.append(process)

        except Exception as ex:
            DORNA.robot.log("error2: "+ str(ex))
            #print("error2: "+ str(ex))
    def update_process(self, msg):
        try:
            process = shell.Update(msg)
            asyncio.create_task(process.run(DORNA, self, loop))
            PROCESSES.append(process)

        except Exception as ex:
            DORNA.robot.log("error3: "+ str(ex))
            #print("error3: "+ str(ex))

    def update_check_process(self):
        try:
            asyncio.create_task(update.last_version_async(self, loop))
        except Exception as ex:
            DORNA.robot.log("error4: "+ str(ex))
            #print("error4: "+ str(ex))

    # client running a shell
    def folder_process(self, msg):
        try:
            if msg["func"] == "get":
                asyncio.create_task(folder.get(self, loop, msg["prm"][0]))
            elif msg["func"]== "rename":
                asyncio.create_task(folder.rename(self, loop, msg["prm"][0],msg["prm"][1]))
            elif msg["func"]== "folder_delete":
                asyncio.create_task(folder.folder_delete(self, msg["prm"][0]))
            elif msg["func"]== "file_delete":
                asyncio.create_task(folder.file_delete(self, msg["prm"][0]))
            elif msg["func"]== "folder_new":
                asyncio.create_task(folder.folder_new(self, msg["prm"][0]))
            elif msg["func"]== "folder_copy":
                asyncio.create_task(folder.folder_copy(self, msg["prm"][0],msg["prm"][1]))
            elif msg["func"]== "file_copy":
                asyncio.create_task(folder.file_copy(self, msg["prm"][0],msg["prm"][1]))
            elif msg["func"]== "save_file":
                asyncio.create_task(folder.save_file(self, loop, msg["prm"][0],msg["prm"][1],msg["prm"][2]))
            elif msg["func"]== "open_file":
                asyncio.create_task(folder.open_file(self, loop, msg["prm"][0]))

        except Exception as ex:
            DORNA.robot.log("error5: "+ str(ex))
            #print("error5: "+ str(ex))

    # client killing a shell
    def shell_kill(self, pid):
        try:
            for process in PROCESSES:
                if process.p.pid == pid:
                    asyncio.create_task(process.kill(DORNA, self, loop, DATABASE))

        except Exception as ex:
            DORNA.robot.log("error6: "+ str(ex))
            #print("error6: "+ str(ex))

    def database(self, msg):
        try:
            asyncio.create_task(DATABASE.db_call(DORNA, loop, msg))
        except Exception as ex:
            DORNA.robot.log("error7: "+ str(ex))
            #print("error7: "+ str(ex))

    def knmtc(self, msg):
        try:
            if msg["func"] == "frw":
                asyncio.create_task(kin.fw(self, loop, msg["cmd_id"] if "cmd_id" in msg else None,  msg["joint"] if "joint" in msg else [0,0,0,0,0,0]))
            elif msg["func"] == "inv":
                asyncio.create_task(kin.inv(self, loop, msg["cmd_id"] if "cmd_id" in msg else None, msg["xyzabg"] if "xyzabg" in msg else None, msg["joint_current"] if "joint_current" in msg else None, msg["all_sol"] if "all_sol" in msg else False))

        except Exception as ex:
            DORNA.robot.log("error8: "+ str(ex))


    def emit_message(self,msg):
        try:
            self.write_message(msg)
        except Exception as ex:
            DORNA.robot.log('error9'+ str(ex))
            #print('error9'+ str(ex))

"""
msg["code"] = "asyncio.create_task(timeline.timeline_data(self, loop, point_data, time_start=0, ticks_per_sec=100000, sample_per_sec=5))":
msg["code"] = "asyncio.create_task(KNMTC.fw(self, loop, joint=[1, 2, 3, 4, 5, 6]))"
msg["code"] = "asyncio.create_task(KNMTC.inv(self, loop, xyzabg=[1, 2, 3, 4, 5, 6], joint_current=[1, 2, 3, 4, 5, 6], all_sol=False))"
"""

if __name__ == '__main__':
    app = [
        (r"/", gui),
        (r"/ws", WebSocket),
        (r'/static/(.*)', tornado.web.StaticFileHandler,
         {'path': STATIC_PATH_DIR}),
    ]
    app = tornado.web.Application(app, debug=CONFIG["server"]["debug"])
    app.listen(CONFIG["server"]["port"])
    loop.start()
    while True:
        time.sleep(1)