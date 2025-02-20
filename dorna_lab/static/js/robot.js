

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

function clamp(x,a,b){
	return Math.max(Math.min(x,b),a);
}

var ik_busy = false;
class Robot{

	control_head; control_head_rotate_1; control_head_rotate_2;control_head_rotate_3; rotate_object_1; rotate_object_2; rotate_object_3;
	mesh_ball; axis_helper;rail_line_cylinder;
	control_j = new Array();
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
		this.rail_vec = new THREE.Vector3(1.0,0.0,0.0);
		this.rail_limit = [-1000,1000];
		
		this.joints = [0,0,0,0,0,0,0];
		this.scale_factor = 1;

		this.p0 = new THREE.Vector3(0,0,0)//new THREE.Vector3(0.0,2.404464*this.scale_factor,9.475806*this.scale_factor);
		this.l2 = 2.02*this.scale_factor;
		this.l3 = 152.4*this.scale_factor;
		this.offset = {"x":0,"y":0,"z":0};
		this.l4 = 48.9245*this.scale_factor;
		this.scale_to_real = 1/this.scale_factor;

		this.n_dof = 6;
		this.sum_delta = Math.PI/2.0;
		if(this.n_dof == 6) this.sum_delta = Math.PI;


		this.head_pos = new THREE.Vector3(0,0,0);//this.joints_to_xyz([0,0,0,0,0,0]);
		//let ff = ;
        send_message({
	        "_server":"knmtc",
	        "func": "frw","joints":[0,0,0,0,0,0]
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
		this.visible = true;
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
			roughness: 0.5,
			metalness : 0.3,
			envMap : this.textureCube,
			emissive : this.normal_color,
			side:THREE.DoubleSide
		});

		if(this.being_controlled) //look here if you want ghost
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
		this.robot_scene= new THREE.Group();
		this.world_g 	= new THREE.Group();
		this.rail_g 	= new THREE.Group();

		this.rotate_object_1 = new THREE.Object3D();

		this.world_g.add(this.rotate_object_1);


		this.loader = [new THREE.ColladaLoader(),new THREE.ColladaLoader(),
						new THREE.ColladaLoader(),new THREE.ColladaLoader(),
						new THREE.ColladaLoader(),new THREE.ColladaLoader(),new THREE.ColladaLoader()];
		this.dae = new Array(8);
		robot.load_index = 0;

		for(let i=0;i<7;i++){
			this.loader[i].load("./static/assets/robot/"+config_version["model"]+"-"+i+".dae" , function ( collada ) {
				robot.dae[i] = collada.scene; robot.dae[i].scale.set(1000,1000,1000); /*if(i==6)robot.dae[6].visible = false;*/if(robot.load_index++>6)robot.load_level2();});
		}
		
