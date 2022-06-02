#!/usr/bin/env python3
import base64
import requests
import json
import asyncio

    
def last_version(url):
    rtn = {}
    try:
        req = requests.get(url)
        if req.status_code == requests.codes.ok:
            req = req.json()  # the response is a JSON
            content = base64.b64decode(req['content']).decode("utf-8")
            rtn = json.loads(content)
    except:
        pass
    return rtn

async def last_version_async(ws, server_loop):
    url = "https://api.github.com/repos/dorna-robotics/upgrade/contents/version.json"
    rtn = {"to": "update_check", "broadcast": True, "error": 0, "msg": {}}
    rtn["msg"] = await asyncio.get_running_loop().run_in_executor(None, last_version, url)
    server_loop.add_callback(ws.emit_message, json.dumps(rtn))
