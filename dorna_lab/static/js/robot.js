

/*
Useful Robot methodes: 

- set_control_mode(i). values: i=0 no control visible , i=1..3 , different control modes
- set_joints([j0,j1,j2,j3,j4,j5,j6])
- set_xyza(Vector3, a)
- set_visible(show) show=true unhide, show=false hide


*/

///
//d1 = 0.309664
//a1 = 0.100039
//a2 = 0.299983
//a3 = 0.2085
//d4 = -0.1331
//d5 = 0.091502
//d6 = x  ???
///

class Robot{

	control_head; control_head_rotate; control_j0; control_j1; control_j2; control_j3; control_j4; mesh_ball;

	initialized = false;

	constructor(rend, cam,scen,cam_ctr,opac,need_control){
		this.renderer = rend;
		this.camera = cam;
		this.scene = scen;
		
		this.control_camera = cam_ctr;
		this.position = new THREE.Vector3(0,0,0);
		this.abc = [0,90,90];
		this.euler = new THREE.Euler( 0, 0, 0, 'ZYX' );
		this.being_controlled = need_control;

		
		this.joints = [0,0,0,0,0,0,0];
		this.scale_factor = 1;

		this.p0 = new THREE.Vector3(0,0,0)//new THREE.Vector3(0.0,2.404464*this.scale_factor,9.475806*this.scale_factor);
		this.l2 = 2.02*this.scale_factor;
		this.l3 = 152.4*this.scale_factor;
		this.offset = {"x":0,"y":0,"z":0};
		this.l4 = 48.9245*this.scale_factor;
		this.scale_to_real = 1/this.scale_factor;


		this.head_pos = new THREE.Vector3(0,0,0);//this.joints_to_xyz([0,0,0,0,0,0]);
		//let ff = ;
        send_message({
	        "_server":"knmtc",
	        "func": "frw","joints":[0,0,0,0,0,0,0]
	        },true, true,function(res,v){
	        	v[0].x = res["result"][0]; v[1].x = res["result"][0]; 
	        	v[0].y=res["result"][1]; v[1].y=res["result"][1];
	        	v[0].z=res["result"][2]; v[1].z=res["result"][2];
	        	v[2][0] = res["result"][3];
	        	v[2][1] = res["result"][4];
	        	v[2][2] = res["result"][5];
	        },[this.head_pos,this.position,this.abc]);

		this.a = 0;
		this.knocle = 1;
		this.fixed_pos = new THREE.Vector3(0,0,0);

		this.control_mode = 1;
		this.opacity = opac;
		
		this.dither = false;
		this.visible = false;

		//headball
		this.loader_axis = new THREE.ColladaLoader()


		this.limits = {"nj0":-160 , "pj0":180, //nj0 got from -175 to -160
					   "nj1":-90 ,  "pj1":180,
					   "nj2":-142 , "pj2":142,
					   "nj3":-135 , "pj3":135,
					   "nj4":-10000 , "pj4":10000};

		this.Load(need_control);

		var loader = new THREE.CubeTextureLoader();
		loader.setPath( './static/assets/texture/' );

		this.textureCube = loader.load( [
			'px.png', 'nx.png',
			'py.png', 'ny.png',
			'pz.png', 'nz.png'
		] );

		this.normal_color = 0x1c1c1c;//0x323232;
		this.error_color = 0xeb3434;


		this.material = new THREE.MeshStandardMaterial({
			vertexColors: true,
			roughness: 0.3,
			//metalness : 0.6,
			envMap : this.textureCube,
			emissive : this.normal_color,
			side:THREE.DoubleSide
		});

		if(!this.being_controlled)
			this.new_mat()
		
		this.callback = $.Callbacks();
		
		//let init_pos = this.joints_to_xyz([0,0,0,0,0,0]);
		//this.position.set(init_pos.x,init_pos.y,init_pos.z);



	}

	a_get(){
		return this.abc[0];
	}

	Load(need_control){

		let robot = this;


		this.loader = [new THREE.ColladaLoader(),new THREE.ColladaLoader(),
						new THREE.ColladaLoader(),new THREE.ColladaLoader(),
						new THREE.ColladaLoader(),new THREE.ColladaLoader(),new THREE.ColladaLoader()];
		this.dae = new Array(8);
		robot.load_index = 0;

		this.loader[0].load("./static/assets/robot/base.dae" , function ( collada ) {robot.dae[0] = collada.scene; if(robot.load_index++>6)robot.load_level2();});
		this.loader[1].load("./static/assets/robot/arm1.dae" , function ( collada ) {robot.dae[1] = collada.scene; if(robot.load_index++>6)robot.load_level2();});
		this.loader[2].load("./static/assets/robot/arm2.dae" , function ( collada ) {robot.dae[2] = collada.scene; if(robot.load_index++>6)robot.load_level2();});
		this.loader[3].load("./static/assets/robot/arm3.dae" , function ( collada ) {robot.dae[3] = collada.scene; if(robot.load_index++>6)robot.load_level2();});
		this.loader[4].load("./static/assets/robot/arm4.dae" , function ( collada ) {robot.dae[4] = collada.scene; if(robot.load_index++>6)robot.load_level2();});
		this.loader[5].load("./static/assets/robot/arm5.dae" , function ( collada ) {robot.dae[5] = collada.scene; if(robot.load_index++>6)robot.load_level2();});
		this.loader[6].load("./static/assets/robot/arm6.dae" , function ( collada ) {robot.dae[6] = collada.scene; if(robot.load_index++>6)robot.load_level2();});

		
		this.loader_axis.load("./static/assets/robot/axis.dae" , function ( collada ) {
			robot.dae[7] = collada.scene; 
			//robot.dae[7].scale.set(0.1,0.1,0.1)
		    robot.mesh_ball = robot.dae[7];//sprite;
		    robot.mesh_ball.visible = false;
		    
		    robot.mesh_ball.position.set(0,0,0);
    		if(robot.being_controlled)	robot.create_head_control();
    		if(robot.load_index++>6)robot.load_level2();
		});
		

	}

