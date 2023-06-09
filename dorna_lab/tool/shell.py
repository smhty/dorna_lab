import os
import asyncio
from datetime import datetime, date
import json


class Update(object):
    def __init__(self, cmd):
        super(Update, self).__init__()
        self.p = None
        self.cmd = cmd

    async def run(self, socket, ws, server_loop):
        self.p = await asyncio.create_subprocess_shell(
            self.cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT)
        
        # run the loop
        while True:
            output = await self.p.stdout.readline()
            if output:
                msg = {"to": "update","msg": str(output.strip(), "utf-8")}
                server_loop.add_callback(ws.emit_message, json.dumps(msg))

            if self.p.returncode is not None:
                break
            await asyncio.sleep(0)


class Shell(object):
    def __init__(self, cmd):
        super(Shell, self).__init__()
        self.lock = asyncio.Lock()
        self.p = None
        self.cmd = cmd

    async def run(self, socket, ws, server_loop, db, dir = None):
        if(dir==None):
            self.p = await asyncio.create_subprocess_shell(
                self.cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT)
        else:
            self.p = await asyncio.create_subprocess_shell(
                self.cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT, cwd=dir)
            
        asyncio.create_task(db.db_call(socket, server_loop, "INSERT INTO program VALUES (" + str(self.p.pid) + ",'" + date.today().strftime("%B %d,%Y") +
                             " - " + datetime.now().strftime("%H:%M:%S") + "', '---' , 'running', '"+self.cmd+"' )"))
        asyncio.create_task(db.db_call(socket, server_loop, "SELECT * FROM program"))

        msg = {"to": "shell", "msg": "(process id: " + str(self.p.pid) + ") " + "process started at: " +date.today().strftime("%B %d, %Y") + " - " + datetime.now().strftime("%H:%M:%S") + " | raw command: " + self.cmd,"pid":self.p.pid}
        if(ws):
            server_loop.add_callback(ws.emit_message, json.dumps(msg))
        else:
            for wss in socket.ws_list:
                server_loop.add_callback(wss.emit_message, json.dumps(msg))

        # run the loop
        while True:
            output = await self.p.stdout.readline()
            if output:
                msg = {"to": "shell","msg": "(process id: " + str(self.p.pid) + ") " + str(output.strip(), "utf-8"),"pid":self.p.pid}
                if(ws):
                    server_loop.add_callback(ws.emit_message, json.dumps(msg))
                else:
                    for wss in socket.ws_list:
                        server_loop.add_callback(wss.emit_message, json.dumps(msg))

            if self.p.returncode is not None:
                break
            await asyncio.sleep(0)

        # process completed
        msg = {"to": "shell", "msg": "(process id: " + str(self.p.pid) + ") " + "process completed at: " + date.today().strftime("%B %d, %Y") + " - " + datetime.now().strftime("%H:%M:%S"),"pid":-1}
        
        if(ws):
            server_loop.add_callback(ws.emit_message, json.dumps(msg))
        else:
            for wss in socket.ws_list:
                server_loop.add_callback(wss.emit_message, json.dumps(msg))
        
        #self.p.kill()
        asyncio.create_task(db.db_call(socket, server_loop, 'UPDATE program SET status = "Ended", finish = \" ' + date.today().strftime("%B %d,%Y") +
                                      ' - ' + datetime.now().strftime("%H:%M:%S") + '\" WHERE id =' + str(self.p.pid)))
        asyncio.create_task(db.db_call(socket, server_loop, "SELECT * FROM program"))


    async def kill(self, socket, ws, server_loop, db):
        cmd = "sudo sh /home/dorna/Downloads/dorna_lab/dorna_lab/force_kill.sh "+ str(self.p.pid)
        kill_process = await asyncio.create_subprocess_shell(cmd)
        msg = {"to": "shell","msg": "(process id: " + str(self.p.pid) + ") " + "process terminated", "pid":-1}
        server_loop.add_callback(ws.emit_message, json.dumps(msg))

        asyncio.create_task(db.db_call(socket, server_loop, 'UPDATE program SET status = "Ended", finish = \" ' + date.today().strftime("%B %d,%Y") +
                              ' - ' + datetime.now().strftime("%H:%M:%S") + '\" WHERE id =' + str(self.p.pid)))
        asyncio.create_task(db.db_call(socket, server_loop, "SELECT * FROM program"))
        
        """
        async with self.lock:
            #if self.p.returncode is not None:
            self.p.terminate()
            msg = {"to": "shell","msg": "(process id: " + str(self.p.pid) + ") " + "process terminated", "pid":-1}
            server_loop.add_callback(ws.emit_message, json.dumps(msg))

            asyncio.create_task(db.db_call(socket, server_loop, 'UPDATE program SET status = "Ended", finish = \" ' + date.today().strftime("%B %d,%Y") +
                                  ' - ' + datetime.now().strftime("%H:%M:%S") + '\" WHERE id =' + str(self.p.pid)))
            asyncio.create_task(db.db_call(socket, server_loop, "SELECT * FROM program"))
        """