
const env_scene = new THREE.Group();


function load_obj_to_scene(objUrl) {
    // Use your Three.js OBJLoader to load the object
    reset_env_scene()
    const loader = new THREE.OBJLoader();
    loader.load(objUrl, (object) => {
      env_scene.add(object); // Assuming you have a scene variable
    });
   
}

function reset_env_scene(){
    $('#env_file_input').val("");
    if (scene.children.includes(env_scene)) {
            //nothing to do here
        }
        else{
            scene.add(env_scene);
            env_scene.matrixAutoUpdate = false;
            env_scene.matrix.set(1   , 0     , 0     , 0 ,
                                0     , 0     , 1   , 0 ,
                                0     , 1   , 0     , 0 ,
                                0     , 0     , 0     , 1 );
            env_scene.matrixWorldNeedsUpdate = true;
        }

        //clear meshes
        env_scene.traverse((object) => {
            if (object.isMesh) {
                // Dispose of the object's geometry
                if (object.geometry) {
                    object.geometry.dispose();
                }

                // Dispose of the object's material
                if (object.material) {
                        object.material.dispose();
                    }
                }
            }
        );
        while (env_scene.children.length > 0) {
            env_scene.remove(env_scene.children[0]);
        }
}

/*
document.getElementById('env_upload_b').addEventListener('click', async () => {
    const fileInput = document.getElementById('env_upload');
    if (fileInput.files.length === 0) {
      alert('Please select an OBJ file.');
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const objUrl = URL.createObjectURL(file);
        load_obj_to_scene(objUrl); // Call your Three.js loader
        alert('File uploaded successfully!');
      } else {
        alert('Failed to upload file.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file.');
    }
});
*/




function env_text_parse(){

	reset_env_scene();

    //parsing the text
	let text = document.getElementById("env-txtarea").value ;
	let text_parse = JSON.parse(text);
	for (let key in text_parse) { //going through all the object types in the text
	    if (text_parse.hasOwnProperty(key)) {//going through all the objects in the text
    		for (let item_title in text_parse[key]) {
    			let item = text_parse[key][item_title];
    			let item_model;
    			
    			let dims = new THREE.Vector3(1000,1000,1000);
    			let pose = [0,0,0,1,0,0,0];
    			let color = new THREE.Color().setRGB( 0.5, 0.5, 0.5 );;
    			let scale = new THREE.Vector3(1,1,1);

    			if(item.hasOwnProperty("dims")){
    				dims.x *= item.dims[0];
    				dims.y *= item.dims[1];
    				dims.z *= item.dims[2];
    			}
    			if(item.hasOwnProperty("pose")){
    				pose[0] = item.pose[0] * 1000.0;
    				pose[1] = item.pose[1] * 1000.0;
    				pose[2] = item.pose[2] * 1000.0;
    				pose[3] = item.pose[3];
    				pose[4] = item.pose[4];
    				pose[5] = item.pose[5];
    				pose[6] = item.pose[6];
    			}
    			if(item.hasOwnProperty("color")){
    				color.setRGB(item.color[0], item.color[1], item.color[2]);
    			}
				if(item.hasOwnProperty("scale")){
    				scale.set(item.scale[0], item.scale[1], item.scale[2]);
    			}
				const material = new THREE.MeshPhysicalMaterial({ color: color.getHex() });

    			if(key=="cuboid"){
    				const geometry = new THREE.BoxGeometry(dims.x, dims.y, dims.z);
					item_model = new THREE.Mesh(geometry, material);
    			} 
    			
    			else if(key=="mesh"){
    				const objLoader = new THREE.OBJLoader();
    				objLoader.load(
					    item.file_path,
					    (object) => {
					        // Successfully loaded
					        env_scene.add(object);
					        object.position.set(pose[0], pose[1], pose[2]);
			    			object.scale.set(scale.x*1000, scale.y*1000, scale.z*1000);
			    			object.quaternion.set(pose[4] , pose[5], pose[6], pose[3]);
			    			object.title = item_title;
					    },
				        (xhr) => {
				        	//loading in process
					    },
					    (error) => {
					        // Error occurred
					        console.error('An error happened while loading the OBJ file:', error);
					    }
					);
					continue;
    			}
    			else{
    				continue;
    			}
				env_scene.add(item_model);
    			item_model.position.set(pose[0], pose[1], pose[2]);
    			item_model.scale.set(scale.x, scale.y, scale.z);
    			item_model.quaternion.set(pose[4] , pose[5], pose[6], pose[3]);
    			item_model.title = item_title;
    		}
	    }
	}
}