	load_level2(){
		var robot = this;



		this.robot_scene= new THREE.Group();
		this.a1_g 		= new THREE.Group();
		this.a2_g 		= new THREE.Group();
		this.a3_g 		= new THREE.Group();
		this.a4_g 		= new THREE.Group();
		this.a5_g 		= new THREE.Group();
		this.a6_g 		= new THREE.Group();
		this.focus_point = new THREE.Object3D();	

		//this.a_help = new THREE.AxesHelper(this.scale_to_real/4);
	
	
		this.robot_scene.add(this.dae[0]);

		this.robot_scene.add(this.a1_g);
		this.a1_g.add(this.dae[1]);
		this.a1_g.add(this.a2_g);
		this.a2_g.add(this.dae[2]);
		this.a2_g.add(this.a3_g);
		this.a3_g.add(this.dae[3]);
		this.a3_g.add(this.a4_g);
		this.a4_g.add(this.dae[4]);
		this.a4_g.add(this.a5_g);
		this.a5_g.add(this.dae[5]);
		this.a5_g.add(this.a6_g);
		this.a6_g.add(this.dae[6])
		this.a4_g.add(this.focus_point);
		//this.a5_g.add(this.a_help);

		let i=0;
		for(i=0;i<8;i++){
			this.dae[i].traverse( function ( child ) {
		    	if ( child instanceof THREE.Mesh ) {
		    		child.material = robot.material;
		    		child.castShadow = true;
    				child.receiveShadow = true;
					if(robot.opacity<1){
			        	child.material.transparent = 1;
			        	child.material.opacity = robot.opacity;
		    	}
			    	if(!robot.being_controlled){
			    		child.material = robot.ditherMat;
			    		robot.dither = true;
			    	}
		    	}
		    });
		}

		this.robot_scene.scale.set(this.scale_factor , this.scale_factor , this.scale_factor);
		this.kinematic([0,0,0,0,0,0]);

		this.scene.add(this.mesh_ball);
		this.scene.add(this.robot_scene);//last thing to do
		if(this.being_controlled && false)
		    for(i=-1;i<6;i++){

			          var control_c = new THREE.TransformControls( camera, renderer.domElement );
			          if(i>-1)
			          	control_c.attach( this.dae[i+1].parent);
			          else
			          	control_c.attach( this.focus_point);

			          if(i==-1) robot.control_a = control_c;
			          if(i==4) robot.control_j4 = control_c;
			          if(i==3) robot.control_j3 = control_c;
			          if(i==2) robot.control_j2 = control_c;
			          if(i==1) robot.control_j1 = control_c;
			          if(i==0) robot.control_j0 = control_c;
			          /*
			          if(i!=4 && i!=0){//j1 and j2 and j3 rotate around local Y axis
			            control_c.showZ = false;
			            control_c.showY = false;
			          }
			          if(i==4){//j0  rotates around local z axis
			            control_c.showY = false;
			            control_c.showX = false;
			          }
			          if(i==0){//j4 rotates around local x axis
			            
			          }*/
			          control_c.showX = false;
			          control_c.showZ = false;

			          control_c.setSize(0.5);
			          control_c.setSpace("local" );
			          control_c.setMode( "rotate" );
			          this.scene.add( control_c );
			        if(i==0)control_c.addEventListener( 'dragging-changed', function ( event) {robot.control_camera.enabled = ! event.value; robot.hider(! event.value,0);  });
			        if(i==1)control_c.addEventListener( 'dragging-changed', function ( event) {robot.control_camera.enabled = ! event.value; robot.hider(! event.value,1);  });
			        if(i==2)control_c.addEventListener( 'dragging-changed', function ( event) {robot.control_camera.enabled = ! event.value; robot.hider(! event.value,2);  });
			        if(i==3)control_c.addEventListener( 'dragging-changed', function ( event) {robot.control_camera.enabled = ! event.value; robot.hider(! event.value,3);});
			          	//if(event.value && robot.control_mode==3 ){ robot.fixed_pos.set(robot.position.x,robot.position.y,robot.position.z);}  });
			        if(i==4)control_c.addEventListener( 'dragging-changed', function ( event) {robot.control_camera.enabled = ! event.value; robot.hider(! event.value,4);  });
			        if(i==-1)control_c.addEventListener( 'dragging-changed', function ( event) { robot.fixed_pos.set(robot.position.x,robot.position.y,robot.position.z);
			         robot.control_camera.enabled = ! event.value; robot.hider(! event.value,-1);  });

			        if(i==-1)control_c.addEventListener( 'objectChange', function ( event ) { robot.change(-1,this,false);} );
			        if(i==4)control_c.addEventListener( 'objectChange', function ( event ) { robot.change(4,this,false);} );
			        if(i==3)control_c.addEventListener( 'objectChange', function ( event ) { robot.change(3,this,false);} );//if(robot.control_mode==1) robot.change(3,this,false);if(robot.control_mode==3) robot.change(3,this,true);} );
			        if(i==2)control_c.addEventListener( 'objectChange', function ( event ) { robot.change(2,this,false);} );
			        if(i==1)control_c.addEventListener( 'objectChange', function ( event ) { robot.change(1,this,false);} );
			        if(i==0)control_c.addEventListener( 'objectChange', function ( event ) { robot.change(0,this,false);} );

		        
		        }
		//tool head line
		var material = new THREE.LineBasicMaterial({
			color: 0x0000ff
		});

		var points = [];
		points.push( new THREE.Vector3( 0, 0, 0 ) );
		points.push( new THREE.Vector3( 0, 0, 0 ) );

		var geometry = new THREE.BufferGeometry().setFromPoints( points );

		this.tool_head_line = new THREE.Line( geometry, material );
		this.a4_g.add( this.tool_head_line );


		//finalize
		this.robot_scene.rotateY(-Math.PI/2.0);
		robot.initialized = true;	
		if(this.being_controlled){	this.set_control_mode(0); this.set_visible(true);}
		this.set_joints([0,0,0,0,0,0])
	}

