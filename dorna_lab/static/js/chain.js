var to_fixed_val = 1;
function range(x){
	let y=x;
	if(x<=-180)	y = x+360;
	if(x>=180)	y = x -360;
	return y;
}
function tripleDigit(x){
	return Math.floor(x*1000)/1000;
}
function tripleDigit_vector(v){
	v.x = tripleDigit(v.x);
	v.y = tripleDigit(v.y);
	v.z = tripleDigit(v.z);
	return 1;
}
function set_5(a,b){
	for(i=0;i<5;i++){
		a[i]=b[i];
	}
}

class move_cmd{

	save_cmd;
	curve;
	curve_positions;
	constructor(j_values, parent_chain,arrow,before,move_type){
		this.prm = {};

		this.joint = [j_values[0], j_values[1], j_values[2], j_values[3], j_values[4], j_values[5], j_values[6], j_values[7]];
		this.joint_save = [j_values[0], j_values[1], j_values[2], j_values[3], j_values[4], j_values[5], j_values[6], j_values[7]];

		this.position = new THREE.Vector3(0,0,0);
		this.position_save = new THREE.Vector3(0,0,0);
		this.position_save_needs_update = true;


		this.after = null;

		this.n_points = 1;

		this.move_type = move_type;
		this.parent_chain = parent_chain;
		this.lock = false;
		this.arrow_ready = false;

		if(this.parent_chain.first==null){
			this.sprite = new THREE.Sprite( this.parent_chain.spriteMaterial0 );
		}
		else{
			this.sprite = new THREE.Sprite( this.parent_chain.spriteMaterial1 );
		}
		this.sprite.father = this;

		this.sprite.scale.x = this.sprite.scale.y = this.sprite.scale.z = 0.05; 
		this.sprite.name = "sprite";
		this.parent_chain.scene.add( this.sprite );
		this.update_sprite_pos();
		this.arrow = arrow;
		this.before = before;
		this.left_on = false;
		this.right_on = false;

		this.dummy = 0;
		this.master = null;

		this.color_a_abs = new THREE.Color(0x210e0e);

		this.ARC_SEGMENTS = 20;
		this.test_point = new THREE.Vector3();

		this.removed = false;

		this.id = "-1";

		this.save();

		if(this.arrow){

			this.curve_positions = [new THREE.Vector3( 0, 0, 0 ),
				new THREE.Vector3( 0, 0 ,0 ), new THREE.Vector3( 0, 0 ,0 ), new THREE.Vector3( 0, 0 ,0 ),
				new THREE.Vector3( 0, 0, 0 )];
			var geometry = new THREE.BufferGeometry();
			geometry.setDrawRange( 0 , this.ARC_SEGMENTS );
			geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( this.ARC_SEGMENTS * 3 ), 3 ) );
			this.curve = new THREE.CatmullRomCurve3( this.curve_positions,false,'centripetal');
			//this.curve.tension = 0.2;
			this.curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineDashedMaterial( { color: 0x4d0005, dashSize: 0.05, gapSize: 0.025 }));// 0xffff00 new THREE.LineBasicMaterial( {color: 0xd4d498,linewidth : 5} ) );

			this.curve_positions_save = [new THREE.Vector3( 0, 0, 0 ),
				new THREE.Vector3( 0, 0 ,0 ),new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 0 ),
				new THREE.Vector3( 0, 0, 0 )];
			var geometry_save = new THREE.BufferGeometry();
			geometry_save.setDrawRange( 0 , this.ARC_SEGMENTS );
			geometry_save.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( this.ARC_SEGMENTS * 3 ), 3 ) );
			this.curve_save = new THREE.CatmullRomCurve3( this.curve_positions_save,false,'centripetal');
			//this.curve.tension = 0.2;
			this.curve_save.mesh = new THREE.Line( geometry_save.clone(), new THREE.LineBasicMaterial( {color: 0x4d0005} ) );


			this.parent_chain.scene.add(this.curve.mesh);
			this.parent_chain.scene.add(this.curve_save.mesh);

			this.curve_save_needs_update = true;

			this.arrow_ready = true;


			this.update_arrow();
		}
		this.update_visuals();
	}

	update_visuals(){
		this.update_sprite_pos();

		//console.log(this.sprite.material);
		//if(this.dummy==1)this.sprite.material.color.set( 0x000000 );
		
		if(this.master!=null)this.master.update_visuals();

		if(this.arrow&&this.arrow_ready){
			this.update_arrow();
		}
		if(!(this.after==null)){
			this.after.update_arrow();
			if(this.after.dummy==1)this.after.master.update_visuals();
		}
		
	}
	a(){
		return this.joint[1]+this.joint[2]+this.joint[3];
	}
	update_sprite_pos(){
		var j_pos = this.position;
		this.sprite.position.set(j_pos.x,j_pos.y,j_pos.z);
		this.position.set(j_pos.x,j_pos.y,j_pos.z);

		if(this.position_save_needs_update){
			this.position_save.set(j_pos.x,j_pos.y,j_pos.z);
			let k=0;
			for(k=0;k<5+ND_count;k++)if(k<5||ND[k]){this.joint_save[k] = this.joint[k];}
			this.position_save_needs_update = false;
		}
		let i=0;
		if(this.move_type==1)for(i=0;i<5;i++)this.joint[i] = range(this.joint[i]);

	}

	update_arrow(){
		if(this.arrow && this.arrow_ready){
			if(this.move_type==0){
				let mj = [0,0,0,0,0,0];
				let k=0;
				let i=0;
				for(i=1;i<4;i++){
					for(k=0;k<6;k++) mj[k] = this.before.joint[k] + (this.joint[k] - this.before.joint[k])*i/4; //range(this.before.joint[k] + range(this.joint[k] - this.before.joint[k])/2);
					let mp = this.parent_chain.robot.joints_to_xyz(mj);
					this.curve_positions[i].set(mp.x,mp.y,mp.z);
				}
			}
			if(this.move_type==1){
				let i=0;
				for(i=1;i<4;i++){
					this.curve_positions[i].set((this.position.x * i + this.before.position.x *(4 - i))/4,
					(this.position.y * i + this.before.position.y * (4 - i) )/4,
					(this.position.z * i + this.before.position.z * (4 - i) )/4);
				}
			}


			this.curve_positions[0].set(this.before.position.x,this.before.position.y,this.before.position.z);
			this.curve_positions[4].set(this.position.x,this.position.y,this.position.z);

			var position = this.curve.mesh.geometry.attributes.position;

			for ( var i = 0; i < this.ARC_SEGMENTS; i ++ ) {

				var t = i / ( this.ARC_SEGMENTS - 1 );
				this.curve.getPoint( t, this.test_point );
				position.setXYZ( i, this.test_point.x, this.test_point.y, this.test_point.z );

			}

			position.needsUpdate = true;
			this.curve.mesh.geometry.computeBoundingSphere();
			this.curve.mesh.computeLineDistances();

			if(this.curve_save_needs_update){
				if(this.move_type==0){
					let mj = [0,0,0,0,0,0];
					let k=0;
					let i=0;
					for(i=1;i<4;i++){
						for(k=0;k<6;k++) mj[k] = this.before.joint_save[k] + (this.joint_save[k] - this.before.joint_save[k])*i/4; //range(this.before.joint[k] + range(this.joint[k] - this.before.joint[k])/2);
						let mp = this.parent_chain.robot.joints_to_xyz(mj);
						this.curve_positions_save[i].set(mp.x,mp.y,mp.z);
					}
				}
				if(this.move_type==1){
					let i=0;
					for(i=1;i<4;i++){
						this.curve_positions_save[i].set((this.position_save.x * i + this.before.position_save.x *(4 - i))/4,
						(this.position_save.y * i + this.before.position_save.y * (4 - i) )/4,
						(this.position_save.z * i + this.before.position_save.z * (4 - i) )/4);
					}
				}


				this.curve_positions_save[0].set(this.before.position_save.x,this.before.position_save.y,this.before.position_save.z);
				this.curve_positions_save[4].set(this.position_save.x,this.position_save.y,this.position_save.z);

				var position_save = this.curve_save.mesh.geometry.attributes.position;

				for ( var i = 0; i < this.ARC_SEGMENTS; i ++ ) {

					var t = i / ( this.ARC_SEGMENTS - 1 );
					this.curve_save.getPoint( t, this.test_point );
					position_save.setXYZ( i, this.test_point.x, this.test_point.y, this.test_point.z );


				}

				position_save.needsUpdate = true;
				this.curve_save.mesh.geometry.computeBoundingSphere();

			}

			/*
			//this.ah.position.set(this.middle_position.x,this.middle_position.y,this.middle_position.z);
			let dir = new THREE.Vector3().subVectors(this.position, this.before.position);
			let l = dir.length();
			dir.normalize();
			this.ah.setDirection(dir);
			this.ah.setLength( Math.min(l,0.51),0.5 *  Math.min(l,0.51)/0.51 ,0.05 *  Math.min(l,0.51)/0.51);
	*/
			this.curve_save_needs_update = false;
		}
	}

	dispose(){		

			//if(this.dummy != 0)
			//	this.master.dispose();
		if(this.after!=null)
			if(this.after.dummy==1)
			{
				this.after.master.base = this.before;
				this.before.update_visuals();
				this.after.master.curve_save_needs_update = true;
				this.after.master.update_visuals();
			}
		if(this.after!=null){
			this.after.curve_save_needs_update = true;
			this.after.update_visuals();
		}

		if(this.arrow&&this.arrow_ready){
			this.parent_chain.scene.remove(this.curve.mesh);
			this.parent_chain.scene.remove(this.curve_save.mesh);
		}
		this.parent_chain.scene.remove(this.sprite);


	}	

	read(){
	
		//console.log(this.move_type);
		if(this.move_type==0){
			let i=0;
			let js = {};
			for(i=0;i < 5+ND_count ;i++){
				if(i<5||ND[i]){
					js["j"+i]  = tripleDigit(this.joint_save[i]);
				}
			}
			return Object.assign(Object.assign({"cmd":"jmove", "rel":0},this.prm),js);
		}
		if(this.move_type==1){
			let aa = this.joint_save[1] + this.joint_save[2] + this.joint_save[3];
			let p = this.parent_chain.robot.xyz_to_real(this.position_save);
			let i=0;
			let cde = {};
			for(i=5;i<5+ND_count;i++){
				if(i<5||ND[i]){
					cde[xyz_names[i]] = tripleDigit(this.joint_save[i]);
				}
			}
			return Object.assign( Object.assign({"cmd":"lmove", "rel":0 , "x":tripleDigit(p.x), "y":tripleDigit(p.y), "z":tripleDigit(p.z), "a":tripleDigit(aa), "b":tripleDigit(this.joint_save[4])}
				,this.prm),cde);
		}
		
	}


	set_cmd(cmd){
		var move_values_given = false;

		if(cmd["cmd"] == "jmove"){
			this.move_type = 0;
		}
		if(cmd["cmd"] == "lmove"){
			this.move_type = 1;
		}

		if(!(typeof cmd["j0"] === 'undefined') || !(typeof cmd["x"] === 'undefined')){
			move_values_given = true;
		}

		//this part needs to be revised
		let k=0;
		for ( k in this.parent_chain.prm_list){
			let name = this.parent_chain.prm_list[k]
			if(!(typeof cmd[name] === 'undefined')){
				this.prm[name] = cmd[name];
				if(this.master!=null){
					this.master.prms[name] = cmd[name];
				}
			}

		}

		if(!(typeof cmd["x"] === 'undefined')){
			let v = this.parent_chain.robot.real_to_xyz(new THREE.Vector3(cmd["x"],cmd["y"],cmd["z"]));

			this.position.set(v.x,v.y,v.z);

			if(this.parent_chain.control_cmd == this){
				this.parent_chain.controller.set_xyza(this.position,cmd["a"],cmd["b"]);
				set_5(this.joint,this.parent_chain.controller.joints)
			}
			else{
				set_5(this.joint , this.parent_chain.robot.xyza_to_joints(this.position,cmd["a"],cmd["b"]));
			}
		}
	
		let i = 0;
		for (i=0;i<5+ND_count;i++){
			if(i<5||ND[i]){
				if(!(typeof cmd["j" + i] === 'undefined'))
					this.joint[i] = cmd["j" + i ];

				if(i>4)
					if(!(typeof cmd[xyz_names[i]] === 'undefined'))
						this.joint[i] = cmd[xyz_names[i] ];
			}
		}
				
		for(i in this.parent_chain.prm_list){
			let name = this.parent_chain.prm_list[i];
			if(!(typeof cmd[name] === 'undefined')){
				this.prm[name] = cmd[name];
			}
		}


		this.update_visuals();
		if(this===this.parent_chain.control_cmd){
			this.parent_chain.controller.set_joints(this.joint);
		}
		

	}	


	callback(){
			let cc = this;
			//let out = this.parent_chain.robot.xyz_to_real(cc.position);
			let out = this.parent_chain.robot.position;
			this.position.set(out.x,out.y,out.z);
			out = this.parent_chain.robot.xyz_to_real(out);
			out.x*=1000;
			out.y*=1000;
			out.z*=1000;
			let outabc = this.parent_chain.robot.abc;
			let message = {

				...{
					"j0": cc.joint[0].toFixed(to_fixed_val),
					"j1": cc.joint[1].toFixed(to_fixed_val),
					"j2": cc.joint[2].toFixed(to_fixed_val),
					"j3": cc.joint[3].toFixed(to_fixed_val),
					"j4": cc.joint[4].toFixed(to_fixed_val),
					"j5": cc.joint[5].toFixed(to_fixed_val),
					"j6": cc.joint[6].toFixed(to_fixed_val),
					"j7": cc.joint[7].toFixed(to_fixed_val)
				},
				...{
					"x": out["x"].toFixed(to_fixed_val),
					"y": out["y"].toFixed(to_fixed_val),
					"z": out["z"].toFixed(to_fixed_val)
				},
				...{
					"a": outabc[0].toFixed(to_fixed_val),//(cc.joint[1]+cc.joint[2]+cc.joint[3]).toFixed(3),
					"b": outabc[1].toFixed(to_fixed_val),//cc.joint[4].toFixed(3),
					"c": outabc[2].toFixed(to_fixed_val),//cc.joint[5].toFixed(3),
					"d": cc.joint[6].toFixed(to_fixed_val),
					"e": cc.joint[7].toFixed(to_fixed_val)
				},	
				...{
					"rel": 0
				},	
				...cc.prm
	  		};
			this.parent_chain.callback.fire(message);
	
	}
	save(){
		this.save_cmd = this.read();
		this.curve_save_needs_update = true;
		

		this.position_save_needs_update = true;

		this.update_sprite_pos();
		
		this.update_visuals();

		if(this.after!=null){
			this.after.curve_save_needs_update = true;
			this.after.update_visuals();

			if(this.after.dummy==1){
				this.after.master.curve_save_needs_update=true;
				this.after.master.update_visuals();
			}

		}
		if(this===this.parent_chain.control_cmd){
				this.parent_chain.controller.set_joints(this.joint);
			}


	}
	cancel(){
		if(this.save_cmd != null){
			this.set_cmd(this.save_cmd);
		}
	}
	select(){
		this.parent_chain.set_control_cmd(this);
	}
	remove(){
		program_list_remove(this.id);
		this.parent_chain.ddelete(this);
		
	}
}

