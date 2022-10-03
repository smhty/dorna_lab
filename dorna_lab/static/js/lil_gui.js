/*
var GUI = lil.GUI;
const gui = new GUI( {title: "Timeline controller", container: document.querySelector('#test_2') } );

gui.add( document, 'title' );

const obj = {"j0":0, "j1":0, "j2":0, "j3":0, "j4":0, "j5":0, "j6":0, "j7":0, "x":0, "y":0, "z":0, "a":0, "b":0, "c":0, "d":0, "e":0}

// nested controllers
const folder_1 = gui.addFolder( 'Joint' );
folder_1.add( obj, 'j0' );
folder_1.add( obj, 'j1' );
folder_1.add( obj, 'j2' );
folder_1.add( obj, 'j3' );
folder_1.add( obj, 'j4' );
folder_1.add( obj, 'j5' );
folder_1.add( obj, 'j6' );
folder_1.add( obj, 'j7' );

// nested controllers
const folder_2 = gui.addFolder( 'XYZ' );
folder_2.add( obj, 'x' );
folder_2.add( obj, 'y' );
folder_2.add( obj, 'z' );
folder_2.add( obj, 'a' );
folder_2.add( obj, 'b' );
folder_2.add( obj, 'c' );
folder_2.add( obj, 'd' );
folder_2.add( obj, 'e' );


*/
//prm
let gui_prm = {
  cmd: 0,
  fps: 24,
}

// general setting
let general_setting_key_frame_gui = new Tweakpane.Pane({container: document.querySelector('#gui_div'), title: "General Setting"});
// plugin
general_setting_key_frame_gui.registerPlugin(TweakpaneCamerakitPlugin)
general_setting_key_frame_gui.registerPlugin(TweakpaneEssentialsPlugin)

// motion type
general_setting_key_frame_gui.addInput(gui_prm, 'cmd', {
  view: 'radiogrid',
  groupName: 'cmd',
  size: [2, 1],
  cells: (x, y) => ({
    title: ["Joint", "Line"][x],
    value: [0, 1][x],
  }),

  label: 'Motion Type',
}).on('change', (ev) => {
  console.log(ev);
});


//fps
general_setting_key_frame_gui.addInput(gui_prm, "fps", {
  label: 'Robot FPS',
  view: 'cameraring',
  series: 0,
  min: 1,
  max: 960,
  step: 1,
})


// new key frame
let new_key_frame_gui = new Tweakpane.Pane({container: document.querySelector('#gui_div'), title: "New Key Frame"});

// plugin
new_key_frame_gui.registerPlugin(TweakpaneCamerakitPlugin);

// new frame label
gui_prm["label"] = "new_frame_"
new_key_frame_gui.addInput(gui_prm, "label", {label: 'Label'})

// frame value 
gui_prm["frame_new"] = 1
new_key_frame_gui.addInput(gui_prm, "frame_new", {
  label: 'Frame',
  view: 'cameraring',
  series: 0,
  min: 0,
  max: 1500,
  step: 1,
})

// new key_frame_button
gui_prm["new_frame_b"] = new_key_frame_gui.addButton({
  title: '+ Create Key Frame',
});


// key frame gui
let key_frame_gui = new Tweakpane.Pane({container: document.querySelector('#gui_div'), title: "Key Frame Setting"});

// plugin
key_frame_gui.registerPlugin(TweakpaneCamerakitPlugin);


// select frame
gui_prm["key_frame"] = 0
key_frame_gui.addInput(gui_prm, "key_frame", {
  options:{
    0: 0
  },
  label: 'Select Key Frame'
})

// selected frame
gui_prm["frame_select"] = 1
key_frame_gui.addInput(gui_prm, "frame_select", {
  label: 'Frame',
  view: 'cameraring',
  series: 0,
  min: 0,
  max: 1500,
  step: 1,
})

// position tab
let pose_tab = key_frame_gui.addTab({
  pages: [
    {title: 'Joint'},
    {title: 'Cartesian'},
  ],
});

//Joint
gui_prm["j0_2"] = {"x": 0, "y": 0, "z": 0}
gui_prm["j3_5"] = {"x": 0, "y": 0, "z": 0}
pose_tab.pages[0].addInput(gui_prm, "j0_2", {label: 'j0, j1, j2'})
pose_tab.pages[0].addInput(gui_prm, "j3_5", {label: 'j3, j4, j5'})


//XYZ
gui_prm["xyz"] = {"x": 0, "y": 0, "z": 0}
gui_prm["abc"] = {"x": 0, "y": 0, "z": 0}
pose_tab.pages[1].addInput(gui_prm, "xyz", {label: 'x, y, z'})
pose_tab.pages[1].addInput(gui_prm, "abc", {label: 'a, b, c'})

/*
for (let i = 0; i < 8 ; i++) {
  gui_prm["j"+i] = 0 // joint
  gui_prm["xyzabcde"[i]] = 0 // xyz
  pos_tab.pages[0].addInput(gui_prm, "j"+i)
  pos_tab.pages[1].addInput(gui_prm, "xyzabcde"[i])
}
*/
// sync
gui_prm["sync"] = key_frame_gui.addButton({
  title: 'Sync',
  label: 'Robot Pose'
});

//Motion parameter
let motion_prm_folder = key_frame_gui.addFolder({
  title: 'Parameters',
});
gui_prm["accel"] = 10
gui_prm["cont"] = true
gui_prm["corner_radius"] = 10
motion_prm_folder.addInput(gui_prm, "accel", {"min":0, "max":100, label: "Acceleration"})
motion_prm_folder.addInput(gui_prm, "cont", {label: 'Continuous'})
motion_prm_folder.addInput(gui_prm, "corner_radius", {label: 'Corner Radius'})


//IO
let io_folder = key_frame_gui.addFolder({
  title: 'IO',
  expanded: false,
});
for (let i = 0; i < 8 ; i++) {
  gui_prm["out"+i] = false // joint
  io_folder.addInput(gui_prm, "out"+i);
}

//delete
gui_prm["delete_frame"] = key_frame_gui.addButton({title: 'Delete Key Frame'});


// on change 
general_setting_key_frame_gui.on('change', (ev) => {
  //console.log(JSON.stringify(ev.value));
  console.log(gui_prm)
});

new_key_frame_gui.on('change', (ev) => {
  //console.log(JSON.stringify(ev.value));
  console.log(ev)
});

key_frame_gui.on('change', (ev) => {
  //console.log(JSON.stringify(ev.value));
  console.log(ev)
});