	kinematic(js){
		let a = Math.cos((js[0]-180)*Math.PI/180);
		let b = Math.sin((js[0]-180)*Math.PI/180);

		let c = Math.cos(js[1]*Math.PI/180);
		let d = Math.sin(js[1]*Math.PI/180);

		let e = Math.cos(js[2]*Math.PI/180);
		let f = Math.sin(js[2]*Math.PI/180);

		let g = Math.cos(js[3]*Math.PI/180);
		let h = Math.sin(js[3]*Math.PI/180);

		let i = Math.cos(-js[4]*Math.PI/180);
		let j = Math.sin(-js[4]*Math.PI/180);

		let k = Math.cos(js[5]*Math.PI/180);
		let l = Math.sin(js[5]*Math.PI/180);


		this.a1_g.matrixAutoUpdate  = false;
		this.a1_g.updateMatrix();
		this.a1_g.matrix.set(-a	,	0	,	-b	,	0,
							 0	,	1	,	0	,	0.309664,
							 b	,	0	,	-a	,	0,
							 0	,	0	,	0	,	1);


		this.a2_g.matrixAutoUpdate  = false;
		this.a2_g.updateMatrix();
		this.a2_g.matrix.set(c	,	-d	,	0	,	0.100039,
							 d	,	c	,	0	,	0,
							 0	,	0	,	1	,	0,
							 0	,	0	,	0	,	1);

		this.a3_g.matrixAutoUpdate  = false;
		this.a3_g.updateMatrix();
		this.a3_g.matrix.set(e	,	-f	,	0	,	0.299983,
							 f	,	e	,	0	,	0,
							 0	,	0	,	1	,	0,
							 0	,	0	,	0	,	1);

		this.a4_g.matrixAutoUpdate  = false;
		this.a4_g.updateMatrix();
		this.a4_g.matrix.set(g	,	-h	,	0	,	0.2085,
							 h	,	g	,	0	,	0,
							 0	,	0	,	1	,	-0.1331,
							 0	,	0	,	0	,	1);

		this.a5_g.matrixAutoUpdate  = false;
		this.a5_g.updateMatrix();
		this.a5_g.matrix.set(0	,	0	,	-1	,	0.091502,
							 -j	,	i	,	0	,	0,
							 -i	,	-j	,	0	,	0.0,
							 0	,	0	,	0	,	1);


		this.a6_g.matrixAutoUpdate  = false;
		this.a6_g.updateMatrix();
		this.a6_g.matrix.set(1	,	0	,	0	,	0.009,
							 0	,	-k	,	l	,	0,
							 0	,	l	,	k	,	0,
							 0	,	0	,	0	,	1);


		this.focus_point.matrixAutoUpdate  = false;
		this.focus_point.updateMatrix();
		this.focus_point.matrix.set(1	,	0	,	0	,	(this.l4 + this.offset.z)/this.scale_factor,
									0	,	1	,	0	,	0,
									0	,	0	,	1	,	0,
									0	,	0	,	0	,	1);

		/*this.a_help.matrixAutoUpdate = false
    	this.a_help.matrix.set(	1  ,0 ,0 ,0,
          						0  ,0 ,1 ,(this.l4 + this.tool_head_length)/this.scale_factor,
					          	0  ,-1,0 ,0,
					         	0  ,0 ,0 ,1);
   		this.a_help.matrixWorldNeedsUpdate = true;
		*/
		if(this.being_controlled){
			this.a1_g.quaternion.setFromRotationMatrix(this.a1_g.matrix);
			this.a2_g.quaternion.setFromRotationMatrix(this.a2_g.matrix);
			this.a3_g.quaternion.setFromRotationMatrix(this.a3_g.matrix);
			this.a4_g.quaternion.setFromRotationMatrix(this.a4_g.matrix);
			this.a5_g.quaternion.setFromRotationMatrix(this.a5_g.matrix);
			//this.a5_g.quaternion.y = this.a5_g.quaternion.y;

		}

	}

	create_head_control(){
		let robot = this;
		
	    this.control_head = new THREE.TransformControls( this.camera, this.renderer.domElement );
	    this.control_head_rotate = new THREE.TransformControls( this.camera, this.renderer.domElement );
	    this.control_head_rotate.setMode("rotate");
	    //this.control_head_rotate.setSpace("local");
	    this.control_head.attach( this.mesh_ball );
	    this.control_head_rotate.attach( this.mesh_ball );

	    //this.mesh_ball.rotateOnAxis ( new THREE.Vector3(Math.sqrt(1/3),Math.sqrt(1/3),Math.sqrt(1/3)), -Math.PI*2/3 )

	    //this.control_head.setSpace("local");
	    this.scene.add( this.control_head );
	    this.scene.add( this.control_head_rotate );

	    this.control_head.addEventListener( 'dragging-changed', function ( event ) {
	    	robot.control_camera.enabled = ! event.value;
	    	robot.hider(! event.value, 5);
	    } );
	    this.control_head_rotate.addEventListener( 'dragging-changed', function ( event ) {
	    	console.log("drag changed",event.value)
	    	robot.control_camera.enabled = ! event.value;
	    	robot.hider(! event.value, 6);
	    } );

	    this.control_head.addEventListener( 'objectChange', function ( event ) {
	    	robot.head_pos = robot.mesh_ball.position;
	    	robot.set_xyza(robot.head_pos,robot.abc);
    	} );
	   	this.control_head_rotate.addEventListener( 'objectChange', function ( event ) {
	    	robot.head_pos = robot.mesh_ball.position;
	    	robot.set_euler();
	    	robot.set_xyza(robot.head_pos,robot.abc);
    	} );
	}


	set_euler(){
		this.euler.setFromQuaternion (this.mesh_ball.quaternion,'YXZ') //transforms to 	ZYX

		this.abc[1] = this.euler.x * 180 / Math.PI; //1,2,0 //201 //
		this.abc[0] = this.euler.y * 180 / Math.PI;
		this.abc[2] = this.euler.z * 180 / Math.PI;



	}
	set_head_ball(){
 	 	this.mesh_ball.position.set(this.position.x,this.position.y,this.position.z);
  		this.mesh_ball.setRotationFromEuler(new THREE.Euler(this.abc[1]* Math.PI / 180,
  															this.abc[0] * Math.PI / 180,
  															this.abc[2] * Math.PI / 180,'YXZ'));
	}

	hider(show , i){
  		var j;
  		for(j = -1; j<7; j++){
    		this.hide_this_control(show,j);
  		}
  		this.hide_this_control(true,i);
	}