class move_chain{

	control_cmd;

	constructor(scene,camera , renderer, control_camera,robot,controller){
		
		this.list_of_sprites = [];
		this.scene = new THREE.Group();
		this.main_scene = scene;
		this.main_scene.add(this.scene);
		this.camera = camera;
		this.controller = new Robot( renderer , camera , this.scene , control_camera , 0.35 , true );
		this.robot = this.controller
		let spriteMap = new THREE.TextureLoader().load( "./static/assets/texture/dot.png" );

		this.spriteMaterial0 = new THREE.SpriteMaterial( { map: spriteMap , sizeAttenuation: true, color : 0x8629ff } );
		this.spriteMaterial1 = new THREE.SpriteMaterial( { map: spriteMap , sizeAttenuation: true, color : 0xff0000 } );
		this.spriteMaterial2 = new THREE.SpriteMaterial( { map: spriteMap , sizeAttenuation: true, color : 0x035afc } );

		this.prm_list = ["vel","accel","jerk","turn","cont","corner"];

		this.mouse = new THREE.Vector2();
		this.renderer = renderer;

		this.first = new move_cmd([0,0,0,0,0,0,0,0],this,false,null,0);
		this.first.lock = true;
		this.first.id = "0";

		update_path_design_list(0 , 0 +": "+ "Initial")
		//$(`.path_design_program_list_b[data-id=${0}]`).click()


		this.end = this.first;
		this.raycaster = new THREE.Raycaster();
		this.N = 1;
		this.callback = $.Callbacks();

		this.last_id = 0;

		this.list = {"0":this.first};

		this.visible = true;

		this.round_radi_default = 15.0;

		this.update_control();

	}

