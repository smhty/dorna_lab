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

var vr_camera,vr_scene,vr_renderer;

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

  original_robot = null;// new Robot( renderer , camera , scene , control_camera , 0.35 , false);

  chain = null// new move_chain(scene, camera, renderer,control_camera);
  //chain.callback.add(change_ghost_value);

  //$('.path_design_visible_c').trigger("click");

  //let track = new Trail(0xab2800,original_robot,100,0.05,scene);

  f_dsp = setInterval(frame_display, 1000/frame["fps"])

}


function graphic_on() {

    /*********************/
    // camera
    camera = new THREE.PerspectiveCamera( 65, $(view_container).width() / $(view_container).height(), 0.1, 2000 );
    camera.position.set( 0.7, 0.7 , 0.35  );
    camera.up.set(0,0,1);
    // Grid
    var grid = new THREE.GridHelper( 10, 10, 0x444444, 0x888888 );
    scene.add( grid );
    grid.matrixAutoUpdate = false
    grid.matrix.set(0.1   , 0     , 0     , 0 ,
                    0     , 0     , 0.1   , 0 ,
                    0     , 0.1   , 0     , 0 ,
                    0     , 0     , 0     , 1 );
 
    grid.matrixWorldNeedsUpdate = true;

    
    
    particleLight = new THREE.PointLight( 0x88abba, 0.2 );
    particleLight.position.set(0,10,0);

    scene.add( particleLight );

    var light = new THREE.AmbientLight( 0xb8b7ae ); // soft white light
     scene.add(light)


    renderer = new THREE.WebGLRenderer( { antialias : true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( $(view_container).width(), $(view_container).height() );
    renderer.setClearColor(0xffffff, 1);
    container.appendChild( renderer.domElement );



    //var cam =  camera;


    vr_camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 2000 );
    vr_camera.layers.enable( 1 ); // render left view when no stereo available

    webcamTexture_r.colorSpace = THREE.SRGBColorSpace;
    webcamTexture_l.colorSpace = THREE.SRGBColorSpace;

    vr_scene = new THREE.Scene();
    vr_scene.background = new THREE.Color( 0x101010 );


      //vr material 
       function vertexShader() {
                return `
                varying vec2 vUv;
                void main( void ) {     
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                }
            `
            }
            function fragmentShader() {
                return `
                varying vec2 vUv;
                uniform sampler2D map;
                void main() {
                    vec2 uv = vUv;
                    uv.x = mod(uv.x , 1.0);
                    float scale = 3.0;

                    uv = uv*scale - vec2(0.5*(scale-1.0));

                    if(uv.x<0.0||uv.x>1.0 || uv.y>1.0||uv.y<0.0){
                      gl_FragColor = vec4(0.0,0.0,0.0,1.0); 
                    }
                    else{
                      vec4 videoColor = texture2D(map, uv);
                      gl_FragColor = vec4(videoColor.rgb, videoColor.a); 
                    }
                }
            `
            }
            const vr_material_right = new THREE.ShaderMaterial({
                transparent: true,
                uniforms: {
                    map: { value: webcamTexture_r }
                },
                vertexShader: vertexShader(),
                fragmentShader: fragmentShader(),
            })
            const vr_material_left = new THREE.ShaderMaterial({
                transparent: true,
                uniforms: {
                    map: { value: webcamTexture_l }
                },
                vertexShader: vertexShader(),
                fragmentShader: fragmentShader(),
            })

        // left

        const vr_geometry1 = new THREE.SphereGeometry( 500, 60, 40 );
        // invert the geometry on the x-axis so that all of the faces point inward
        vr_geometry1.scale( - 1, 1, 1 );
        /*
        const vr_uvs1 = vr_geometry1.faceVertexUvs[0];

        for ( let i = 0; i < vr_uvs1.length; i += 2 ) {

          vr_uvs1[ i ] *= 0.5;

        }
*/
        //const vr_material1 = new THREE.MeshBasicMaterial( { map: webcamTexture } );

        const vr_mesh1 = new THREE.Mesh( vr_geometry1, vr_material_right );
        vr_mesh1.rotation.y = - Math.PI / 2;
        vr_mesh1.layers.set( 1 ); // display in left eye only
        //vr_scene.add( vr_mesh1 );
        vr_camera.add(vr_mesh1);
        // right

        const vr_geometry2 = new THREE.SphereGeometry( 500, 60, 40 );
        vr_geometry2.scale( - 1, 1, 1 );

/*
        const vr_uvs2 = vr_geometry2.faceVertexUvs[0];

        for ( let i = 0; i < vr_uvs2.length; i += 2 ) {

          vr_uvs2[ i ] *= 0.5;
          vr_uvs2[ i ] += 0.5;

        }
*/
        //const vr_material2 = new THREE.MeshBasicMaterial( /*{ map: texture }*/ );

        const vr_mesh2 = new THREE.Mesh( vr_geometry2, vr_material_left );
        vr_mesh2.rotation.y = - Math.PI / 2;
        vr_mesh2.layers.set( 2 ); // display in right eye only
        //vr_scene.add( vr_mesh2 );
        vr_camera.add(vr_mesh2);
        //
        const vr_container = document.getElementById( 'vr_container' );
        vr_renderer = new THREE.WebGLRenderer();
        vr_renderer.setPixelRatio( window.devicePixelRatio );
        vr_renderer.setSize( window.innerWidth, window.innerHeight );
        vr_renderer.xr.enabled = true;
        vr_renderer.xr.setReferenceSpaceType( 'local' );
        vr_container.appendChild( vr_renderer.domElement );

        vr_renderer.setAnimationLoop( vr_render );
        //

        //xr
        //renderer.xr.enabled = true;
        const vrdiv = document.getElementById("vrbutton");
        vrdiv.appendChild( VRButton.createButton( vr_renderer ) );


        vr_scene.add(vr_camera);




    // control camera
   // control_camera = new THREE.OrbitControls( camera, renderer.domElement );

    //control_camera.enableZoom    = true;
    //control_camera.enableKeys = false;



    // Axis
    ah = new THREE.AxesHelper(1);
    ah.matrixAutoUpdate = false

    ah.renderOrder = 999;
    ah.onBeforeRender = function( renderer ) { renderer.clearDepth(); };//draw Axis helper on top of other meshes
    scene.add( ah );
    ah.matrix.set(0.04  , 0.0   , 0     , 0 ,
                  0     , 0.04  , 0     , 0 ,
                  0     , 0     , 0.04  , 0 ,
                  0     , 0     , 0     , 1 );
 
    ah.matrixWorldNeedsUpdate = true;


    /*control sphere
    let sphere_geometry = new THREE.SphereGeometry( 0.025, 32, 16 ); 
    let sphere_material = new THREE.MeshStandardMaterial( { color: 0x3289bf } ); 
    let sphere = new THREE.Mesh( sphere_geometry, sphere_material ); 
    sphere.position.set(0.5,0,0)
    scene.add( sphere );
    control_sphere = new THREE.TransformControls( camera, renderer.domElement );
    control_sphere.attach( sphere );
    scene.add(control_sphere);

    control_sphere.addEventListener( 'dragging-changed', function ( event ) {
        control_camera.enabled = ! event.value;
      
    } );
    */

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


    vr_camera.aspect = window.innerWidth / window.innerHeight;
    vr_camera.updateProjectionMatrix();

    vr_renderer.setSize( window.innerWidth, window.innerHeight );

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
  if(graphic && false){
    joints = Object.values(position());
    xyz = Object.values(position("xyz"));
    set_frame(joints.concat(xyz));
    renderer.render( scene, camera );
    control_camera.update();
  }

}
function vr_render() {

  vr_renderer.render( vr_scene, vr_camera );
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