	hide_this_control(show, i){/*
	  if(i==-1){
	  	if(this.control_mode!=3)show = false;
	    this.control_a.showY = false; 
	    this.control_a.showX = false;
	    this.control_a.enabled = false;
	  }
	  if(i==0){
	    if(this.control_mode!=1)show = false;
	    this.control_j0.showY = show;//.showZ = show;
	    this.control_j0.enabled = show;
	  }
	  if(i==1){
	    if(this.control_mode!=1)show = false;
	    this.control_j1.showY = show;//.showX = show;
	    this.control_j1.enabled = show;
	  }
	  if(i==2){
	    if(this.control_mode!=1)show = false;

	    this.control_j2.showY = show;//.showX = show;
	    this.control_j2.enabled = show;
	  }
	  if(i==3){
	  	if(this.control_mode!=1 )show = false;
	    this.control_j3.showY = show;//showX = show;
	    this.control_j3.enabled = show;
	  }
	  if(i==4){
	    if(this.control_mode!=1)show = false;
	    this.control_j4.showY = show;
	    this.control_j4.enabled = show;
	  }*/
	  if(i==5){
	    if(this.control_mode!=2)show = false;

	    this.control_head.showX = show;
	    this.control_head.showY = show;
	    this.control_head.showZ = show;
	    this.control_head.enabled = show;
	  }
	  if(i==6){
	    if(this.control_mode!=2)show = false;

	    this.control_head_rotate.showX = show;
	    this.control_head_rotate.showY = show;
	    this.control_head_rotate.showZ = show;
	    this.control_head_rotate.enabled = show;
	  }
	}


	set_control_mode(mode){ 
	  this.control_mode = mode;
	  if(mode==0){
	    this.hide_this_control(false,-1);
	    this.hide_this_control(false,0);
	    this.hide_this_control(false,1);
	    this.hide_this_control(false,2);
	    this.hide_this_control(false,3);
	    this.hide_this_control(false,4);
	    this.hide_this_control(false,5);
	  }
	
	  if(mode==1){
	  	this.hide_this_control(false,-1);
	    this.hide_this_control(true,0);
	    this.hide_this_control(true,1);
	    this.hide_this_control(true,2);
	    this.hide_this_control(true,3);
	    this.hide_this_control(true,4);
	    this.hide_this_control(false,5);
	  }

	  if(mode==2){
	  	this.hide_this_control(false,-1);
	    this.hide_this_control(false,0);
	    this.hide_this_control(false,1);
	    this.hide_this_control(false,2);
	    this.hide_this_control(false,3);
	    this.hide_this_control(false,4);
	    this.hide_this_control(true,5);

	  }
	  if(mode==3){
	  	this.hide_this_control(true,-1);
	    this.hide_this_control(false,0);
	    this.hide_this_control(false,1);
	    this.hide_this_control(false,2);
	    this.hide_this_control(false,3);
	    this.hide_this_control(true,4);
	    this.hide_this_control(false,5);
	  }
	
	}
	set_joints(js){
		let joint = js;
		send_message({
	        "_server":"knmtc",
	        "func": "frw","joint":js
	        },true, true,function(res,v){
	        	let p = new THREE.Vector3(res["result"][0],res["result"][1],res["result"][2]);
	        	let abc = [res["result"][3],res["result"][4],res["result"][5]];
	        	//if(v[0].being_controlled)
	        		//console.log("final",abc)
	        	v[0].set_joints_p(v[1],p,abc);
	        },[this,joint]);
	}

	set_joints_p(js,new_pos,abc){

		this.joints = js;
		let i = 0;
		
		this.kinematic(this.joints);

		//this.a = this.joints[1] + this.joints[2] + this.joints[3];
		new_pos = this.real_to_xyz(new_pos)
		//let new_pos = this.joints_to_xyz(this.joints);
		this.position.set(new_pos.x,new_pos.y,new_pos.z);
		this.abc[0] = abc[0];
		this.abc[1] = abc[1];
		this.abc[2] = abc[2];

		this.set_head_ball();
		this.callback.fire(this.joints); 

		if(this.being_controlled){ 
			let work_space = this.check_work_space();
			if(work_space){
				this.material.emissive.setHex(this.normal_color);

				if(this.dither)
					this.ditherMat.uniforms.emissive.value.setHex(this.normal_color);
			}
			else{
				this.material.emissive.setHex(this.error_color);
				if(this.dither)
					this.ditherMat.uniforms.emissive.value.setHex(this.error_color);
			}
		}
		for(i=0;i<6;i++)
			this.joints[i] = Math.round(this.joints[i]*1000)/1000;
	}



	change(i,ctrl,fix_head){

		let a_lim = this.allowed_a();
		a_lim["pa"] = a_lim["pa"] - 0.5;
		a_lim["na"] = a_lim["na"] + 0.5;

		var old_joints = [this.joints[0],this.joints[1],this.joints[2],this.joints[3],this.joints[4],this.joints[5],this.joints[6]];
		if( i==0 ) this.joints[0] = 2 * Math.atan2( ctrl.object.quaternion.y , ctrl.object.quaternion.w ) * 180 / Math.PI; //+ 90;//z
		if( i==1 ) this.joints[1] = 2 * Math.atan2( ctrl.object.quaternion.y , ctrl.object.quaternion.w ) * 180 / Math.PI;//x
		if( i==2 ) this.joints[2] = 2 * Math.atan2( ctrl.object.quaternion.y , ctrl.object.quaternion.w ) * 180 / Math.PI;//x
		if( i==3 ) this.joints[3] = 2 * Math.atan2( ctrl.object.quaternion.y , ctrl.object.quaternion.w ) * 180 / Math.PI;//x
		if( i==4 ) this.joints[4] = range(2 * Math.atan2(ctrl.object.quaternion.y , ctrl.object.quaternion.w ) * 180 / Math.PI + 270);
		if( i==-1 ){
			this.joints[3] = 2 * Math.atan2(this.focus_point.quaternion.y ,this.focus_point.quaternion.w ) * 180 / Math.PI;
			fix_head = 1
		}

		this.a = (this.joints[1] + this.joints[2] + this.joints[3]);

		var cancel = false;

		if(fix_head){
			this.a = Math.min(Math.max(this.a , a_lim["na"]),a_lim["pa"]);
			this.set_xyza(this.fixed_pos,this.abc);
			//var new_pos = this.joints_to_xyz(this.joints);

			//if(Math.abs(new_pos.x-this.fixed_pos.x)>0.001 || Math.abs(new_pos.y-this.fixed_pos.y)>0.001 || Math.abs(new_pos.z-this.fixed_pos.z)>0.001){
			//	cancel = true;
			//} 
		}
		if(cancel){
			this.joints[0] = old_joints[0];
			this.joints[1] = old_joints[1];
			this.joints[2] = old_joints[2];
			this.joints[3] = old_joints[3];
			this.joints[4] = old_joints[4];
			this.joints[5] = old_joints[5];
			this.joints[6] = old_joints[6];
			this.a = (this.joints[1] + this.joints[2] + this.joints[3]);
		}
			this.set_joints(this.joints);
			//this.set_head_ball();

	}