	add_after(x,y){

		//if(x.master!=null){if(x.dummy!=x.master.n_dummies)return;}

		if(x.after!=null){(x.after).before = y; y.after = x.after;}
		x.after = y;
		y.before = x;

		if(x===this.end){
			this.end = y;
		}
		this.N++;
		this.update_control();
	}

	add_before(x,y){//this has problem

		x.before = y;
		y.after = x;
		if(x===this.first){
			this.first = y;
		}
		this.N++;
		this.update_control();
	}

	clone(x){
		if(x!=null){
			if(x.master!=null)if(x.dummy!=x.master.n_dummies){
				return this.clone(x.master.dummies[x.master.n_dummies - 1]);
				
			}

			let nc = new move_cmd([x.joint[0]+7,x.joint[1],x.joint[2],x.joint[3],x.joint[4],x.joint[5],x.joint[6],x.joint[7]],x.parent_chain,true,x,0);
			this.add_after(x,nc);
			//this.set_control_cmd(nc);
			
			//nc.save();

			return nc;
		}
	}

	ddelete(x){
		if(!x.removed){
			if((x===this.first && x===this.end) || x.lock){
				//cant delete this one
			}
			else{
				x.removed = true;
				if(x===this.end){
					let bef = x.before;
					this.end = bef;
					bef.after = null;
					this.last_id =this.end.id;
				}else
				if(x===this.first){
					let af = x.after;
					this.first = af;
					af.before = null;
				}
				else{	
					let bef = x.before;
					let af = x.after;
					bef.after = af;
					af.before = bef;
					af.update_visuals();
				}
				//delete x;
				if(x===this.control_cmd){
					this.set_control_cmd(null);
				}
				
				x.dispose();
				this.N--;
				this.update_control();
			}
		}
	}
	 