$('.env_create_btn').on("click", function(e){
	e.preventDefault();
	env_text_parse();
});
/*
function text_env_parse(){
	res = {}
	for (let child in env_scene.children) {
		if(child.geometry instanceof THREE.BoxGeometry){
			res["cuboid"][child.title] = {"pose":} 
		}
}
*/
// Event listener for object selection
let selectedObject = null;
// Add raycaster and mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
	if(env_transformControls.axis !== null) return; 

    // Get the bounding rectangle of the container
    const rect = view_container.getBoundingClientRect();

    // Extract container's position and size
    const containerX = rect.left;
    const containerY = rect.top;
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    // Get the mouse position relative to the viewport
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Check if the click is inside the container
    const isInside =
        mouseX >= containerX &&
        mouseX <= containerX + containerWidth &&
        mouseY >= containerY &&
        mouseY <= containerY + containerHeight;

    if(!isInside)return;

    // Normalize mouse coordinates
    mouse.x = ((event.clientX-containerX) /containerWidth) * 2 - 1;
    mouse.y = -((event.clientY-containerY) /containerHeight) * 2 + 1;

    // Raycast to find intersected objects
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(env_scene.children);

    if (intersects.length > 0) {
        selectedObject = intersects[0].object; // Get the first intersected object
        env_transformControls.attach(selectedObject); // Attach TransformControls
    } else {
        //env_transformControls.detach(); // Detach if no object is selected
        //selectedObject = null;
    }
}

window.addEventListener('mousedown', onMouseClick);
window.addEventListener('keydown', (event) => {


    if (!env_transformControls.object) return; // Only handle input if an object is selected

    switch (event.key) {
        case 'g': // Translate (move)
            env_transformControls.setMode('translate');
            break;
        case 'r': // Rotate
            env_transformControls.setMode('rotate');
            break;
        case 's': // Scale
            env_transformControls.setMode('scale');
            break;
    }
});


$('.env_open_b').click(function(e){
  open_mode();
  open_dst = "env"
})

$('.env_clear_b').click(function(e){
  clear_env();
  //send scene clearing signal to server.

})


function env_set(data, file_name){
    reset_env_scene()
    const loader = new THREE.OBJLoader();
    const object = loader.parse(data);
    env_scene.add(object);
    $('#env_file_input').val(file_name);
     send_message({
        "_server":"set_cuda_env",
        "path":last_file_full_path
    });
}

function clear_env(){
    reset_env_scene();
     send_message({
        "_server":"set_cuda_env",
        "path":""
    });
}



$('.cu_play_b').on("click", function(e){
    e.preventDefault();

    let input_str = editor.getValue();
    let stack = [];

    let valid_msg = false;

    let command_list = [];

    for(let i = 0; i < input_str.length; i++) {
        let ch = input_str.charAt(i);

        // Ignore the line if it starts with '#'
        if (ch === '#') {
            while (i < input_str.length && input_str.charAt(i) !== '\n') {
                i++;
            }
            continue;
        }

        if(ch === '{') {
            stack.push(i);
        }
        else if(ch === '}') {
            try {
                let start = stack.pop();

                if(stack.length == 0) {
                    let startPos = editor.posFromIndex(start);

                    let end = i + 1;
                    let endPos = editor.posFromIndex(end);
                    let pair = [startPos, endPos];

                    let msg = input_str.substring(start, end).replace(/[ \n\t\r]+/g,"");
                    let json_str = JSON.parse(msg);

                    valid_msg = true;
                    command_list.push(json_str);
                }
            } catch(e) {
                 console.log("Bad input format");
            }
        }
    }

     send_message({
        "_server":"cuda",
        "cmd" :"motion",
        "points":command_list,
        "init":original_robot.joints
    });


});


$('.cu_connect_b').on("click", function(e){
    e.preventDefault();

    let input_str = $('#cuda_add_input').val();
     send_message({
        "_server":"cuda",
        "cmd" :"connect",
        "add":input_str
    });
});


//tcp setup here:

var tcp_json_data = {};//"tool":{"pos":[0,0,0], "rot":[0,0,0], "scale":[100,100,100]}}; 
var  tcp_scene, tcp_transform_control ,  tcp_tool_mesh, tcp_object_mesh;

function tcp_setup_init() {
    tcp_scene = new THREE.Scene();

    tcp_transform_control = new THREE.TransformControls(camera, renderer.domElement);
    tcp_transform_control.addEventListener('objectChange', sync_Json_from_scene);
    tcp_transform_control.addEventListener( 'dragging-changed', function ( event) {control_camera.enabled = ! event.value; });
    scene.add(tcp_transform_control);
    tcp_transform_control.setSpace("local")
    original_robot.a7_g.add(tcp_scene);

    update_tcp_scene();
}

function tcp_add_item(type) {
    if (!(type in tcp_json_data)) {
        tcp_json_data[type] = { pos: [0, 0, 0], rot: [0, 0, 0], scale: [100, 100, 100] };
        update_tcp_scene();
    }
}
        
function tcp_delete_item(type) {
    //tcp_transform_control.detach() ;
    if (type in tcp_json_data) {
        delete tcp_json_data[type];
        update_tcp_scene();
    }
}

function update_tcp_scene() {
    if (tcp_tool_mesh) tcp_scene.remove(tcp_tool_mesh);
    if (tcp_object_mesh) tcp_scene.remove(tcp_object_mesh);
    
    if (tcp_json_data.tool) {
        tcp_tool_mesh = createCube(tcp_json_data.tool, 0xff0000);
        tcp_scene.add(tcp_tool_mesh);
    }
    if (tcp_json_data.object) {
        tcp_object_mesh = createCube(tcp_json_data.object, 0x0000ff);
        tcp_scene.add(tcp_object_mesh);
    }
}

function createCube(data, color) {
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshStandardMaterial({ color });
    let cube = new THREE.Mesh(geometry, material);
    cube.position.set(...data.pos);
    cube.rotation.set(...data.rot.map(r => THREE.MathUtils.degToRad(r)));
    cube.scale.set(...data.scale);
    return cube;
}

function sync_Json_from_scene() {
    if (tcp_tool_mesh && tcp_json_data.tool) {
        tcp_json_data.tool.pos = [tcp_tool_mesh.position.x, tcp_tool_mesh.position.y, tcp_tool_mesh.position.z];
        tcp_json_data.tool.rot = [tcp_tool_mesh.rotation.x, tcp_tool_mesh.rotation.y, tcp_tool_mesh.rotation.z].map(r => THREE.MathUtils.radToDeg(r));
        tcp_json_data.tool.scale = [tcp_tool_mesh.scale.x, tcp_tool_mesh.scale.y, tcp_tool_mesh.scale.z];
    }
    if (tcp_object_mesh && tcp_json_data.object) {
        tcp_json_data.object.pos = [tcp_object_mesh.position.x, tcp_object_mesh.position.y, tcp_object_mesh.position.z];
        tcp_json_data.object.rot = [tcp_object_mesh.rotation.x, tcp_object_mesh.rotation.y, tcp_object_mesh.rotation.z].map(r => THREE.MathUtils.radToDeg(r));
        tcp_json_data.object.scale = [tcp_object_mesh.scale.x, tcp_object_mesh.scale.y, tcp_object_mesh.scale.z];
    }
}

function select_tcp_object(type) {
    if (type === 'tool' && tcp_tool_mesh) {
        tcp_transform_control.attach(tcp_tool_mesh);
    } else if (type === 'object' && tcp_object_mesh) {
        tcp_transform_control.attach(tcp_object_mesh);
    } else {
        tcp_transform_control.detach();
    }
}

document.getElementById("tcp-tool-item").addEventListener("click", () => select_tcp_object('tool'));
document.getElementById("tcp-object-item").addEventListener("click", () => select_tcp_object('object'));


        
$('.tcp-transform-mode-select-b').on("click", function(e){
    e.preventDefault();

    tcp_transform_control.setMode($(this).attr("type"))
});


$('.tcp-data-submit-b').on("click", function(e){
    e.preventDefault();

    send_message({
        "_server":"cuda",
        "cmd":"tcp_set",
        "data":tcp_json_data
    });
});