	dj(j1,j2){
		return Math.pow(range(j1[0]-j2[0]),2) + Math.pow(range(j1[1]-j2[1]),2) + Math.pow(range(j1[2]-j2[2]),2) + Math.pow(range(j1[3]-j2[3]),2) + Math.pow(range(j1[4]-j2[4]),2) 
	}

	set_xyza(pos,abc,ret = null){
		//inverse here 

		var p = this.xyz_to_real(pos);
		//console.log(abc,pos)
		 send_message({
	        "_server":"knmtc",
	        "func": "inv","xyzabg":[p.x,p.y,p.z,abc[0],abc[1],abc[2]],"joint_current":this.joints,"all_sol":false
	        },true, true,function(res,v){
	        	//console.log(res["result"],v[0].joints)
	        	if(res["result"][0]){
	        		v[0].set_joints(res["result"][0]);
	        		if(v[1]){
	        			set_5(v[1],res["result"][0]);
	        		}
	        	}
	        	else{
	        		console.log("IK failed");
	        		v[0].set_joints(v[0].joints);
	        	}
	        },[this,ret]);
		/*
		if((this.joints[2] > 1 && this.joints[2] < 179 )|| this.joints[2] < -181){
			this.knocle = -1;
		}
		else 
			this.knocle = 1;

		var sol1 = this.xyza_to_joints(pos,a_value,this.joints[4], 1,this.knocle);
		var sol2 = this.xyza_to_joints(pos,a_value,this.joints[4],-1,this.knocle);

		var dd = 1;

		var best_sol;
		
		var l1 = this.dj(this.joints , sol1);
		var l2 = this.dj(this.joints , sol2);

		if(l1<l2){
			best_sol = sol1;
		}
		else
			best_sol = sol2;

		best_sol[4] = b_value;
		//this.joints = this.xyza_to_joints(pos,a_value);
		this.set_joints(best_sol);
		*/
	}

	check_interior(pos , a_value){
		let head_2d = new THREE.Vector2(Math.sqrt(pos.z*pos.z + pos.x*pos.x) - this.p0.z , pos.y - this.p0.y);	  
		head_2d.x = head_2d.x - (this.l4 + this.offset.z) * Math.cos(a_value*Math.PI/180);
		head_2d.y = head_2d.y - (this.l4 + this.offset.z) * Math.sin(a_value*Math.PI/180);
		let l = head_2d.length()
		if(l>this.l2 + this.l3 ||  l <this.l2 - this.l3){
			return false;
		}
		return true;
	}

	xyza_to_joints(pos , a_value , b , s = 1 , k = 1){

	  let head_2d = new THREE.Vector2( s * Math.sqrt(pos.z*pos.z + pos.x*pos.x) - this.p0.z , pos.y - this.p0.y);
	  return [0,0,0,0,0];
	  
	  head_2d.x = head_2d.x - (this.l4 + this.offset.z) *Math.cos(a_value*Math.PI/180);
	  head_2d.y = head_2d.y - (this.l4 + this.offset.z)*Math.sin(a_value*Math.PI/180);

	  head_2d.clampLength(this.l2 - this.l3,this.l2 + this.l3);

	  let j1 = range(Math.atan2(pos.x,pos.z)*180/Math.PI);
	  if(s == -1) j1 += 180;
	  let j2,j3;

	  //math stuff
	  let r2 = head_2d.x * head_2d.x + head_2d.y * head_2d.y;
	  let l22 = this.l2*this.l2;
	  let l32 = this.l3*this.l3;
	  let sqr = -l22*l22 -(r2-l32)*(r2-l32) + 2*l22*(l32+r2);
	  if(sqr<0)sqr = 0;
	//  if(sqr>=0){
		sqr = Math.sqrt(sqr);
		j2 =  Math.atan2(head_2d.y*(l22-l32+r2) + k*head_2d.x*sqr,
		  head_2d.x*(l22-l32+r2) - k*head_2d.y*sqr)*180/Math.PI;

		j3 =  Math.atan2(-k*sqr,-l22-l32+r2 )*180/Math.PI ;
		return [j1 , range(j2) , range(j3) , range(a_value - j2 - j3),b];
	 // }
	 // else{
	 // 	console.log(sqr);
	 //   return this.joints;
	 // }
	}

	joints_to_xyz(joints){
	  let result = new THREE.Vector3(1,1,1);
	  return result;
	
	}

	set_visible(show){
		if(this.visible != show){
			if(show){
				this.scene.add(this.robot_scene);
			}
			else{
				this.scene.remove(this.robot_scene);
			}
		}
		this.visible = show;
		if(!show)this.set_control_mode(0);
		//this.mesh_ball.visible = show;

	}