	update_control(){
		this.list_of_sprites = [];
		let i = this.first;
		while(true){
			this.list_of_sprites.push(i.sprite);
			if(i===this.end)break;
			i = i.after;
		}

		//this.click_control = new THREE.DragControls( [ ... this.list_of_sprites ], this.camera, this.renderer.domElement );
		let dom = this.renderer.domElement;
		let mouse = this.mouse;
		let raycaster = this.raycaster;
		let camera = this.camera;
		let list_of_sprites = this.list_of_sprites;
		let this_chain = this;

		function onDocumentMouseMove(event){
			event.preventDefault();
			var rect = dom.getBoundingClientRect();

			mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
			mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
		}

		function onDocumentClick(event){
			
			event.preventDefault();
			
			raycaster.setFromCamera( mouse, camera );


			var intersects = raycaster.intersectObjects(this_chain.list_of_sprites);
			if ( intersects.length > 0 ) {

				let clicked_sprite = intersects[0].object;
				let j = clicked_sprite.father;
				this_chain.set_control_cmd(j);

			}

		} 


		if(typeof this.first_control === 'undefined'){
			this.first_control = 1;
			this.renderer.domElement .addEventListener( 'mousemove', onDocumentMouseMove, false );
			this.renderer.domElement .addEventListener( 'mousedown', onDocumentClick, false );

		}
	}

	set_control_cmd(cmd){
		this.controller.callback.empty();
		if(cmd==null){this.control_cmd=null;this.hide_ghost(); return 0;}
		//cmd.save();
		//$(".move_panel").toggle(true);
		this.show_ghost();
		this.control_cmd = cmd;
		this.controller.set_joints(this.control_cmd.joint);
		let chain = this;
		this.control_cmd.callback();

		if(cmd.dummy==0)program_list_select(cmd.id , 0 , 1);
		else program_list_select(cmd.master.id , cmd.dummy - 1  , 2);


		function control_cmd_update(position){
			if(chain.control_cmd!=null){
				set_5(chain.control_cmd.joint , position);

				chain.control_cmd.update_visuals();
				chain.control_cmd.callback();
			}
		}
		
		this.controller.callback.add(control_cmd_update);
	}

