class Trail{
	positions;
	material;
	line1;
	line2;
	constructor(color_hex,robot,max_points,dt,scene,width =2 ){
		this.visible = true;
		this.color =  color_hex;
		this.robot = robot;
		this.max_points = max_points;
		this.clock = new THREE.Clock(true);
		this.clock.start();
		this.old_time = 0;
		this.dt = dt;
		this.on = true;

		this.scene = scene;

		let trail = this;
		
		function robot_report(position){
			if(trail.clock.getElapsedTime ()  - trail.old_time > trail.dt){
				trail.old_time = trail.clock.getElapsedTime ();
				if(trail.on) trail.update();
			}
				
		}

		this.robot.callback.add(robot_report);

		var resolution = new THREE.Vector2($(view_container).width(), $(view_container).height() );

		this.trail_geometry = new THREE.Geometry();

		var init_pos = this.robot.joints_to_xyz([0,0,0,0,0,0]);

		for (var i = 0; i < max_points; i++) {
			// must initialize it to the number of positions it will keep or it will throw an error
			this.trail_geometry.vertices.push(init_pos.clone());
		}

		// Create the line mesh
		this.trail_line = new MeshLine();
		this.trail_line.setGeometry( this.trail_geometry,  function( p ) { return Math.min(width/max_points,p*50/max_points*width); }  ); // makes width taper

		// Create the line material
		this.trail_material = new MeshLineMaterial( {
			color: new THREE.Color( color_hex ),
			opacity: 1,
			resolution: resolution,
			sizeAttenuation: 1,
			lineWidth: 1.0,
			near: 1,
			far: 100000,
			depthTest: true,
			//blending: THREE.AdditiveBlending,
			transparent: false,
			side: THREE.DoubleSide
		});

		this.trail_mesh = new THREE.Mesh( this.trail_line.geometry, this.trail_material ); // this syntax could definitely be improved!
		this.trail_mesh.frustumCulled = false;

		scene.add( this.trail_mesh );

		this.trail_initialized = true;

		
	}

	update(){

		this.trail_line.advance( this.robot.position );
		
	}
	set_visible(show){
		if(this.visible&& (!show)){
			this.scene.remove(this.trail_mesh);
			this.visible = false;
		}
		else
		if((!this.visible)&& show){
			this.scene.add(this.trail_mesh);
			this.visible = true;
		}

	}
	
}