	xyz_to_real(v){
		let result = new THREE.Vector3(v.z,v.x,v.y);
		result.multiplyScalar(this.scale_to_real);
		return result;
	}
	real_to_xyz(v){
		let result = new THREE.Vector3(v.y,v.z,v.x);
		result.multiplyScalar(1/this.scale_to_real);
		return result;
	}
	allowed_xyza(){
		var info = {};
		let other_limits = 1000;
		info["nx"] = -other_limits;
		info["px"] = other_limits;
		info["ny"] = -other_limits;
		info["py"] = other_limits;
		info["nz"] = -other_limits;
		info["pz"] = other_limits;
		info["na"] = -other_limits;
		info["pa"] = other_limits;
		
		info["pb"] = other_limits;
		info["nb"] = -other_limits;
		info["pc"] = other_limits;
		info["nc"] = -other_limits;
		info["pd"] = other_limits;
		info["nd"] = -other_limits;

		return info;
		var N = 50;
		var info = {};
		
		var i;
		var v = this.position.clone();
		var a = 0;
		var last_l = 0;

		//+x
		for( i=0 ; i<N ; i++ ){
			let l = 0;
			if (Math.abs(v.z) < 0.001 )
				l = this.sdf_to_torus(v,true);
			else 
				l = this.sdf_to_torus(v,false);

			if(l<0.0001 && i==0 )l = 0.01;
			if(l<0){l = -last_l; v.x += l; break;}
			if(l<0.0001)break;
			v.x += l;
			a += l;
			last_l = l;
		}
		info["py"] = this.xyz_to_real(v).y;//a*this.scale_to_real;


		//-x  
		v.set(this.position.x , this.position.y , this.position.z);
		a = 0;
		last_l = 0;
		for( i=0 ; i<N ; i++ ){
			let l = 0;
			if (Math.abs(v.z) < 0.001 )
				l = this.sdf_to_torus(v,true);
			else 
				l = this.sdf_to_torus(v,false);

			if(l<0.0001 && i==0 )l = 0.01;
			if(l<0){l = -last_l; v.x += -l; break;}
			if(l<0.0001)break;
			v.x += -l;
			a += l;
			last_l = l;
		}
		info["ny"] = this.xyz_to_real(v).y;//a*this.scale_to_real;
		
		//+y
		v.set(this.position.x , this.position.y , this.position.z);
		a = 0;
		last_l = 0;
		for( i=0 ; i<N ; i++ ){
			let l = 0;
			if (Math.abs(v.z) < 0.001 || Math.abs(v.x) < 0.001 )
				l = this.sdf_to_torus(v,true);
			else 
				l = this.sdf_to_torus(v,false);

			if(l<0.0001 && i==0 )l = 0.01;
			if(l<0){l = -last_l; v.y += l; break;}
			if(l<0.0001)break;
			v.y += l;
			a += l;
			last_l = l;
		}
		
		info["pz"] = this.xyz_to_real(v).z;// a*this.scale_to_real;


		//-y
		v.set(this.position.x , this.position.y , this.position.z);
		a = 0;
		last_l = 0;
		for( i=0 ; i<N ; i++ ){
			let l = 0;
			if (Math.abs(v.z) < 0.001 || Math.abs(v.x) < 0.001 )
				l = this.sdf_to_torus(v,true);
			else 
				l = this.sdf_to_torus(v,false);

			if(l<0.0001 && i==0 )l = 0.01;
			if(l<0){l = -last_l; v.y += -l; break;}
			if(l<0.0001)break;
			v.y += -l;
			a += l;
			last_l = l;
		}
		info["nz"] = this.xyz_to_real(v).z;//a*this.scale_to_real;

		//+z
		v.set(this.position.x , this.position.y , this.position.z);
		a = 0;
		last_l = 0;
		for( i=0 ; i<N ; i++ ){
			let l = 0;
			if ( Math.abs(v.x) < 0.001)
				l = this.sdf_to_torus(v,true);
			else 
				l = this.sdf_to_torus(v,false);

			if(l<0.0001 && i==0 )l = 0.01;
			if(l<0){l = -last_l; v.z += l; break;}
			if(l<0.0001)break;
			v.z += l;
			a += l;
			last_l = l;
		}
		info["px"] = this.xyz_to_real(v).x//a*this.scale_to_real;

		//-z
		v.set(this.position.x , this.position.y , this.position.z);
		a = 0;
		last_l = 0;
		for( i=0 ; i<N ; i++ ){
			let l = 0;
			if (Math.abs(v.x) < 0.001)
				l = this.sdf_to_torus(v,true);
			else 
				l = this.sdf_to_torus(v,false);
			//console.log(l)
			if(l<0.0001 && i==0 )l = 0.01;	
			if(l<0){l = -last_l; v.z += -l; break;}
			if(l<0.0001)break;
			v.z += -l;
			a += l;
			last_l = l;
		}
		info["nx"] = this.xyz_to_real(v).x;

		let info_a = this.allowed_a();
		info["na"] = info_a["na"];
		info["pa"] = info_a["pa"]

		//b
		info["nb"] = this.limits["nj4"];
		info["pb"] = this.limits["pj4"];


		info["pc"] = other_limits;
		info["nc"] = -other_limits;
		info["pd"] = other_limits;
		info["nd"] = -other_limits;
		info["pe"] = other_limits;
		info["ne"] = -other_limits;



		return info;
	}
	allowed_a(){
		
		let info = {}
		let xx = this.position.x * Math.sin(this.joints[0]*Math.PI/180) + this.position.z * Math.cos(this.joints[0]*Math.PI/180)
		let pos2 = new THREE.Vector2(xx - this.p0.z , this.position.y - this.p0.y);
		let c = (Math.pow(this.l2 + this.l3 , 2)  - Math.pow(pos2.length(),2.0) -  Math.pow(this.l4 + this.offset.z , 2)) / (2 * (this.l4 + this.offset.z) * pos2.length());
		
		var r_a = this.a_get();

		info["na"] = -10000;
		info["pa"] =  10000;
		if( c>1 || c<-1 ){
			return info;
		}
		else{
			let t = Math.acos(c)*180/Math.PI;
			let t2 =  -t;
			let phi = Math.atan2(pos2.y , pos2.x)*180/Math.PI;
			t = t + phi - 180;
			t2 = t2 + phi - 180;

			let mid = 180 + phi;
			let a1 = t ;// - 180;
			let a2 = t2 ;//- 180;

			let a1s = [a1 - 3 * 360 , a1 - 2*360 , a1 - 360 , a1 , a1 + 360 , a1 + 2*360 , a1 + 3*360];
			let a2s = [a2 - 3 * 360 , a2 - 2*360 , a2 - 360 , a2 , a2 + 360 , a2 + 2*360 , a2 + 3*360];
			//let mids = [mid - 3 * 360 , mid - 2*360 , mid - 360 , mid , mid + 360 , mid + 2*360 , mid + 3*360];
			let i=0;

			for(i=0;i<7;i++){

				if(a1s[i]>info["na"] && a1s[i]<r_a){
					info["na"] = a1s[i];
				}
				if(a2s[i]>info["na"] && a2s[i]<r_a){
					info["na"] = a2s[i];
				}


				if(a1s[i]<info["pa"] && a1s[i]>r_a){
					info["pa"] = a1s[i];
				}
				if(a2s[i]<info["pa"] && a2s[i]>r_a){
					info["pa"] = a2s[i];
				}


			}


		}
		return info;
	}