	ok(){
		if(this.control_cmd != null){
			this.control_cmd.save();
			this.set_control_cmd(null);
		}
	}

	cancel(){
		if(this.control_cmd != null){
			this.control_cmd.cancel();
			this.set_control_cmd(null);
		}
	}
	hide_ghost(){
		//hide controls
		this.controller.set_control_mode(0);
		//hide collada
		this.controller.set_visible(false);	
	}
	show_ghost(){
		this.controller.set_visible(true);
		this.controller.set_control_mode(2);

	}

	add_circle(base){
		
		if(base.dummy!=0){
			if(base.dummy != base.master.n_dummies) return this.add_circle(base.after);
		}

		base.set_cmd({"rel":0});
		let circle = new master_cmd("circle",base,this);
		return circle;
		
		/*
		if(!(base.master==null)){
			this.clone(base.master.dummies[1]);
			let nn = base.master.dummies[1].after;
			return this.add_circle(nn);

		}*/
	}

	add(data){
		//find out parameters
		let prms = {};

		for (const id in this.prm_list){
			if(!(typeof data[this.prm_list[id]] === 'undefined')){
				prms[this.prm_list[id]] = data[this.prm_list[id]];
			}
		}

		if(data["cmd"]=="jmove"){
			this.last_id++;
			var n = this.clone(this.end);
			n.move_type = 0;
			if(!(typeof data["j0"] === 'undefined')){   
				n.set_cmd(data)
			}
			n.prm = prms;
			n.save();
			this.list[this.last_id.toFixed()] = n;
			n.id = this.last_id.toFixed();
			n.select();
			return this.last_id.toFixed();
		}
		
		if(data["cmd"]=="lmove"){
			this.last_id++;
			var n = this.clone(this.end);
			n.move_type = 1;
			if(!(typeof data["x"] === 'undefined')){   
				n.set_cmd(data)
			}
			n.prm = prms;
			n.save();
			this.list[this.last_id.toFixed()] = n;
			n.id = this.last_id.toFixed();
			n.select();
			return this.last_id.toFixed();
		}
		
		if(data["cmd"]=="cmove"){
			this.last_id++;
			var n = this.add_circle(this.end);
			if(!(typeof data["x"] === 'undefined')){
				n.dummies[1].set_cmd({"x":data["x"] , "y":data["y"] , "z":data["z"] , "a":data["a"] , "b":data["b"]});
			}

			if(!(typeof data["mx"] === 'undefined')){
				n.dummies[0].set_cmd({"x":data["mx"] , "y":data["my"] , "z":data["mz"] , "a":data["a"] , "b":data["b"]});
			}
			n.prm = prms;
			n.save();
			this.list[this.last_id.toFixed()] = n;
			n.id = this.last_id.toFixed();
			//n.select();
			n.save();
			

			return this.last_id.toFixed();
		}


	}

	save_all(){
		let i=0;
		for(i=0;i<this.last_id;i++){
			if(this.list[i]!=null){
				if(!this.list[i].removed){
					this.list[i].save();
				}
			}
		}
	}
	cancel_all(){
		let i=0;
		for(i=0;i<this.last_id;i++){
			if(this.list[i]!=null){
				if(!this.list[i].removed){
					this.list[i].cancel();
				}
			}
		}
	}
	remove_all(){
		let i=0;
		for(i=0;i<this.last_id;i++){
			if(this.list[i]!=null){
				if(!this.list[i].removed){
					this.list[i].remove();
				}
			}
		}
	}