		this.loader_axis.load("./static/assets/robot/dorna_2s-6.dae" , function ( collada ) {
			robot.dae[7] = collada.scene; 
			//robot.dae[7].scale.set(0.1,0.1,0.1)
		    robot.mesh_ball = robot.dae[7];//sprite;
		    robot.mesh_ball.visible = false;


		    robot.set_head_controls_positions(new THREE.Vector3(0,0,0));

    		if(robot.being_controlled)	robot.create_head_control();
    		if(robot.load_index++>6)robot.load_level2();
		});
		

	}

	load_level2(){
		var robot = this;
		
		//axis-helper
		this.axis_helper = new THREE.AxesHelper(1);
		this.axis_helper.matrixAutoUpdate = false
		this.axis_helper.renderOrder = 999;
		this.axis_helper.matrix.set(  40,	0,	0,		0,
								      0,	40,	0,	0,
								      0,	0,		40,		0,
								      0,	0,		0,		1);

		this.axis_helper.matrixWorldNeedsUpdate = true;



		this.a_info 	= config_version["a"];
		this.d_info 	= config_version["d"];
		this.alpha_info = config_version["alpha"];
		this.delta_info = config_version["delta"];
		this.rail_vec.set(config_version["rail_vec"][0], config_version["rail_vec"][1], config_version["rail_vec"][2]);
		this.rail_limit = config_version["rail_limit"];
		this.p0 = new THREE.Vector3(0,config_version["d"][1],config_version["a"][2]);//new THREE.Vector3(0.0,2.404464*this.scale_factor,9.475806*this.scale_factor);
		this.l2 = config_version["a"][3];
		this.l3 = config_version["a"][4];
		this.l4 = config_version["d"][5];
		this.sum_delta = 0;
		for (let i=0;i<this.delta_info.length;i++){
			this.sum_delta += this.delta_info[i];
		}


		this.a0_g 		= new THREE.Group();
		this.a1_g 		= new THREE.Group();
		this.a2_g 		= new THREE.Group();
		this.a3_g 		= new THREE.Group();
		this.a4_g 		= new THREE.Group();
		this.a5_g 		= new THREE.Group();
		this.a6_g 		= new THREE.Group();
		this.a7_g 		= new THREE.Group();
		this.tcp 		= new THREE.Object3D();	

		let base_ah = new THREE.AxesHelper(1);
		base_ah.matrixAutoUpdate = false

		base_ah.renderOrder = 999;
		base_ah.onBeforeRender = function( renderer ) { renderer.clearDepth(); };//draw Axis helper on top of other meshes
		this.a0_g .add( base_ah );
		base_ah.matrix.set(40  , 0.0   , 0     , 0 ,
		              0     , 40  , 0     , 0 ,
		              0     , 0     , 40  , 0 ,
		              0     , 0     , 0     , 1 );

		base_ah.matrixWorldNeedsUpdate = true;




		for(let i=0;i<7;i++){
			//this.dae[i].scale.set(1,-1,1);
			//this.dae[i].rotateX(Math.PI/2.0);
		}
		this.robot_scene.add(this.world_g);
		this.world_g.add(this.rail_g);

		this.rail_g.add(this.a0_g);

		this.a0_g.add(this.dae[0]);
		this.a0_g.add(this.a1_g);
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
		this.a6_g.add(this.dae[6]);
		this.a6_g.add(this.a7_g);
		this.a7_g.add(this.tcp);

		this.tcp.add(this.axis_helper)
		//this.a5_g.add(this.a_help);

		let i=0;
		for(i=0;i<8;i++){
			this.dae[i].traverse( function ( child ) {
		    	if ( child instanceof THREE.Mesh ) {
		    		child.material = robot.material;
		    		//child.castShadow = true;
    				//child.receiveShadow = true;
					if(robot.opacity<1){
			        	//child.material.transparent = 0;
			        	//child.material.opacity = robot.opacity;
		    		}
			    	if(robot.being_controlled){ // look here if want to ghost
			    		child.material = robot.ditherMat;
			    		robot.dither = true;
			    	}
		    	}
		    });
		}

		this.robot_scene.scale.set(this.scale_factor , this.scale_factor , this.scale_factor);
		

		this.world_g.add(this.mesh_ball);

		//if(this.being_controlled)//remove to show original robot
		this.scene.add(this.robot_scene);//last thing to do

		if(this.being_controlled)
		    for(let i=0;i<6 ;i++){
				var control_c = new THREE.TransformControls( camera, renderer.domElement );
				control_c.attach( this.dae[i+1]);
				robot.control_j.push(control_c)

				control_c.setSize(1.0);
				control_c.setSpace("local" );
				control_c.setMode( "rotate" );

				this.world_g.add( control_c );

		        control_c.addEventListener( 'dragging-changed', function ( event) {robot.control_camera.enabled = ! event.value; robot.hider(! event.value,i);  });
				control_c.addEventListener( 'objectChange', function ( event ) { robot.change(i,this,false);} );

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


		this.update_kinematic_params()
		this.kinematic([0,0,0,0,0,0]);

		//finalize
		
		robot.initialized = true;	
		if(this.being_controlled){	this.set_control_mode(0); this.set_visible(false);}
		this.set_joints([0,0,0,0,0,0])

		if(!this.being_controlled){
			  tcp_setup_init();
		}
		
	}

	set_axis_z_length(ell){
		this.axis_helper.matrixAutoUpdate = false
		this.axis_helper.matrix.set(  40,	0,	0,		0,
								      0,	40,	0,	0,
								      0,	0,		ell,		0,
								      0,	0,		0,		1);

		this.axis_helper.matrixWorldNeedsUpdate = true;
	}

	update_kinematic_params(){
		this.a_info 	= config_version["a"];
		this.d_info 	= config_version["d"];
		this.alpha_info = config_version["alpha"];
		this.delta_info = config_version["delta"];
		this.rail_vec.set(config_version["rail_vec"][0], config_version["rail_vec"][1], config_version["rail_vec"][2]);
		this.rail_limit = config_version["rail_limit"];
		this.p0 = new THREE.Vector3(0,config_version["d"][1],config_version["a"][2]);//new THREE.Vector3(0.0,2.404464*this.scale_factor,9.475806*this.scale_factor);
		this.l2 = config_version["a"][3];
		this.l3 = config_version["a"][4];
		this.l4 = config_version["d"][5];
		this.sum_delta = 0;
		for (let i=0;i<this.delta_info.length;i++){
			this.sum_delta += this.delta_info[i];
		}


		if(this.rail_line_cylinder)
			this.rail_g.remove(this.rail_line_cylinder)

		let rail_line_geometry = new THREE.CylinderGeometry( 0.003, 0.003, (this.rail_limit[1]-this.rail_limit[0])*this.rail_vec.length()+0.01, 32 ); 

		let rail_line_material = new THREE.MeshBasicMaterial( {color: 0x51b844} ); 
		this.rail_line_cylinder = new THREE.Mesh( rail_line_geometry, rail_line_material );
		this.rail_line_cylinder.setRotationFromEuler (new THREE.Euler( 0, 0, 0, 'XYZ' ));
		this.rail_g.add(this.rail_line_cylinder );


		this.rail_line_cylinder.rotateZ(-Math.atan2(this.rail_vec.x,this.rail_vec.y));
		let l_1_position = this.rail_vec.clone().multiplyScalar((this.rail_limit[1]+this.rail_limit[0])/2.0);
		this.rail_line_cylinder.position.set(l_1_position.x,l_1_position.y,l_1_position.z);

		
		this.tcp.matrixAutoUpdate  = false;
		this.tcp.updateMatrix();
		this.tcp.matrix.set(config_version["tcp_mat"][0] ,config_version["tcp_mat"][1] ,config_version["tcp_mat"][2] ,config_version["tcp_mat"][3] ,
							config_version["tcp_mat"][4] ,config_version["tcp_mat"][5] ,config_version["tcp_mat"][6] ,config_version["tcp_mat"][7] ,
							config_version["tcp_mat"][8] ,config_version["tcp_mat"][9] ,config_version["tcp_mat"][10],config_version["tcp_mat"][11],
							config_version["tcp_mat"][12],config_version["tcp_mat"][13],config_version["tcp_mat"][14],config_version["tcp_mat"][15]);
		
		this.rail_g.matrixAutoUpdate  = false;
		this.rail_g.updateMatrix();
		this.rail_g.matrix.set(	config_version["rail_mat"][0] ,config_version["rail_mat"][1] ,config_version["rail_mat"][2] ,config_version["rail_mat"][3] ,
								config_version["rail_mat"][4] ,config_version["rail_mat"][5] ,config_version["rail_mat"][6] ,config_version["rail_mat"][7] ,
								config_version["rail_mat"][8] ,config_version["rail_mat"][9] ,config_version["rail_mat"][10],config_version["rail_mat"][11],
								config_version["rail_mat"][12],config_version["rail_mat"][13],config_version["rail_mat"][14],config_version["rail_mat"][15]);
		
		this.kinematic(this.joints);
		this.set_joints(this.joints)
	}

	kinematic(js){
		

		let clist = [this.a0_g, this.a1_g, this.a2_g,this.a3_g,this.a4_g,this.a5_g,this.a6_g,this.a7_g];

		let rail_displacement = new THREE.Vector3(this.rail_vec.x*js[5],this.rail_vec.y*js[5],this.rail_vec.z*js[5]);
		//rail_displacement.multiplyScalar(1/1000);


		clist[0].matrixAutoUpdate  = false;
		clist[0].updateMatrix();
		clist[0].matrix.set(1	,	0	,	0	,	rail_displacement.x,
							0	,	1	,	0	,	rail_displacement.y,
							0	,	0	,	1	,	rail_displacement.z,
							0	,	0	,	0	,	1);

		let joints = [0,js[0],js[1],js[2],js[3],js[4],js[5],js[6]]
		for(let i=1;i<config_version["n_dof"]+2;i++){
			let frame_idx = i - 1 ;
			let ct = Math.cos(joints[frame_idx]*Math.PI/180 + this.delta_info[frame_idx])
			let st = Math.sin(joints[frame_idx]*Math.PI/180 + this.delta_info[frame_idx])
			//if(i==1) st *= -1;
			let ca = Math.cos(this.alpha_info[frame_idx])
			let sa = Math.sin(this.alpha_info[frame_idx])

			let ai = this.a_info[frame_idx]
			let di = this.d_info[frame_idx] 

			clist[i].matrixAutoUpdate  = false;
			clist[i].updateMatrix();
			clist[i].matrix.set(ct,-st*ca,st*sa,ai*ct,
								st,ct*ca,-ct*sa,ai*st,
								0,	sa,	ca,	di,
								0, 0, 0, 1);

			//this.dae[i].rotation.z = js[frame_idx]*Math.PI/180;
			let rot_x_quat = new THREE.Quaternion();
			let rot_z_quat = new THREE.Quaternion();
			//rot_x_quat.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ),0*Math.PI / 2);
			rot_z_quat.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI /180 * joints[i]);
			//rot_x_quat.multiply(rot_z_quat)
			this.dae[i].setRotationFromQuaternion(rot_z_quat)
			//this.dae[i].updateMatrix();
			this.dae[i].matrixWorldNeedsUpdate = true;
		}		




		if(this.being_controlled){
			
			this.a1_g.quaternion.setFromRotationMatrix(this.a1_g.matrix);
			this.a2_g.quaternion.setFromRotationMatrix(this.a2_g.matrix);
			this.a3_g.quaternion.setFromRotationMatrix(this.a3_g.matrix);
			this.a4_g.quaternion.setFromRotationMatrix(this.a4_g.matrix);
			this.a5_g.quaternion.setFromRotationMatrix(this.a5_g.matrix);
			this.a6_g.quaternion.setFromRotationMatrix(this.a6_g.matrix);

			//this.dae[0].quaternion.setFromRotationMatrix(this.dae[0].matrix);
			//console.log(this.dae[0].quaternion)

			/*
			this.dae[1].quaternion.setFromRotationMatrix(this.dae[1].matrix);
			this.dae[2].quaternion.setFromRotationMatrix(this.dae[2].matrix);
			this.dae[3].quaternion.setFromRotationMatrix(this.dae[3].matrix);
			this.dae[4].quaternion.setFromRotationMatrix(this.dae[4].matrix);
			this.dae[5].quaternion.setFromRotationMatrix(this.dae[5].matrix);
			this.dae[6].quaternion.setFromRotationMatrix(this.dae[6].matrix);
			this.dae[7].quaternion.setFromRotationMatrix(this.dae[7].matrix);
			*/
			//this.a5_g.quaternion.y = this.a5_g.quaternion.y;

		}

	}
   
   xyzabc_to_matrix(xyzabc){
   	 	const norm = Math.sqrt(xyzabc[3]*xyzabc[3] + xyzabc[4]*xyzabc[4] + xyzabc[5]*xyzabc[5]);
	    const x = xyzabc[3] / norm;
	    const y = xyzabc[4] / norm;
	    const z = xyzabc[5] / norm;

	    if(norm<0.0001){
	    	return [1,0,0, xyzabc[0],
				0,1,0, xyzabc[1],
				0,0,1, xyzabc[2],
				0 ,0 ,0 , 1];
	    }

	    // Compute half the angle
	    const halfAngle = norm / 2 * Math.PI/180.0;

	    // Compute the quaternion components
	    const qw = Math.cos(halfAngle);
	    const sinHalfAngle = Math.sin(halfAngle);
	    const qx = x * sinHalfAngle;
	    const qy = y * sinHalfAngle;
	    const qz = z * sinHalfAngle;

		const qy2 = qy*qy
		const qz2 = qz*qz
		const qx2 = qx*qx
		return [1 - 2*qy2 - 2*qz2, 2*qx*qy - 2*qz*qw, 2*qx*qz + 2*qy*qw, xyzabc[0],
				2*qx*qy + 2*qz*qw, 1 - 2*qx2 - 2*qz2, 2*qy*qz - 2*qx*qw, xyzabc[1],
				2*qx*qz - 2*qy*qw, 2*qy*qz + 2*qx*qw, 1 - 2*qx2 - 2*qy2, xyzabc[2],
				0 ,0 ,0 , 1];
   }
   
   tcp_set(){
   		const tx = $(`.tcp_v[data-key=tx]`).prop("value");
   		const ty = $(`.tcp_v[data-key=ty]`).prop("value");
   		const tz = $(`.tcp_v[data-key=tz]`).prop("value");
   		const ta = $(`.tcp_v[data-key=ta]`).prop("value");
   		const tb = $(`.tcp_v[data-key=tb]`).prop("value");
   		const tc = $(`.tcp_v[data-key=tc]`).prop("value");

	   	
   		config_version["tcp_mat"] = this.xyzabc_to_matrix([tx,ty,tz,ta,tb,tc]);
		this.update_kinematic_params();

   }

	create_head_control(){
		let robot = this;
		
	    this.control_head = new THREE.TransformControls( this.camera, this.renderer.domElement );
	    this.control_head.attach( this.mesh_ball );
	    this.world_g.add( this.control_head );

	    this.control_head_rotate_1 = new THREE.TransformControls( this.camera, this.renderer.domElement );
	    this.control_head_rotate_1.setMode("rotate");
	    this.control_head_rotate_1.setSpace("global");
	    this.control_head_rotate_1.attach( this.rotate_object_1 );
	    this.world_g.add( this.control_head_rotate_1 );

	    this.control_head.addEventListener( 'dragging-changed', function ( event ) {
	    	robot.control_camera.enabled = ! event.value;
	    	robot.hider(! event.value, 6);
	    } );

	    this.control_head_rotate_1.addEventListener( 'dragging-changed', function ( event ) {
	    	robot.control_camera.enabled = ! event.value;
	    	robot.hider(! event.value, 7);
	    } );

	    this.control_head.addEventListener( 'objectChange', function ( event ) {
	    	robot.head_pos.set(robot.mesh_ball.position.x,robot.mesh_ball.position.y,robot.mesh_ball.position.z);
	    	robot.set_head_controls_positions(robot.position)
	    	//robot.set_euler();
	    	robot.set_xyza(robot.head_pos,robot.abc);
    	} );
	   	this.control_head_rotate_1.addEventListener( 'objectChange', function ( event ) {
	    	if(robot.control_head_rotate_1.enabled){
		    	robot.head_pos.set(robot.mesh_ball.position.x,robot.mesh_ball.position.y,robot.mesh_ball.position.z);
		    	robot.set_euler();
		    	robot.set_xyza(robot.head_pos,robot.abc);
    		}
    	} );
    	
	
	}

	set_head_controls_positions(v){
    	this.mesh_ball.position.set(v.x,v.y,v.z);
    	this.rotate_object_1.position.set(v.x,v.y,v.z);


	}
	get_abc_from_mat(mat){
		/*
		let m11 = mat.elements[0];
		let m12 = mat.elements[1];
		let m13 = mat.elements[2];

		let m21 = mat.elements[4];
		let m22 = mat.elements[5];
		let m23 = mat.elements[6];

		let m31 = mat.elements[8];
		let m32 = mat.elements[9];
		let m33 = mat.elements[10];

		let a=0;
		let b=0;
		let c=0;

		if(1.-Math.abs(m31)>0.0001){
			b = -Math.asin(m31);
			//b2 = Math.PI - a1;

			c = Math.atan2(m32/Math.cos(b) , m33/Math.cos(b));
			//c2 = Math.atan2(m32/Math.cos(b2) , m33/Math.cos(b2));

			a = Math.atan2(m21/Math.cos(b) , m11/Math.cos(b));
			//a2 = Math.atan2(m21/Math.cos(b2) , m11/Math.cos(b2));
		}
		else{
			a = 0;
			if(m31<0){
				b = Math.PI/2;
				c = a + Math.atan2(m12,m13);
			}
			else{
				b = -Math.PI/2;
				c = -a + Math.atan2(-m12,-m13);				
			}
		}
		return [a*180/Math.PI,b*180/Math.PI,c*180/Math.PI];
		*/
		let m00 = mat.elements[0];
		let m01 = mat.elements[1];
		let m02 = mat.elements[2];

		let m10 = mat.elements[4];
		let m11 = mat.elements[5];
		let m12 = mat.elements[6];

		let m20 = mat.elements[8];
		let m21 = mat.elements[9];
		let m22 = mat.elements[10];

		let trace = m00 + 	m11 +	m22;

		let theta = Math.acos(clamp((trace - 1.) / 2.,-1.,1.) );
		let st = Math.sin(theta);
		let ct = Math.cos(theta);
		
		theta *= 180/Math.PI;

		let u = [0,0,0]

		if (theta < 0.0000001)
			return u;
		
		if (180 - theta > 0.0001){
			u[2] = (m10 - m01) / st /2.
			u[1] = (m02 - m20) / st / 2.
			u[0] = (m21 - m12) / st / 2.
		}
		else{
			theta = 180;
			u[0] = Math.sqrt((m00+ 1.) / 2.);
			u[1] = Math.sqrt((m11+ 1.) / 2.);
			u[2] = Math.sqrt((m22+ 1.) / 2.);

			let c1 = m10;
			let c2 = m20;

			if (c1 < 0.){
				u[1] = -u[1]
			}
			
			if (c2 < 0.){
				u[2] = -u[2]
			}
		}


		return [u[0] * theta, u[1] * theta, u[2] * theta];
	}
	get_mat_from_abc(abc){
		let m = this.xyzabc_to_matrix([0,0,0,abc[0],abc[1],abc[2]]);
		let mat =  new THREE.Matrix4();
		mat.set(m[0],m[1],m[2],m[3],
			m[4],m[5],m[6],m[7],
			m[8],m[9],m[10],m[11]
                ,0,0,0,1);
		mat.transpose();

		return mat;	
		/*
		let c1 = Math.cos(abc[0]/ 180 * Math.PI);
		let s1 = Math.sin(abc[0]/ 180 * Math.PI);

		let c2 = Math.cos(abc[1]/ 180 * Math.PI);
		let s2 = Math.sin(abc[1]/ 180 * Math.PI);

		let c3 = Math.cos(abc[2]/ 180 * Math.PI);
		let s3 = Math.sin(abc[2]/ 180 * Math.PI);

		let mat =  new THREE.Matrix4();

		mat.set(c2*c1 , s3*s2*c1 - c3*s1 , c3*s2*c1 + s3*s1 , 0,
                c2*s1 , s3*s2*s1 + c3*c1 , c3*s2*s1 - s3*c1 , 0,
                -s2 , s3*c2 , c3*c2,0
                ,0,0,0,1);
		mat.transpose();

		return mat;	
		*/
	}
	set_euler(){
		//this.euler.setFromQuaternion (this.mesh_ball.quaternion,'YXZ') //transforms to 	ZYX
		this.mesh_ball.updateMatrix ()
		this.rotate_object_1.updateMatrix ()
		let abc_result_1 = this.get_abc_from_mat(this.rotate_object_1.matrix);

		this.abc[0] = abc_result_1[0];
		this.abc[1] = abc_result_1[1];
		this.abc[2] = abc_result_1[2];
	}
	set_head_ball(){
 	 	this.set_head_controls_positions(this.position);
 	 	let mat_1 = this.get_mat_from_abc(this.abc);
  		//this.mesh_ball.setRotationFromMatrix(mat);
  		this.rotate_object_1.setRotationFromMatrix(mat_1);
	}


	hider(show , i){
  		var j;
  		for(j = 0; j<10; j++){
    		this.hide_this_control(show,j);
  		}
  		this.hide_this_control(true,i);
	}

	hide_this_control(show, i){
	  if(i<6){
	    if(this.control_mode!=1)show = false;

    	this.control_j[i].showX = false;
	    this.control_j[i].showY = false;
	    this.control_j[i].showZ = show;
	    this.control_j[i].enabled = show;
	  }
	  if(i==6){
	    if(this.control_mode!=2)show = false;

	    this.control_head.showX = show;
	    this.control_head.showY = show;
	    this.control_head.showZ = show;
	    this.control_head.enabled = show;
	  }
	  if(i==7){
	    if(this.control_mode!=3)show = false;

	    this.control_head_rotate_1.showX = show;
	    this.control_head_rotate_1.showY = show;
	    this.control_head_rotate_1.showZ = show;
	    this.control_head_rotate_1.enabled = show;
	  }

	}


	set_control_mode(mode){ 
	  this.control_mode = mode;
	  if(mode==0){
	    this.hide_this_control(false,0);
	    this.hide_this_control(false,1);
	    this.hide_this_control(false,2);
	    this.hide_this_control(false,3);
	    this.hide_this_control(false,4);
	    this.hide_this_control(false,5);
	    this.hide_this_control(false,6);
	    this.hide_this_control(false,7);

	  }
	
	  if(mode==1){
	    this.hide_this_control(true,0);
	    this.hide_this_control(true,1);
	    this.hide_this_control(true,2);
	    this.hide_this_control(true,3);
	    this.hide_this_control(true,4);
	    this.hide_this_control(true,5);
	    this.hide_this_control(false,6);
	    this.hide_this_control(false,7);

	  }

	  if(mode==2){
	    this.hide_this_control(false,0);
	    this.hide_this_control(false,1);
	    this.hide_this_control(false,2);
	    this.hide_this_control(false,3);
	    this.hide_this_control(false,4);
	    this.hide_this_control(false,5);
	    this.hide_this_control(true,6);
	    this.hide_this_control(false,7);


	  }
	  	if(mode==3){
	    this.hide_this_control(false,0);
	    this.hide_this_control(false,1);
	    this.hide_this_control(false,2);
	    this.hide_this_control(false,3);
	    this.hide_this_control(false,4);
	    this.hide_this_control(false,5);
	    this.hide_this_control(false,6);
	    this.hide_this_control(true,7);


	  }
	
	}
	set_joints(js){
		let joint = js;
		this.set_lock = false;
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

		set_5(this.joints , js);
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
		this.callback.fire(this.joints, new_pos, this.abc); 

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

	set_joints_and_position(values){

		this.joints = values.slice(0,8);
		let i = 0;
		
		this.kinematic(this.joints);

		let new_pos = this.real_to_xyz(new THREE.Vector3(values[8],values[9],values[10]))
		//let new_pos = this.joints_to_xyz(this.joints);
		this.position.set(new_pos.x,new_pos.y,new_pos.z);
		this.abc[0] = values[11];
		this.abc[1] = values[12];
		this.abc[2] = values[13];

		this.set_head_ball();
		this.callback.fire(this.joints, new_pos, this.abc); 
	}


	change(i,ctrl,fix_head){

		var old_joints = [this.joints[0],this.joints[1],this.joints[2],this.joints[3],this.joints[4],this.joints[5],this.joints[6]];

		if( i==0 ) this.joints[0] =  2 * Math.atan2( ctrl.object.quaternion.z , ctrl.object.quaternion.w ) * 180 / Math.PI; 
		if( i==1 ) this.joints[1] =  2 * Math.atan2( ctrl.object.quaternion.z , ctrl.object.quaternion.w ) * 180 / Math.PI;
		if( i==2 ) this.joints[2] =  2 * Math.atan2( ctrl.object.quaternion.z , ctrl.object.quaternion.w ) * 180 / Math.PI;
		if( i==3 ) this.joints[3] =  2 * Math.atan2( ctrl.object.quaternion.z , ctrl.object.quaternion.w ) * 180 / Math.PI;
		if( i==4 ) this.joints[4] =  2 * Math.atan2( ctrl.object.quaternion.z , ctrl.object.quaternion.w ) * 180 / Math.PI;
		if( i==5 ) this.joints[5] =  2 * Math.atan2( ctrl.object.quaternion.z , ctrl.object.quaternion.w ) * 180 / Math.PI;

		this.set_joints(this.joints);

	}

	dj(j1,j2){
		return Math.pow(range(j1[0]-j2[0]),2) + Math.pow(range(j1[1]-j2[1]),2) + Math.pow(range(j1[2]-j2[2]),2) + Math.pow(range(j1[3]-j2[3]),2) + Math.pow(range(j1[4]-j2[4]),2) 
	}

	set_xyza(pos,abc,ret = null){
		//inverse here 
		//console.log(abc)
		if(ik_busy)
			return
		ik_busy=true;
		//abc[2] = Math.atan2(pos.y,pos.x)/Math.PI*180
		var p = this.xyz_to_real(pos);
		 send_message({
	        "_server":"knmtc",
	        "func": "inv","xyzabg":[p.x,p.y,p.z,abc[0],abc[1],abc[2]],"joint_current":this.joints,"all_sol":false
	        },true, true,function(res,v){
	        	ik_busy = false;

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

	}

	IK(pos,abc,ret){
		//inverse here 
		//abc[2] = Math.atan2(pos.y,pos.x)/Math.PI*180
		var p = this.xyz_to_real(pos);
		 send_message({
	        "_server":"knmtc",
	        "func": "inv","xyzabg":[p.x,p.y,p.z,abc[0],abc[1],abc[2]],"joint_current":null,"all_sol":false
	        },true, true,function(res,v){
	        	if(res["result"][0]){
        			set_5(v[0],res["result"][0]);

	        	}
	        	else{
	        		console.log("IK failed");
	        	}
	        },[ret]);

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
		let result = v.clone();//new THREE.Vector3(v.z,v.x,v.y);
		//result.multiplyScalar(1000);
		return result;
	}
	real_to_xyz(v){
		let result =  v.clone();// new THREE.Vector3(v.y,v.z,v.x);
		//result.multiplyScalar(1/1000);
		return result;
	}
	allowed_xyza(){
		var info = {};
		let other_limits = 1000*1000;
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

		var N = 100;
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
		info["px"] = this.xyz_to_real(v).x;//a*this.scale_to_real;


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
		info["nx"] = this.xyz_to_real(v).x;//a*this.scale_to_real;
		
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
		
		info["py"] = this.xyz_to_real(v).y;


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
		info["ny"] = this.xyz_to_real(v).y;

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
		info["pz"] = this.xyz_to_real(v).z;

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
		info["nz"] = this.xyz_to_real(v).z;

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
		
		let xx = Math.sqrt(pos.x*pos.x + pos.y*pos.y);

		if(f){
			xx =  pos.x * Math.sin(this.joints[0]*Math.PI/180) + pos.y * Math.cos(this.joints[0]*Math.PI/180)
		}

		var pos2 = new THREE.Vector2(xx - this.p0.z , pos.z - this.p0.y);
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
		if(name=="j5" || name=="c"){
			return this.joints[5];
		}
		if(name=="j6"|| name=="d"){
			return this.joints[6];
		}
		if(name=="j7"|| name=="e"){
			return this.joints[7];
		}
		let real_pos = this.xyz_to_real(this.position);
		if(name=="x"){
			return real_pos.x ;
		}
		if(name=="y"){
			return  real_pos.y;
		}
		if(name=="z"){
			return real_pos.z ;
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
		var info = {
			"nj0": -180,
			"pj0": 160,
			"nj1": -75,
			"pj1": 200,
			"nj2": -156,
			"pj2": 156,
			"nj3": -161,
			"pj3": 180,
			"nj4": -180,
			"pj4": 160,
			"nj5": -175,
			"pj5": 175,
			"nj6": -1000000,
			"pj6": 1000000,
			"nj7": -1000000,
			"pj7": 1000000,
		};
		let other_limits = 1000;
/*

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
				if(i==0 || i>6) 	j2_limit_up = this.limits["pj2"];
				else 		j2_limit_up = ((pb["j2"][i-1]- pb["j2"][i]) / (pb["j1"][i-1]- pb["j1"][i] )) * (joint["j1"]- pb["j1"][i] ) + pb["j2"][i] ;

			}
			else{
				var i = 0
				while (nb["j1"][i] > joint["j1"])
					i += 1
				if(i==0|| i>6) 	j2_limit_down = this.limits["nj2"];
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
				if(i==0|| i>6)	j1_limit_up = this.limits["pj1"];
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
				if(i==0|| i>6)	j1_limit_down = this.limits["nj1"];
				else 		j1_limit_down = ((nb["j1"][i-1]- nb["j1"][i]) / (nb["j2"][i-1]- nb["j2"][i] ))* (joint["j2"]- nb["j2"][i] ) + nb["j1"][i]
			}
		} 
		var info = JSON.parse(JSON.stringify(this.limits));

		info["nj1"] = j1_limit_down;
		info["pj1"] = j1_limit_up;
		info["nj2"] = j2_limit_down;
		info["pj2"] = j2_limit_up;

		info["pj5"] = other_limits*1000;
		info["nj5"] = -other_limits*1000;
		info["pj6"] = other_limits*1000;
		info["nj6"] = -other_limits*1000;
		info["pj7"] = other_limits*1000;
		info["nj7"] = -other_limits*1000;
*/
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
		this.offset.z = x * this.scale_factor / 1000;
		config_version["tcp_mat"][11] = x;
		set_kinematic_params({"tcp_mat":config_version["tcp_mat"]});
		//this.update_kinematic_params();
		this.tool_head_line.geometry.attributes.position.array[0] = this.l4/this.scale_factor;
		this.tool_head_line.geometry.attributes.position.array[3] = x/ 1000 + this.l4/this.scale_factor;
		this.tool_head_line.geometry.attributes.position.needsUpdate = true; // required after the first render
		this.tool_head_line.geometry.computeBoundingSphere();
	}

}

function set_kinematic_params(cmd){
	send_message({
    "_server":"knmtc_params",
    "prm": [JSON.stringify(cmd)] 
    });
}