	sdf_to_torus(pos , f){
		
		let xx = Math.sqrt(pos.x*pos.x + pos.z*pos.z);

		if(f){
			xx =  pos.x * Math.sin(this.joints[0]*Math.PI/180) + pos.z * Math.cos(this.joints[0]*Math.PI/180)
		}

		var pos2 = new THREE.Vector2(xx - this.p0.z , pos.y - this.p0.y);
		pos2.x = pos2.x - (this.l4 + this.offset.z)*Math.cos(this.a_get()*Math.PI/180);
		pos2.y = pos2.y - (this.l4 + this.offset.z)*Math.sin(this.a_get()*Math.PI/180);
		return this.l2 + this.l3 - pos2.length(); 
	}
	value(name){
		if(name=="j0"){ 
			return this.joints[0];
		}
		if(name=="j1"){
			return this.joints[1];
		}
		if(name=="j2"){
			return this.joints[2];
		}
		if(name=="j3"){
			return this.joints[3];
		}
		if(name=="j4"){
			return this.joints[4];
		}
		if(name=="x"){
			return this.position.z/this.scale_factor ;
		}
		if(name=="y"){
			return  this.position.x/this.scale_factor;
		}
		if(name=="z"){
			return this.position.y/this.scale_factor ;
		}
		if(name=="a"){
			return this.abc[0];
		}
		if(name=="b"){
			return this.abc[1];
		}
		if(name=="c"){
			return this.abc[2];
		}
		return 0;
	}

	allowed_j(){
		var info = {};
		let other_limits = 1000;
		info["nj0"] = -other_limits;
		info["pj0"] = other_limits;
		info["nj1"] = -other_limits;
		info["pj1"] = other_limits;
		info["nj2"] = -other_limits;
		info["pj2"] = other_limits;
		info["nj3"] = -other_limits;
		info["pj3"] = other_limits;
		info["nj4"] = -other_limits;
		info["pj4"] = other_limits;
		
		info["pj5"] = other_limits;
		info["nj5"] = -other_limits;
		info["pj6"] = other_limits;
		info["nj6"] = -other_limits;
		info["pj7"] = other_limits;
		info["nj7"] = -other_limits;

		return info;
		var joint = {"j0":this.joints[0] , "j1":this.joints[1] , "j2":this.joints[2] , "j3":this.joints[3] , "j4":this.joints[4] , "j5":this.joints[5]};
		var nb = { 
					"j1": [-40, -45, -50, -60, -70, -80, -90],
					"j2": [-142, -120, -100, -90, -80, -75, -70]
				};

		var pb = { 
					"j1": [120, 130, 140, 150, 160, 170, 180],
					"j2": [142, 110, 95, 85, 80, 75, 55]
				};

		var j2_limit_down = -180 ; var j2_limit_up = 180;
		var j1_limit_down = -90 ; var j1_limit_up = 180;

		var epsilon = 1.0;

		//j2 limits
		if (joint["j1"] <= 120 - epsilon && joint["j1"] >= -40 + epsilon ){
			j2_limit_down = -142;
			j2_limit_up = 142;
		}
		else{
			if(joint["j1"]>120){
				var i = 0
				while (pb["j1"][i] < joint["j1"])
					i += 1
				j2_limit_down = -142;
				if(i==0) 	j2_limit_up = this.limits["pj2"];
				else 		j2_limit_up = ((pb["j2"][i-1]- pb["j2"][i]) / (pb["j1"][i-1]- pb["j1"][i] )) * (joint["j1"]- pb["j1"][i] ) + pb["j2"][i] ;

			}
			else{
				var i = 0
				while (nb["j1"][i] > joint["j1"])
					i += 1
				if(i==0) 	j2_limit_down = this.limits["nj2"];
				else 		j2_limit_down = ((nb["j2"][i-1]- nb["j2"][i]) / (nb["j1"][i-1]- nb["j1"][i] )) * (joint["j1"]- nb["j1"][i] ) + nb["j2"][i]
				
				j2_limit_up = 142;
			}
		}

		//j1 up limits
		if(joint["j2"] < -142 - epsilon)
			j1_limit_up = 120;

		else{

			if(joint["j2"] < 55)
				j1_limit_up = 180;

			else{
				var i = 0
				while (pb["j2"][i] > joint["j2"])
					i += 1
				if(i==0)	j1_limit_up = this.limits["pj1"];
				else 		j1_limit_up = ((pb["j1"][i-1]- pb["j1"][i]) / (pb["j2"][i-1]- pb["j2"][i] ))* (joint["j2"]- pb["j2"][i] ) + pb["j1"][i]
			}
		} 

		//j1 down limits
		if(joint["j2"]>= 142 + epsilon) j1_limit_down = -40;
		else{
			if(joint["j2"]>=-70) j1_limit_down = -90;
			else{
				var i = 0;
				while (nb["j2"][i] < joint["j2"])
					i += 1
				if(i==0)	j1_limit_down = this.limits["nj1"];
				else 		j1_limit_down = ((nb["j1"][i-1]- nb["j1"][i]) / (nb["j2"][i-1]- nb["j2"][i] ))* (joint["j2"]- nb["j2"][i] ) + nb["j1"][i]
			}
		} 
		var info = JSON.parse(JSON.stringify(this.limits));

		info["nj1"] = j1_limit_down;
		info["pj1"] = j1_limit_up;
		info["nj2"] = j2_limit_down;
		info["pj2"] = j2_limit_up;

		info["pj5"] = other_limits;
		info["nj5"] = -other_limits;
		info["pj6"] = other_limits;
		info["nj6"] = -other_limits;
		info["pj7"] = other_limits;
		info["nj7"] = -other_limits;

		return info;

	}