	set_visible(show){
		if(this.visible != show){
			if(!show){
				this.main_scene.remove(this.scene);
			}
			else{
				this.main_scene.add(this.scene);
			}
		}

		this.visible = show;
		
	}
	play(id){
		let x = this.first;
		if(this.list[id].n_points==2) x = this.list[id].dummies[0];
		if(this.list[id].n_points==1) x = this.list[id];

		this.set_control_cmd(x);
		this.set_control_cmd(null);
		this.show_ghost();
		this.controller.set_control_mode(0);
		this.play_t = 0;
		this.play_cmd = x;

		this.play_l_speed = 0.03;
		this.play_j_speed = 0.3;
		this.play_c_speed = 0.03;

		let chain = this;
		function play_func(){
			if(chain.control_cmd==null){
				var finish_cmd = false;
				var new_j = [0,0,0,0,0,0];
				if(chain.play_cmd.dummy==0){
					if(chain.play_cmd.move_type==0){
						let dj = [0,0,0,0,0,0];
						let i=0;
						for(i=0;i<6;i++) dj[i] = chain.play_cmd.joint[i] - chain.controller.joints[i];
						let jc = Math.sqrt(dj[0]*dj[0] + dj[1]*dj[1] + dj[2]*dj[2] + dj[3]*dj[3] + dj[4]*dj[4] + dj[5]*dj[5]);
						if(jc < chain.play_j_speed) finish_cmd = true;
						else{
							let i=0;
							for(i=0;i<6;i++) new_j[i] =  chain.controller.joints[i] + dj[i] * chain.play_j_speed / jc;
						}
					}
					if(chain.play_cmd.move_type==1){
						let dx = new THREE.Vector3().subVectors(chain.play_cmd.position , chain.controller.position);
						let da = chain.play_cmd.joint[1] + chain.play_cmd.joint[2] + chain.play_cmd.joint[3] 
								-chain.controller.joints[1] - chain.controller.joints[2] - chain.controller.joints[3];
						let db = chain.play_cmd.joint[4] -chain.controller.joints[4];

						let lc = dx.length();
						if(lc<chain.play_l_speed)finish_cmd = true;
						else{
							let tc = (new THREE.Vector3().subVectors(chain.play_cmd.position , chain.play_cmd.before.position)).length();

							let new_a = (chain.play_cmd.before.joint[1] + chain.play_cmd.before.joint[2] + chain.play_cmd.before.joint[3]) * (lc) / tc
										+ (chain.play_cmd.joint[1] + chain.play_cmd.joint[2] + chain.play_cmd.joint[3])* (tc - lc) / tc;
							let new_b =  chain.play_cmd.before.joint[4] * (lc) / tc + chain.play_cmd.joint[4]* (tc - lc) / tc;

							let nx = chain.controller.position.clone().addScaledVector(dx,chain.play_l_speed/lc);

							chain.controller.set_xyza(nx,new_a,new_b);

							new_j = chain.controller.joints;//chain.robot.xyza_to_joints(nx,new_a,new_b);
							
							if(!chain.robot.check_interior(nx,new_a)) {
								clearInterval(chain.play_interval);
								show_dismiss_alert("danger","out of bound",5000);
							}
						}
					}
				}
				if(chain.play_cmd.dummy!=0){
					let p0 = chain.play_cmd.master.p0;
					let r = chain.play_cmd.master.r;
					let delta = new THREE.Vector3().subVectors(chain.controller.position, p0);
					let t = Math.atan2(delta.dot(chain.play_c_b) , delta.dot(chain.play_c_a));
					chain.play_t += -chain.play_c_speed;
					t += chain.play_c_speed;
					
					if(chain.play_t < 0)finish_cmd = true;

					let nx = chain.play_c_a.clone().multiplyScalar(Math.cos(t)*r).addScaledVector(chain.play_c_b,Math.sin(t)*r).addScaledVector(p0,1);
					let new_a =  chain.controller.a_get() + chain.play_c_speed*chain.play_c_dadt;
					let new_b = chain.controller.joints[4] + chain.play_c_speed*chain.play_c_dbdt;

					new_j = chain.robot.xyza_to_joints(nx ,new_a,new_b);

					if(!chain.robot.check_interior(nx,new_a)) {
								clearInterval(chain.play_interval);
								show_dismiss_alert("danger","out of bound",5000);
							}
				}

				if(finish_cmd){
					if(chain.play_cmd.dummy!=1)
						chain.controller.set_joints(chain.play_cmd.joint);
					if(chain.play_cmd.after == null){
						clearInterval(chain.play_interval);
					}
					else{
						chain.play_cmd = chain.play_cmd.after;

						if(chain.play_cmd.dummy>0){
								var turn = 0;
								if (!(typeof chain.play_cmd.master.prm.turn === 'undefined'))
									turn = chain.play_cmd.master.prm.turn;
						}

						if(chain.play_cmd.dummy==1){
							let a = new THREE.Vector3().subVectors(chain.play_cmd.master.base.position, chain.play_cmd.master.p0).normalize();
							let b = chain.play_cmd.master.omega.clone().cross(a);
							let r1 = new THREE.Vector3().subVectors(chain.play_cmd.master.dummies[0].position, chain.play_cmd.master.p0);
							let r2 = new THREE.Vector3().subVectors(chain.play_cmd.master.dummies[1].position, chain.play_cmd.master.p0);
							let t1 = Math.atan2(r1.dot(b),r1.dot(a));
							let t2 = Math.atan2(r2.dot(b),r2.dot(a));
							if(t1<0) t1 += 2*Math.PI;
							if(t2<0) t2 += 2*Math.PI;
							chain.play_t = t1;

							chain.play_c_a = a;
							chain.play_c_b = b;



							let total_t = (t2) + (turn)*2*Math.PI;
							chain.play_c_dadt = (chain.play_cmd.master.dummies[1].a() - chain.play_cmd.master.base.a())/total_t;
							chain.play_c_dbdt = (chain.play_cmd.master.dummies[1].joint[4] - chain.play_cmd.master.base.joint[4])/total_t;
						}
						if(chain.play_cmd.dummy==2){

							let a = new THREE.Vector3().subVectors(chain.play_cmd.master.base.position, chain.play_cmd.master.p0).normalize();
							let b = chain.play_cmd.master.omega.clone().cross(a);
							let r1 = new THREE.Vector3().subVectors(chain.play_cmd.master.dummies[0].position, chain.play_cmd.master.p0);
							let r2 = new THREE.Vector3().subVectors(chain.play_cmd.master.dummies[1].position, chain.play_cmd.master.p0);
							let t1 = Math.atan2(r1.dot(b),r1.dot(a));
							let t2 = Math.atan2(r2.dot(b),r2.dot(a));
							if(t1<0) t1 += 2*Math.PI;
							if(t2<0) t2 += 2*Math.PI;
							chain.play_t = (t2 - t1) + (turn)*2*Math.PI;

							chain.play_c_a = a;
							chain.play_c_b = b;

						}
					}
				}
				else{
					chain.controller.set_joints(new_j);
					//console.log(new_j)
				}
			
			}
			
			else{
				clearInterval(chain.play_interval);
			}
		}

		if(!(typeof this.play_interval === 'undefined'))
			clearInterval(this.play_interval);
		this.play_interval = setInterval(play_func , 1000/frame["fps"])
	}
	tool_head_length_set(x){
		this.controller.tool_head_length_set(x)

		let a =this.first;
		while(true){
			if (a.move_type == 0){
				a.update_visuals();
			}
			if(a.move_type == 1){
				let aa = a.joint[1] + a.joint[2] + a.joint[3];
				let bb = a.joint[4];
				set_5(a.joint , this.robot.xyza_to_joints(a.position,aa,bb));
			}
			if(a.after==null){
				break;
			}
			a = a.after;
		}
	}
	make_script(send,roundness){ //if send = true commands play imediatley, if send = flase commands will be written in script text box
		// in case circle round in removed remove stuff from here
		let a = this.first;
		let fullmsg = ""
		var msg = null;
		let last_pos = new THREE.Vector3(0,0,0)
		let new_msg1 = null;
		let new_msg2 = null;
		let round_radi = 0.0;

		while(true){
			let circle_added = false
			if(a.dummy!=0){
				if(a.dummy != a.master.n_dummies ){
					a = a.after;
					continue;
				}
				msg = a.master.read();

			}
			else{
				msg = a.read();
			}

			if(!circle_added){
				let v = this.robot.xyz_to_real(a.position);
				last_pos.set(v.x,v.y,v.z);
			}
			if(!send){
				if(!circle_added){
					fullmsg = fullmsg +/*"//"+a.id+"\n"+*/ JSON.stringify(msg)
				}
				else{
					fullmsg = fullmsg + JSON.stringify(new_msg1) + "\n" + JSON.stringify(new_msg2)
				}
			}
			else{
				if(!circle_added){
					send_message(msg);
				}
				else{
					send_message(new_msg1);
					send_message(new_msg2);
				}
			}

			if(a.after==null)
				break;

			if(!send)
				fullmsg = fullmsg  + "\n";

			a = a.after;
		}

		if(!send)
			editor.setValue(fullmsg);
	}

