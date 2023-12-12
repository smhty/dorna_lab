const { ClassicPreset: Classic, NodeEditor } = window.Rete
const { createRoot } = window.ReactDOM
const { AreaExtensions, AreaPlugin } = window.ReteAreaPlugin
const { ConnectionPlugin, Presets: ConnectionPresets } = window.ReteConnectionPlugin
const { ReactRenderPlugin, Presets: ReactPresets } = window.ReteReactRenderPlugin
const { DataflowEngine } = window.ReteEngine
const { ContextMenuPlugin, Presets: ContextMenuPresets } = window.ReteContextMenuPlugin

class Connection extends Classic.Connection {}
var vision_param_count = 0; 
var preview_node_list = [];
var vision_output  = $(".vision_python_editor");

var image_control_counter = 0; 

class general_node extends Classic.Node {
  constructor(change ,initial , info) {
    super(info['type_name']);
    this.info = info;
    this.initial = initial;
    this.change = change;

    var input_count = 0;
    for(const input_index in info['inputs']){
      let input =  info['inputs'][input_index];
      const left = new Classic.Input(rete_socket, input.title,false) //multiple inputs off
      if(input.type=="number"){
        left.addControl(new Classic.InputControl('number', { initial: this.initial[input_count] , change }));
      }
      this.addInput(input.name, left);
      input_count = input_count + 1;

    }
    this.has_image_output = false;
    for(const output_index in info['outputs']){
      let output = info['outputs'][output_index];
      this.addOutput(output.name, new Classic.Output(rete_socket, output.title));
      if(output.type == "image" && !this.has_image_output){
        this.has_image_output = true;
      }
    }
    /*
    for(const control_index in info['controls']){
      let control = info['controls'][control_index];
      this.addControl(control.name, new Classic.InputControl('number', { initial: 0, readonly: true }));
    }
    */
    if(this.has_image_output){
      this.addControl('image_preview', new ImageControl('number', change, ""));
    }

  }

  data(inputs) {
    //const { left = [], right = [] } = inputs;
    //const leftControl = this.inputs['left'].control
    //const rightControl = this.inputs['right'].control
    //const sum = (left[0] || leftControl.value) + (right[0] || rightControl.value);

    //this.controls['result'].setValue(sum);
    
    let output_params = ""
    let params_list = [];
    let return_value = {};
    for (const label in this.outputs) {
      let param_name = "p" + vision_param_count;
      vision_param_count = vision_param_count + 1;
      if(output_params != "")
        output_params = output_params + ", ";
      output_params = output_params + param_name;
      params_list.push(param_name);
      return_value[label] = param_name;
    }

    let code = vision_output.val();
    code += '\n'+ output_params + ' = ' + this.info.function + '(';
    var inputs_count = 0;

    for (const label in inputs) {
      if(inputs_count>0)code+=", ";
      code += label +"=" + inputs[label][0];
      inputs_count += 1;
    }

    for (const input_index in this.info["inputs"]) {
      let input = this.info["inputs"][input_index];
      let label = input["name"];
      
      if(inputs.hasOwnProperty(label))
        continue;
      if(input.type != "number") 
        continue;

      if(inputs_count>0)code+=", ";
      code += label +"=" + this.inputs[label].control.value;
      inputs_count += 1;
    }


    code += ")";
    let params_count_2 = 0;
    for (const label in this.info.outputs) {
      if(this.info.outputs[label].type == "image"){
        code += "\n" + "preview_list.append(" + params_list[params_count_2] +")";
        preview_node_list.push(this);  
        break;
      }
      params_count_2 += 1;
    }

    vision_output.val(code);

    return return_value;
  }
  clone = () => {
    return new general_node(this.change,this.initial,this.info);
  }
}


class output_node extends Classic.Node {
  constructor( change) {
    super('Output');

    const left = new Classic.Input(rete_socket, 'output data')

    this.addInput('left', left);
  }
  data(inputs) {
    const { left = [], right = [] } = inputs;
    const result = left[0] ;

    return {
      value: result,
    };
  }
  clone = () => {
    return new output_node(this.change)
  }
}

class image_input_node extends Classic.Node {
  constructor(image_index, change) {
    super('Input Image');

    this.addOutput('image', new Classic.Output(rete_socket));
    this.image_index = image_index;
    
    this.addControl('image_preview', new ImageControl('number', change, image_array[image_index]));

  }
  data() {
    const value = "im[" + this.image_index + "]";
    return {
      'image':value,
    };
  }
  clone = () => {
    return new image_input_node(this.image_index, this.change);
  }
}


