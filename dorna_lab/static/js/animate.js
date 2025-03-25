var graphic = true
// frame object
var frame = {
        "fps": 60,
        "delay": 0.5,
        "busy": false,
        "frames" : [],
        "last" : null,
}
var f_dsp

var scale_factor = 0.01
if ( THREE.WEBGL.isWebGLAvailable() === false ) {
  document.body.appendChild( THREE.WEBGL.getWebGLErrorMessage() );
}
var container;//, stats;
var camera, scene, renderer, control_camera, ah ;
var particleLight;
var anime_id;
var chain;
var  env_transformControls; 

/**div**/
container = document.createElement( 'div' );
var parent = document.getElementsByClassName("view_3d")[0]
parent.appendChild( container )
var view_container = document.getElementsByClassName("view_3d")[0]


function init_scene(){
  // scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color( "#cccccc");
  
}


function init_collada(){
  //let bad_scene = new THREE.Scene();
  original_robot =  new Robot( renderer , camera , scene , control_camera , 0.35 , false);

  chain = new move_chain(scene, camera, renderer,control_camera);
  chain.callback.add(change_ghost_value);

  $('.path_design_visible_c').trigger("click");

  let track = new Trail(0xab2800,original_robot,100,0.05,scene);

  f_dsp = setInterval(frame_display, 1000/frame["fps"])


}