	create_by_id(msg,text){
		let command = chain.add(msg);
		// update list
		update_path_design_list(command,command +": "+ text)
		$(`.path_design_program_list_b[data-id=${command}]`).click()
	
	}
	delete_all_by_id(){
		$(".path_design_program_list_b" ).each(function( index){
			let id = $(this).attr("data-id")
			if (id > 0) {
				chain.list[id].remove()
			}
		})
		return true;
	}

}

class master_cmd{
	positions;
	constructor(type,base,parent_chain){
		this.prm = {};

		this.parent_chain = parent_chain;
		this.base = base;
		this.type = type;
		this.dummies = [];
		this.n_dummies =0;
		this.ARC_SEGMENTS = 20;
		this.id = "-1";

		this.self_initiate();
	}
	self_initiate(){
		if(this.type == "circle"){
			this.n_points = 2;
			this.n_dummies = 2;
			let dummy1 = new move_cmd([0,0,0,0,0,0,0,0],this.parent_chain,false,this.base,1);
			let dummy2 = new move_cmd([90,0,0,0,0,0,0,0],this.parent_chain,false,this.base,1);
			let p1 = this.parent_chain.robot.xyz_to_real(new THREE.Vector3(this.base.position.x + 0.5,this.base.position.y, this.base.position.z + 0.5));
			let p2 = this.parent_chain.robot.xyz_to_real(new THREE.Vector3(this.base.position.x + 0.25,this.base.position.y + 0.5, this.base.position.z + 0.25));

			dummy1.set_cmd({"x":p1.x,"y":p1.y,"z":p1.z,"a":0,"b":0});
			dummy2.set_cmd({"x":p2.x,"y":p2.y,"z":p2.z,"a":0,"b":0});


			this.parent_chain.add_after(this.base,dummy1);
			this.parent_chain.add_after(dummy1,dummy2);

			this.dummies.push(dummy1);
			this.dummies.push(dummy2);
			this.dummies[0].master = this;
			this.dummies[1].master = this;
			this.dummies[0].dummy = 1;
			this.dummies[1].dummy = 2;

			this.dummies[0].sprite.material = this.parent_chain.spriteMaterial2;
			this.dummies[1].sprite.material = this.parent_chain.spriteMaterial1;

			var geometry = new THREE.BufferGeometry();
			geometry.setDrawRange( 0 , this.ARC_SEGMENTS );
			this.positions = new Float32Array( this.ARC_SEGMENTS * 3 );
			geometry.setAttribute( 'position', new THREE.BufferAttribute(this.positions , 3 ) );
			this.curve = new THREE.Line(geometry, new THREE.LineDashedMaterial( { color: 0x4d0005, dashSize: 0.05, gapSize: 0.025 }) );
			this.base.parent_chain.scene.add(this.curve);

			var geometry_save = new THREE.BufferGeometry();
			geometry_save.setDrawRange( 0 , this.ARC_SEGMENTS );
			this.positions_save = new Float32Array( this.ARC_SEGMENTS * 3 );
			geometry_save.setAttribute( 'position', new THREE.BufferAttribute(this.positions_save , 3 ) );
			this.curve_save = new THREE.Line(geometry_save, new THREE.LineBasicMaterial( {color: 0x4d0005} ) );
			this.base.parent_chain.scene.add(this.curve_save);

			this.curve_save_needs_update = true;

		}
		this.update_visuals();

	}
	select(i=1){
		if(i==0)
			this.parent_chain.set_control_cmd(this.base);
		if(i==1 || i==2)
		this.parent_chain.set_control_cmd(this.dummies[i-1]);
		
	}

