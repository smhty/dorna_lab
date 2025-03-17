import os
import time
import json
import asyncio
import numpy as np

import tornado.ioloop
import tornado.web
import tornado.websocket

from tornado.web import  RequestHandler


from flask_to_tornado import BaseHandler

from dorna2 import Dorna, __version__ as V_API
from tool import db,folder,shell, update, kinematic
import config

PATH = os.path.dirname(os.path.abspath(__file__))
STATIC_PATH_DIR = os.path.join(PATH, 'static')

# change directory
os.chdir(os.path.join(PATH))

V_LAB = "2.1.0" 

CONFIG = config.config               

# initialize config.log
with open('user_data/config.log') as infile: #importing config.log file
    config_data = json.load(infile)
    """
    # make sure all the keys exists
    if "startup" not in config_data:
        config_data["startup"] = ""
    if "emergency_enable" not in config_data:
        config_data["emergency_enable"] = False
    if "emergency_key" not in config_data:
        config_data["emergency_key"] = "in0"
    if "emergency_value" not in config_data:
        config_data["emergency_value"] = 1
    """
"""
with open("config.log", "w") as infile:
    json.dump(config_data, infile)
"""

loop = tornado.ioloop.IOLoop.current()
kin = kinematic.kinematic_class(config_data["model"])
DATABASE = db.db_class(os.path.join(PATH, 'flaskr.sqlite'))
PROCESSES = []
ENV_UPLOAD_DIR = "env_model"  # Define your upload directory



class gui(BaseHandler):
    def get(self, **kwargs):
        data = {"host_ip": CONFIG['server']['host'],
                "port": CONFIG['server']['port'], "dorna_lab": V_LAB, "api": V_API}
        return self.render_jinja('index.html', data=data, cmd=CONFIG["cmd"], config=CONFIG)



