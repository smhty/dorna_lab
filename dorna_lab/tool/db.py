import sqlite3
import json
import asyncio


class db_class(object):
    def __init__(self,address):
        super(db_class, self).__init__()
        self.con = sqlite3.connect(
            address,
            detect_types = sqlite3.PARSE_DECLTYPES , check_same_thread=False
        )
        self.con.row_factory = sqlite3.Row
        self.init_db()


    async def db_call(self,socket, server_loop, call):
        rtn = {"to": "db.call", "call" : call, "result": "", "broadcast": False, "error": 0}

        try:    
            cur = self.con.cursor()

            #res = await asyncio.create_task(asyncio.to_thread( cur.execute, call))
            res = await asyncio.get_running_loop().run_in_executor(None, cur.execute, call)
            res_list = []
            
            for row in res:
                res_list.append(list(row))

            res_txt = str(res_list).replace("\'","\"")
            rtn["result"] = res_txt

            self.con.commit()

        except Exception as ex:
            rtn["error"] = 1
            rtn["error_ex"] = ex
            
        
        #socket.emit_all(json.dumps(rtn))
        server_loop.add_callback(socket.emit_all, json.dumps(rtn))
        return rtn

    def close_db(self, e=None):
        self.con.close()

    def init_db(self):
        schema = """DROP TABLE IF EXISTS program;
        CREATE TABLE program (
          id INTEGER PRIMARY KEY ,
          start TEXT NOT NULL,
          finish TEXT,
          status TEXT NOT NULL,
          file TEXT,
          dir TEXT
        );"""

        #with current_app.open_resource('tool/schema.sql') as f:
        self.con.executescript(schema)
        #self.db_call("INSERT INTO program VALUES (0,'asdafa', '---' , 'running', agagasdf] )")

    #def init_app(app):
        #app.teardown_appcontext(close_db)
     #   print("init app")
        #app.cli.add_command(init_db_command)