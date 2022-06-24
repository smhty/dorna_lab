import os
import shutil
import asyncio
import json

async def get(ws, server_loop, path):
    rtn = {"to": "api.folder.get", "path": path, "file": [],
           "folder": [], "broadcast": False, "error": 0}
    try:
        # get everything
        #files = await asyncio.create_task(asyncio.to_thread(os.listdir, path)) 
        files = await asyncio.get_running_loop().run_in_executor(None, os.listdir, path) 
        for f in files:
            #if await asyncio.create_task(asyncio.to_thread(os.path.isfile, os.path.join(path, f))): # is a file:
            if await asyncio.get_running_loop().run_in_executor(None, os.path.isfile, os.path.join(path, f)): # is a file:
                rtn["file"].append(f)
            else:
                rtn["folder"].append(f)

    except Exception as ex:
        rtn["error"] = 1
        rtn["error_ex"] = str(ex)

    server_loop.add_callback(ws.emit_message, json.dumps(rtn))

    return rtn

async def rename(ws, server_loop, path_old, path_new):
    rtn = {"to": "api.folder.rename", "path_old": path_old,
           "path_new": path_new, "broadcast": False, "error": 0}
    try:
        #await asyncio.create_task(asyncio.to_thread(os.rename, path_old, path_new))
        await asyncio.get_running_loop().run_in_executor(None, os.rename, path_old, path_new)
    except Exception as ex:
        rtn["error"] = 1
        rtn["error_ex"] =  str(ex)

    #ws.emit_message(json.dumps(rtn))
    server_loop.add_callback(ws.emit_message, json.dumps(rtn))
    return rtn

async def move(ws, path_old, path_new):
    rtn = {"to": "api.folder.move", "path_old": path_old,
           "path_new": path_new, "broadcast": False, "error": 0}
    try:
        #await asyncio.create_task(asyncio.to_thread(shutil.move, path_old, path_new, copy_function=shutil.copytree))
        await asyncio.get_running_loop().run_in_executor(None, shutil.move, path_old, path_new, shutil.copytree)

    except Exception as ex:
        rtn["error"] = 1
        rtn["error_ex"] =  str(ex)
    return rtn

async def folder_new(ws,  path):
    rtn = {"to": "api.folder.folder_new",
           "path": path, "broadcast": False, "error": 0}
    try:
        os.makedirs(path)
        #await asyncio.create_task(asyncio.to_thread(os.makedirs, path))
        await asyncio.get_running_loop().run_in_executor(None, os.makedirs, path)
    except:
        rtn["error"] = 1
    return rtn

async def file_new(ws,  path):
    rtn = {"to": "api.folder.file_new",
           "path": path, "broadcast": False, "error": 0}
    try:
        #await asyncio.create_task(asyncio.to_thread(open, path, "x"))
        await asyncio.get_running_loop().run_in_executor(None, open, path, "x")
    except Exception as ex:
        rtn["error"] = 1
        rtn["error_ex"] =  str(ex)
    return rtn

async def folder_delete(ws,  path):
    rtn = {"to": "api.folder.folder_delete",
           "path": path, "broadcast": False, "error": 0}
    try:
        #await asyncio.create_task(asyncio.to_thread(shutil.rmtree, path))             
        await asyncio.get_running_loop().run_in_executor(None, shutil.rmtree, path)
    except Exception as ex:
        rtn["error"] = 1
        rtn["error_ex"] =  str(ex)
    return rtn

async def file_delete(ws,  path):
    rtn = {"to": "api.folder.file_delete",
           "path": path, "broadcast": False, "error": 0}
    try:
        #await asyncio.create_task(asyncio.to_thread(os.remove, path))
        await asyncio.get_running_loop().run_in_executor(None, os.remove, path)
    except Exception as ex:
        rtn["error"] = 1
        rtn["error_ex"] =  str(ex)
    return rtn

async def file_copy(ws, path_old, path_new):
    rtn = {"to": "api.folder.file_copy",  "path_old": path_old,
           "path_new": path_new, "broadcast": False, "error": 0}
    try:
        #await asyncio.create_task(asyncio.to_thread(shutil.copyfile, path_old, path_new))
        await asyncio.get_running_loop().run_in_executor(None, shutil.copyfile, path_old, path_new)
    except Exception as ex:
        rtn["error"] = 1
        rtn["error_ex"] =  str(ex)
    return rtn

async def folder_copy(ws,   path_old, path_new):
    rtn = {"to": "api.folder.folder_copy",  "path_old": path_old,
           "path_new": path_new, "broadcast": False, "error": 0}
    try:
        #await asyncio.create_task(asyncio.to_thread(shutil.copytree, path_old, path_new))
        await asyncio.get_running_loop().run_in_executor(None, shutil.copytree, path_old, path_new)
    except Exception as ex:
        rtn["error"] = 1
        rtn["error_ex"] =  str(ex)
    return rtn

async def save_file(ws, server_loop, path, file_name, content):
    rtn = {"to": "api_folder_save_file",  "path": path,
           "file_name": file_name, "broadcast": False, "error": 0}
    try:
        name = os.path.join(path, file_name)
        #file1 = await asyncio.create_task(asyncio.to_thread(open, name, "w"))
        file1 = await asyncio.get_running_loop().run_in_executor(None, open, name, "w")
        #await asyncio.create_task(asyncio.to_thread(file1.write, content))
        await asyncio.get_running_loop().run_in_executor(None, file1.write, content)
        #await asyncio.create_task(asyncio.to_thread(file1.close))
        await asyncio.get_running_loop().run_in_executor(None, file1.close)
    except Exception as ex:
        rtn["error"] = 1
        rtn["error_ex"] =  str(ex)
    #ws.emit_message(json.dumps(rtn))
    server_loop.add_callback(ws.emit_message, json.dumps(rtn))
    return rtn

async def open_file(ws, server_loop, path):
    rtn = {"to": "api_folder_open_file",  "path": path,
           "result": "", "broadcast": False, "error": 0}
    try:
        #file1 = await asyncio.create_task(asyncio.to_thread(open, path, "r"))
        file1 = await asyncio.get_running_loop().run_in_executor(None, open, path, "r")
        #data = await asyncio.create_task(asyncio.to_thread(file1.read)) # .replace('\n', '')
        data = await asyncio.get_running_loop().run_in_executor(None, file1.read)
        rtn["result"] = data
        #await asyncio.create_task(asyncio.to_thread(file1.close))
        await asyncio.get_running_loop().run_in_executor(None, file1.close)
    except Exception as ex:
        rtn["error"] = 1
        rtn["error_ex"] =  str(ex)
    #ws.emit_message(json.dumps(rtn))
    server_loop.add_callback(ws.emit_message, json.dumps(rtn))
    return rtn