function graphic_on() {

    /*********************/
    // camera
    camera = new THREE.PerspectiveCamera( 65, $(view_container).width() / $(view_container).height(), 0.1, 20000);
    camera.position.set( 700, 700 , 350  );
    camera.up.set(0,0,1);
    // Grid
    var grid = new THREE.GridHelper( 10, 10, 0x444444, 0x888888 );
    scene.add( grid );
    grid.matrixAutoUpdate = false;
    grid.matrix.set(100   , 0     , 0     , 0 ,
                    0     , 0     , 100   , 0 ,
                    0     , 100   , 0     , 0 ,
                    0     , 0     , 0     , 1 );
 
    grid.matrixWorldNeedsUpdate = true;

    
    const hlight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    hlight.position.set(-0.2,0.1,1);
    scene.add( hlight );

    //var light = new THREE.AmbientLight( 0xb8b7ae ); // soft white light
     //scene.add(light)


    renderer = new THREE.WebGLRenderer( { antialias : true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( $(view_container).width(), $(view_container).height() );
    renderer.setClearColor(0xffffff, 1);
    container.appendChild( renderer.domElement );
    var cam =  camera;

    // control camera
    control_camera = new THREE.OrbitControls( camera, renderer.domElement );

    control_camera.enableZoom    = true;
    control_camera.enableKeys = false;



    // Axis
    ah = new THREE.AxesHelper(1);
    ah.matrixAutoUpdate = false

    ah.renderOrder = 999;
    ah.onBeforeRender = function( renderer ) { renderer.clearDepth(); };//draw Axis helper on top of other meshes
    scene.add( ah );
    ah.matrix.set(40  , 0.0   , 0     , 0 ,
                  0     , 40  , 0     , 0 ,
                  0     , 0     , 40  , 0 ,
                  0     , 0     , 0     , 1 );
 
    ah.matrixWorldNeedsUpdate = true;

    //env transformation control
    env_transformControls = new THREE.TransformControls(camera, renderer.domElement);
    scene.add(env_transformControls);
    env_transformControls.addEventListener( 'dragging-changed', function ( event) {control_camera.enabled = ! event.value;});



    //window resize
    window.addEventListener( 'resize', onWindowResize );
}



function graphic_off(node){
  disposeHierarchy (node, disposeNode) 
  
  while(node.children.length > 0){ 
    node.remove(node.children[0]);
    
  } 

  clearInterval(f_dsp)
  graphic = false
  frame = {
          "fps": 60,
          "delay": 0.5,
          "busy": false,
          "frames" : [],
          "last" : null,
  }  
}

function destroy_scene(){
  //cancelAnimationFrame(anime_id);// Stop the animation
  renderer.domElement.addEventListener('dblclick', null, false); //remove listener to render
  scene = null;
  projector = null;
  camera = null;
  control_camera = null;
  empty(container);
}

function set_frame(joint){
  if(original_robot.initialized)
    original_robot.set_joints_and_position(joint);
}


function frame_display(){

  // read the encoder value
  render()
  gamepad_agent.update()
}


function frame_display_backup(){
    let l = frame["frames"].length
    if(l == 0 ){
      return -1
    }
    let time = +new Date / 1000
    time = time - frame["delay"]

    let joint = []

    // find the interval
    let i = -1
    while( i+1 < l && time >= frame["frames"][i+1]["time"]){
        i = i + 1;
    }
    
    // interpolate
    if(i === -1){
      return -1  
    }else if( i === l-1){
        joint = frame["frames"][l-1]["joint"]
        frame["frames"][l-1]["time"] = time
    }else{
        for (let j = 0;  j < frame["frames"][i]["joint"].length  ; j++) {
            joint.push(
            frame["frames"][i]["joint"][j] + (frame["frames"][i+1]["joint"][j]-frame["frames"][i]["joint"][j])*(time- frame["frames"][i]["time"])/(frame["frames"][i+1]["time"]- frame["frames"][i]["time"])
            )
        }
    }

    // remove old frames
    for (let k = 0; k < i ; k++) {
        frame["frames"].shift()
    }
    


    // set_frame
    if(frame["last"] != joint){
      set_frame(joint)
      frame["last"] = joint
      render()
    }

}


function onWindowResize() {
    camera.aspect = $(view_container).width() / $(view_container).height();
    camera.updateProjectionMatrix();
    renderer.setSize( $(view_container).width(), $(view_container).height() );
    //onresize()
    render()
  
  $(".resize_e" ).each(function( index){
    $(this).stop()
  })
}
//
function animate() {
  anime_id = requestAnimationFrame( animate );
}

function render() {
  /*
  let time = (+new Date / 100)%360;
  let j = {"j0":time ,"vel":300};
  on_message({"data":JSON.stringify(j)});
  */
  if(graphic){
    joints = Object.values(position());
    xyz = Object.values(position("xyz"));
    set_frame(joints.concat(xyz));
    renderer.render( scene, camera );
    control_camera.update();
  }

}

function disposeNode (node){
    if (node instanceof THREE.Mesh)
    {
        if (node.geometry)
        {
            node.geometry.dispose ();
        }

        if (node.material)
        {
            if (node.material instanceof THREE.MeshFaceMaterial)
            {
                $.each (node.material.materials, function (idx, mtrl)
                {
                    if (mtrl.map)           mtrl.map.dispose ();
                    if (mtrl.lightMap)      mtrl.lightMap.dispose ();
                    if (mtrl.bumpMap)       mtrl.bumpMap.dispose ();
                    if (mtrl.normalMap)     mtrl.normalMap.dispose ();
                    if (mtrl.specularMap)   mtrl.specularMap.dispose ();
                    if (mtrl.envMap)        mtrl.envMap.dispose ();

                    mtrl.dispose ();    // disposes any programs associated with the material
                });
            }
            else
            {
                if (node.material.map)          node.material.map.dispose ();
                if (node.material.lightMap)     node.material.lightMap.dispose ();
                if (node.material.bumpMap)      node.material.bumpMap.dispose ();
                if (node.material.normalMap)    node.material.normalMap.dispose ();
                if (node.material.specularMap)  node.material.specularMap.dispose ();
                if (node.material.envMap)       node.material.envMap.dispose ();

                node.material.dispose ();   // disposes any programs associated with the material
            }
        }
    }
}   // disposeNode

function disposeHierarchy (node, callback){
    for (var i = node.children.length - 1; i >= 0; i--)
    {

        var child = node.children[i];
        disposeHierarchy (child, callback);
        callback (child);
    }
}

function empty(elem) {
    while (elem.lastChild) elem.removeChild(elem.lastChild);
}







