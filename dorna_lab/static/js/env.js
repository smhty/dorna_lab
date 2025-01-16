
const env_scene = new THREE.Group();


function env_text_parse(){

	if (scene.children.includes(env_scene)) {
		//nothing to do here
	}
	else{
		scene.add(env_scene);
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