	check_work_space(){
		return 1;
		var joint = {"j0":this.joints[0] , "j1":this.joints[1] , "j2":this.joints[2] , "j3":this.joints[3] , "j4":this.joints[4] , "j5":this.joints[5]};
		var nb = { 
					"j1": [-40, -45, -50, -60, -70, -80, -90],
					"j2": [-142, -120, -100, -90, -80, -75, -70]
				};

		var pb = { 
					"j1": [120, 130, 140, 150, 160, 170, 180],
					"j2": [142, 110, 95, 85, 80, 75, 55]
				};

		var j2_limit_down = -180 , j2_limit_up = 180;

		if (joint["j1"] <= 120 && joint["j1"] >= -40){
			j2_limit_down = -142;
			j2_limit_up = 142;
		}
		else{
			if(joint["j1"]>120){
				var i = 0
				while (pb["j1"][i] < joint["j1"])
					i += 1
				j2_limit_down = -142;
				if(i==0)	j2_limit_up = this.limits["pj2"];
				else 		j2_limit_up = ((pb["j2"][i-1]- pb["j2"][i]) / (pb["j1"][i-1]- pb["j1"][i] ))* (joint["j1"]- pb["j1"][i] ) + pb["j2"][i] ;

			}
			else{
				var i = 0
				while (nb["j1"][i] > joint["j1"])
					i += 1
				if(i==0)	j2_limit_down = this.limits["nj2"];
				else 		j2_limit_down = ((nb["j2"][i-1]- nb["j2"][i]) / (nb["j1"][i-1]- nb["j1"][i] ))* (joint["j1"]- nb["j1"][i] ) + nb["j2"][i]
				j2_limit_up = 142;
			}
		}

		if(this.joints[0]>this.limits["pj0"] || this.joints[0]<this.limits["nj0"]) return 0;
		if(this.joints[3]>this.limits["pj3"] || this.joints[3]<this.limits["nj3"]) return 0;

		if(joint["j2"]>j2_limit_down && joint["j2"]<j2_limit_up) return 1;

		return 0;

	}



	new_mat(){
		function createDitherTexture() {
			const data = new Float32Array( 16 );
			data[ 0 ] = 0.0 / 16.0;
			data[ 1 ] = 8.0 / 16.0;
			data[ 2 ] = 2.0 / 16.0;
			data[ 3 ] = 10.0 / 16.0;

			data[ 4 ] = 12.0 / 16.0;
			data[ 5 ] = 4.0 / 16.0;
			data[ 6 ] = 14.0 / 16.0;
			data[ 7 ] = 6.0 / 16.0;

			data[ 8 ] = 3.0 / 16.0;
			data[ 9 ] = 11.0 / 16.0;
			data[ 10 ] = 1.0 / 16.0;
			data[ 11 ] = 9.0 / 16.0;

			data[ 12 ] = 15.0 / 16.0;
			data[ 13 ] = 9.0 / 16.0;
			data[ 14 ] = 13.0 / 16.0;
			data[ 15 ] = 5.0 / 16.0;

			const ditherTex = new THREE.DataTexture( data, 4, 4, THREE.LuminanceFormat, THREE.FloatType );
			ditherTex.minFilter = THREE.NearestFilter;
			ditherTex.magFilter = THREE.NearestFilter;
			ditherTex.anisotropy = 1;
			ditherTex.wrapS = THREE.RepeatWrapping;
			ditherTex.wrapT = THREE.RepeatWrapping;

			ditherTex.needsUpdate = true;

			return ditherTex;

		}

		function cloneShader( shader, uniforms, defines ) {

			const newShader = Object.assign( {}, shader );
			newShader.uniforms = THREE.UniformsUtils.merge( [
				newShader.uniforms,
				uniforms
			] );
			newShader.defines = Object.assign( {}, defines );

			return newShader;

		}

		function DitheredTransparencyShaderMixin( shader ) {

			const defineKeyword = 'ENABLE_DITHER_TRANSPARENCY';
		 	const newShader = cloneShader(
		 		shader,
		 		{
		 			ditherTex: { value: null },
		 		},
		 		{
		 			[ defineKeyword ]: 1,
		 		}
			);

			newShader.fragmentShader = `
					float bayerDither2x2( vec2 v ) {
						return mod( 3.0 * v.y + 2.0 * v.x, 4.0 );
					}

					float bayerDither4x4( vec2 v ) {
						vec2 P1 = mod( v, 2.0 );
						vec2 P2 = mod( floor( 0.5  * v ), 2.0 );
						return 4.0 * bayerDither2x2( P1 ) + bayerDither2x2( P2 );
					}


					uniform sampler2D ditherTex;
					${newShader.fragmentShader}
			`.replace(
				/main\(\) {/,
				v => `
					${v}
					#if ${defineKeyword}
					//if( texture2D( ditherTex, gl_FragCoord.xy / 4.0 ).r > opacity ) discard;
					if( ( bayerDither4x4( floor( mod( gl_FragCoord.xy, 4.0 ) ) ) ) / 16.0 >= opacity ) discard;

					#endif
				`
			);

			return newShader;

		}
		this.ditherShader = DitheredTransparencyShaderMixin(THREE.ShaderLib.standard);

		this.ditherMat = new THREE.ShaderMaterial(this.ditherShader);
		this.ditherMat.side = THREE.DoubleSide;
		let ditherTex = createDitherTexture();

		this.ditherMat.uniforms.ditherTex.value = ditherTex;
		this.ditherMat.uniforms.opacity.value = 0.5;
		this.ditherMat.uniforms.roughness.value = 0.5;
		this.ditherMat.uniforms.metalness.value = 0.3;
		this.ditherMat.envMap = this.textureCube;
		this.ditherMat.uniforms.emissive.value.setHex(this.normal_color ) 

		this.ditherMat.lights = true
		this.ditherMat.vertexColors = true;

	}
	tool_head_length_set(x){
		this.offset.z = x * this.scale_factor;
		this.tool_head_line.geometry.attributes.position.array[0] = this.l4/this.scale_factor;
		this.tool_head_line.geometry.attributes.position.array[3] = x + this.l4/this.scale_factor;
		this.tool_head_line.geometry.attributes.position.needsUpdate = true; // required after the first render
		this.tool_head_line.geometry.computeBoundingSphere();
	}

}