	update_visuals(){
		if(this.type == "circle"){
			var a = new THREE.Vector3().subVectors(this.dummies[0].position,this.base.position);
			var b = new THREE.Vector3().subVectors(this.dummies[1].position,this.base.position);
			var aa = a.dot(a);
			var ab = a.dot(b);
			var bb = b.dot(b);
			
			if(typeof this.omega==='undefined')
				this.omega = new THREE.Vector3(0,0,0);
			this.omega.set(a.x,a.y,a.z);
			this.omega.cross(b).normalize();

			if(typeof this.p0==='undefined')
				this.p0 = new THREE.Vector3(0,0,0);

			this.p0.set(0,0,0)

			this.p0.addScaledVector(a ,  bb*(aa-ab));
			this.p0.addScaledVector(b , -aa*(ab-bb));
			this.p0.multiplyScalar (0.5/(aa*bb-ab*ab));
			
			this.r = this.p0.length();
			
			this.p0.add(this.base.position);

			b.addScaledVector(a , -ab/aa);
			a.normalize();
			b.normalize();

			let c = 0;
			for(c=0;c<this.ARC_SEGMENTS;c++){
				let t = 2*Math.PI*c/(this.ARC_SEGMENTS-1);
				let v = a.clone();
				v.multiplyScalar (Math.cos(t));

				v.addScaledVector(b,Math.sin(t));
				v.multiplyScalar (this.r);
				v.add(this.p0);
				this.curve.geometry.attributes.position.setXYZ( c, v.x,v.y,v.z);
			}
			this.curve.geometry.attributes.position.needsUpdate = true;
			this.curve.geometry.computeBoundingSphere();
			this.curve.computeLineDistances();

			if(this.curve_save_needs_update){
				var a = new THREE.Vector3().subVectors(this.dummies[0].position_save,this.base.position_save);
				var b = new THREE.Vector3().subVectors(this.dummies[1].position_save,this.base.position_save);
				var aa = a.dot(a);
				var ab = a.dot(b);
				var bb = b.dot(b);
				
				var p0 = new THREE.Vector3(0,0,0);
				p0.addScaledVector(a ,  bb*(aa-ab));
				p0.addScaledVector(b , -aa*(ab-bb));
				p0.multiplyScalar (0.5/(aa*bb-ab*ab));
				var r = p0.length();
				p0.add(this.base.position_save);

				b.addScaledVector(a , -ab/aa);
				a.normalize();
				b.normalize();

				let c = 0;
				for(c=0;c<this.ARC_SEGMENTS;c++){
					let t = 2*Math.PI*c/(this.ARC_SEGMENTS-1);
					let v = a.clone();
					v.multiplyScalar (Math.cos(t));

					v.addScaledVector(b,Math.sin(t));
					v.multiplyScalar (r);
					v.add(p0);
					this.curve_save.geometry.attributes.position.setXYZ( c, v.x,v.y,v.z);
				}
				this.curve_save.geometry.attributes.position.needsUpdate = true;
				this.curve_save.geometry.computeBoundingSphere();	
				this.curve_save_needs_update = false;
			}

		}

	}

	dispose(){
		let i=0;
		for(i=0;i<this.dummies.length;i++){
			this.parent_chain.ddelete(this.dummies[i]);
		}

		//this.base.master = null;
		this.base.parent_chain.scene.remove(this.curve);
		this.base.parent_chain.scene.remove(this.curve_save);

	}

	save(){
		
		let i = 0;
		for(i = 0;i<2;i++){
			this.dummies[i].save();
		}
		this.curve_save_needs_update = true;
		this.update_visuals();
	}

	cancel(){
			let i=0;
			for( i=0;i<2;i++){
				this.dummies[i].cancel();
			}
	}
	remove(){
		program_list_remove(this.id);
		this.dispose();
			
	}
	read(){
		let p1 = this.base.parent_chain.robot.xyz_to_real(this.dummies[0].position_save);
		let p2 = this.base.parent_chain.robot.xyz_to_real(this.dummies[1].position_save);

		let a = this.dummies[1].joint[1] + this.dummies[1].joint[2] + this.dummies[1].joint[3];
		let b = this.dummies[1].joint[4];

		let cmd = {"cmd":"cmove", "rel": 0 , "mx":tripleDigit(p1.x), "my":tripleDigit(p1.y), "mz":tripleDigit(p1.z)
		, "x":tripleDigit(p2.x), "y":tripleDigit(p2.y), "z":tripleDigit(p2.z) , "a":tripleDigit(a) , "b":tripleDigit(b) };

		return Object.assign(cmd,this.prm);

	}

}