class NumberNode extends Classic.Node {
  constructor(initial, change) {
    super('Number');

    this.addOutput('value', new Classic.Output(rete_socket, 'Number'));
    this.addControl(
      'value',
      new Classic.InputControl('number', { initial, change })
    );
  }
  data() {
    const value = this.controls['value'].value;
    return {
      value,
    };
  }
  clone = () => {
    return new NumberNode(this.controls['value'].value, this.change)
  }
}

class AddNode extends Classic.Node {
  constructor(change) {
    super('Add');
    const left = new Classic.Input(rete_socket, 'Left')
    const right = new Classic.Input(rete_socket, 'Right')
    
    left.addControl(new Classic.InputControl('number', { initial: 0, change }))
    right.addControl(new Classic.InputControl('number', { initial: 0, change }))

    this.addInput('left', left);
    this.addInput('right', right);
    this.addOutput('value', new Classic.Output(rete_socket, 'Number'));
    this.addControl('result', new Classic.InputControl('number', { initial: 0, readonly: true }));
  }
  data(inputs) {
    const { left = [], right = [] } = inputs;
    const leftControl = this.inputs['left'].control
    const rightControl = this.inputs['right'].control
    const sum = (left[0] || leftControl.value) + (right[0] || rightControl.value);
    this.controls['result'].setValue(sum);

    return {
      value: sum,
    };
  }
  clone = () => {
    return new AddNode(this.change)
  }
}

class ImageControl extends Classic.Control {
  constructor(string, onClick, image_src) {
    super();
    this.image_id = 'image-ctrl-' + String(image_control_counter);
    image_control_counter += 1;
    this.image_src = image_src;
  }
}

function on_image_click(control){
  $("#main-preview-image").attr('src', $("#"+control.image_id).attr('src') )
}

function CustomImage(props) {
  return React.createElement('img', {
    src: props.data.image_src,
    alt: props.data.label,
    onClick: (e) => {on_image_click(props.data);e.stopPropagation();},
    id: props.data.image_id,
    height : 100,
    width : 100,
    onPointerDown: (e) => e.stopPropagation(),
    onDoubleClick: (e) => e.stopPropagation(),
  });
}

  info_1 = {"type_name":"grayscale", "function":"grayscale", 
  "inputs":[{"name":"image","title":"Image","type":"general"}] , 
  "outputs":[{"name":"img","title":"Output", "type":"image"}]}

const rete_socket = new Classic.Socket('rete_socket');
const rete_editor = new NodeEditor();
const area = new AreaPlugin(document.querySelector('#rete'));
const connection = new ConnectionPlugin();
const reactRender = new ReactRenderPlugin({ createRoot });
const contextMenu = new ContextMenuPlugin({
  items: ContextMenuPresets.classic.setup([
    ['Output', () => new output_node(process)],
    ['Number', () => new NumberNode(1, process)],
    ['Add', () => new AddNode(process)],
    ['grayscale', ()=> new general_node(process, [0,0,0] , info_1)]
    
  ])
})

connection.addPreset(ConnectionPresets.classic.setup())

rete_editor.use(area);

area.use(contextMenu)
area.use(reactRender);
area.use(connection);

reactRender.addPreset(ReactPresets.classic.setup({ area }));
reactRender.addPreset(ReactPresets.contextMenu.setup())
reactRender.addPreset(ReactPresets.classic.setup({customize: {
        control(data) {
          if (data.payload instanceof ImageControl) {
            return CustomImage;
          }
        }
} , area  }));

AreaExtensions.simpleNodesOrder(area);
AreaExtensions.showInputControl(area)

AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
  accumulating: AreaExtensions.accumulateOnCtrl(),
});

const dataflow = new DataflowEngine();

rete_editor.use(dataflow);

async function process() {
  dataflow.reset();
  vision_output.val('');
  vision_param_count = 0;
  preview_node_list = [];
  for (const node of rete_editor.getNodes()) {
    if (node instanceof output_node) {
      await dataflow.fetch(node.id);
      //area.update('control', node.controls['result'].id);
    }
  }
}

void async function () { //Initialize

  const out = new output_node(process);

  await rete_editor.addNode(out);

  await area.translate(out.id, { x: 200, y: 200 });


  await process();

  rete_editor.addPipe((context) => {
    if (
      context.type === 'connectioncreated' ||
      context.type === 'connectionremoved'
    ) {
      process();
    }
    return context;
  });

}()

$('.vision_play_b').click(function(e){

  send_message({
    "_server":"vision_play",
    "code": vision_output.val(),
    "images": image_array
  })


  });

var preview_image_sources = []

function update_vision_preview_images(images){
  preview_image_sources = [];
  for(i in images){
    preview_image_sources.push(`data:image/jpg;base64,` + images[i]);
    node = preview_node_list[i];
    if(!node.has_image_output){
      continue;
    }

    $("#" + node.controls['image_preview'].image_id).attr('src' , preview_image_sources[i] );
  }


}