class DornaConnection(object):
    
    def __init__(self):
        self.robot = Dorna()
        self.robot.log("connecting")


        robot_address = CONFIG['robot_server']['host']
        if('robot_host_server' in config_data):
            robot_address = config_data['robot_host_server']
        else:
            config_data['robot_host_server'] = robot_address
            with open("user_data/config.log", "w") as outfile:
                json.dump(config_data, outfile)

        self.connect_robot(robot_address)
        self.robot.log("connected")

        self.robot.register_callback(self.send_message_to_browser)
        
        if all([k in config_data for k in ("emergency_enable","emergency_key","emergency_value")]):
            self.robot.set_emergency(enable =config_data["emergency_enable"],   key = config_data["emergency_key"],   value = config_data["emergency_value"])
        
        self.ws_list = []


        #self.cu_client.send_command({"type":"fw","data":{"joints":[0.0,0.0,0.0,0.0,0.0,0.0]}})

    def connect_robot(self,address):
        self.robot.connect(address)
    
    def register_ws(self, ws):
        self.ws_list.append(ws)

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
                dic = kin.get_info_dic()
                dic["to"] = "config"
                loop.add_callback(self.emit_message, json.dumps(dic))

                loop.add_callback(self.emit_message, json.dumps({"to":"os" ,
                        "application_dir":os.getcwd(),
                        "tool_dir": os.path.join(os.getcwd(), "tool"),
                        "os_info":os.name#gives posix for linux , nt for windows
                        })) #os data

                if("startup" in config_data):
                    loop.add_callback(self.emit_message, json.dumps({"to":"startup" ,
                        "startup":config_data["startup"]
                        }))

                if("robot_host_server" in config_data):
                    loop.add_callback(self.emit_message, json.dumps({"to":"host" ,
                        "host":config_data["robot_host_server"]
                        }))

                if("emergency_enable" in config_data):
                    loop.add_callback(self.emit_message, json.dumps({"to":"emergency" ,
                        "emergency_enable":config_data["emergency_enable"],
                        "emergency_key":config_data["emergency_key"],
                        "emergency_value":config_data["emergency_value"]
                        }))
                    
                kin.update_tcp_frame_list(self, loop)

            elif msg["_server"] == "update":
                self.update_process(msg["prm"][0])

            elif msg["_server"] == "update_check":
                self.update_check_process()

            elif msg["_server"] == "func":
                self.func_process(msg)

            elif msg["_server"] == "startup_set":
                config_data["startup"] = msg["text"]
                #?json_object = json.dumps(config_data)
                with open("user_data/config.log", "w") as outfile:
                    json.dump(config_data, outfile)

            elif msg["_server"] == "startup_get":
                if("startup" in config_data):
                    loop.add_callback(self.emit_message, json.dumps({"to":"startup" ,
                        "startup":config_data["startup"]
                        }))

            elif msg["_server"] == "host_set":
                DORNA.connect_robot(msg["text"])
                config_data["robot_host_server"] = msg["text"]
                with open("user_data/config.log", "w") as outfile:
                    json.dump(config_data, outfile)

            elif msg["_server"] == "host_get":
                if("startup" in config_data):
                    loop.add_callback(self.emit_message, json.dumps({"to":"host" ,
                        "host":config_data["robot_host_server"]
                        }))

            elif msg["_server"] == "emergency":
                if("enable" in msg):
                    config_data["emergency_enable"] = msg["enable"]
                if("key" in msg):
                    config_data["emergency_key"] = msg["key"]
                if("value" in msg):
                    config_data["emergency_value"] = msg["value"]
                #?json_object = json.dumps(config_data)
                with open("user_data/config.log", "w") as outfile:
                    json.dump(config_data, outfile)

                DORNA.robot.set_emergency(enable =config_data["emergency_enable"], key = config_data["emergency_key"],
                    value = config_data["emergency_value"])

                loop.add_callback(self.emit_message, json.dumps({"to":"emergency" ,
                    "emergency_enable":config_data["emergency_enable"],
                    "emergency_key":config_data["emergency_key"],
                    "emergency_value":config_data["emergency_value"]
                    }))

            elif msg["_server"] == "db":
                self.database(msg["prm"][0])

            elif msg["_server"] == "folder":
                self.folder_process(msg)   

            elif msg["_server"] == "knmtc":
                self.knmtc(msg)   

            elif msg["_server"] == "set_cuda_env":
                self.set_cuda_env(msg)

            elif msg["_server"] == "cuda":
                try:
                    if msg["cmd"] == "motion":
                        DORNA.robot.cu_client.cuda_run_motion(msg["points"],msg["init"])
                    if msg["cmd"] == "connect":
                        DORNA.robot.cu_client.connect(msg["add"])
                    if msg["cmd"] == "tcp_set":
                        DORNA.robot.cu_client.tcp_set(msg["data"])

                except Exception as ex:
                    DORNA.robot.log("error running cuda command: "+ str(ex))

            elif msg["_server"] == "select_tcp" or msg["_server"] == "select_frame":
                if msg["_server"] == "select_tcp":
                    self.select_tcp(msg)
                elif msg["_server"] == "select_frame":
                    self.select_frame(msg)
                loop.add_callback(self.emit_message, json.dumps(kin.get_info_dic()))

            elif msg["_server"] == "code":
                try:
                    eval(msg["code"])
                except:
                    DORNA.robot.log("error1: running message error.")
                    #print("error1")

            elif msg["_server"] == "knmtc_params":
                prms = json.loads(msg["prm"][0])
                if("rail_limit" in prms):
                    kin.knmtc.rail_limit[0] = prms["rail_limit"][0]
                    kin.knmtc.rail_limit[1] = prms["rail_limit"][1]
                if("rail_vec" in prms):    
                    kin.knmtc.rail_vec_r_base[0]  = prms["rail_vec"][0]
                    kin.knmtc.rail_vec_r_base[1]  = prms["rail_vec"][1]
                    kin.knmtc.rail_vec_r_base[2]  = prms["rail_vec"][2]
                if("rail_mat" in prms):  
                    kin.knmtc.T_rail_r_world = np.array(prms["rail_mat"]).reshape((4, 4)) #depreceated
                if("tcp_mat" in prms):  
                    kin.knmtc.T_tcp_r_flange = np.array(prms["tcp_mat"]).reshape((4, 4)) #depreceated
                if("rail_on" in prms):  
                    kin.knmtc.rail_on = prms["rail_on"]

                loop.add_callback(self.emit_message, json.dumps(kin.get_info_dic()))


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
            #print("error8: "+ str(ex))

    def select_frame(self, msg):
        try:
            kin.select_frame( msg)  
        except Exception as ex:   
            pass   
    def select_tcp(self, msg):
        try:
            kin.select_tcp( msg)
        except Exception as ex:
            pass

    def emit_message(self,msg):
        try:
            self.write_message(msg)
        except Exception as ex:
            DORNA.robot.log('error9'+ str(ex))
            #print('error9'+ str(ex))

    def set_cuda_env(self,msg):
        try:
            if msg["path"]=="":
                DORNA.robot.cu_client.clear_env()
            else:
                DORNA.robot.cu_client.upload_file(msg["path"])
        except Exception as ex:
            DORNA.robot.log('setting cuda env error: '+ str(ex))



if __name__ == '__main__':
    app = [
        (r"/", gui),
        (r"/ws", WebSocket),
        (r'/static/(.*)', tornado.web.StaticFileHandler,
         {'path': STATIC_PATH_DIR}),
    ]
    app = tornado.web.Application(app, debug=CONFIG["server"]["debug"]) 
    app.listen(CONFIG["server"]["port"]) 
    
    def startup_function():
        if "startup" in config_data:
            for line in config_data["startup"].splitlines():
                if len(line) == 0 or line==" ": 
                    continue
                if line[0]=="#":
                    continue
                file_path_and_name = os.path.split(os.path.abspath(line))
                startup_process = shell.Shell("cd "+file_path_and_name[0]+" && sudo python3 " + file_path_and_name[1].split(".")[0] + ".py")
                asyncio.create_task(startup_process.run(DORNA, None, loop, DATABASE, None))
                PROCESSES.append(startup_process)

    loop.call_later(delay=1, callback=startup_function)
    loop.start()

    while True:
        time.sleep(1)