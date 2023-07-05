
lists = {}
cmd_list = ["jmove", "lmove", "cmove", "rmove", "halt", "alarm", "sleep", "input", "probe", "output", "pwm", "adc", "joint", "motor", "toollength", "version", "uid"]
output_list = ["out0", "out1", "out2", "out3", "out4", "out5", "out6", "out7", "out8", "out9", "out10", "out11", "out12", "out13", "out14", "out15"]
pwm_list = ["pwm0", "pwm1", "pwm2", "pwm3", "pwm4", "duty0", "duty1", "duty2", "duty3", "duty4", "freq0", "freq1", "freq2", "freq3", "freq4"]
probe_list = ["in0", "in1", "in2", "in3", "in4", "in5", "in6", "in7", "in8", "in9", "in10", "in11", "in12", "in13", "in14", "in15"]
rapid_list = [ "vel", "accel", "jerk"]
j_list = ["j0", "j1", "j2", "j3", "j4", "j5", "j6", "j7"]
l_list = ["x", "y", "z", "a", "b", "c", "d", "e"]
coord_list = j_list.concat(l_list)
mcoord_list = ["mj0", "mj1", "mj2", "mj3", "mj4", "mj5", "mj6", "mj7", "mx", "my", "mz", "ma", "mb", "mc", "md", "me"]

val_list =   []
            . concat(j_list)
            . concat(l_list)
            . concat(rapid_list)
            . concat(output_list)
            . concat(pwm_list)
            . concat( probe_list) 
            . concat( ["adc0", "adc1", "adc2", "adc3", "adc4"])
            . concat( ["id", "stat"])
            . concat(["time", "motor", "version", "uid"])
            . concat( ["queue,timeout"])
            . concat( [ "alarm", "err0", "err1", "err2", "err3", "err4", "err5", "err6", "err7"])
            . concat( ["cmd" , "rel"])
            . concat( ["turn", "dim", "space"])
            . concat(mcoord_list)

function add_lists(list,name){
  let i = 0
  lists[name]=[]
  for (i in list) lists[name].push([list[i],list[i]])
}

add_lists(cmd_list,"cmd_list")
add_lists(output_list,"output_list")
add_lists(pwm_list ,"pwm_list")
add_lists(probe_list,"probe_list")
add_lists(val_list ,"val_list")
add_lists(rapid_list ,"rapid_list")
add_lists(j_list ,"j_list")
add_lists(l_list ,"l_list")
add_lists(coord_list ,"coord_list")
add_lists(mcoord_list ,"mcoord_list")

var set_label_Json ={
  "type": "set_label",
  "message0": "%1 = %2",
  "args0": [
    {
      "type": "input_value",
      "name": "label"
    },
    {
      "type": "input_value",
      "name": "input"
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": ""
};

Blockly.Blocks['set_label'] = {
  init: function() {
    this.jsonInit(set_label_Json);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return "set";
    });
  }
};
Blockly.Python['set_label'] = function(block) {
  var value_label = Blockly.Python.valueToCode(block, 'label', Blockly.Python.ORDER_NONE);
  var value_input = Blockly.Python.valueToCode(block, 'input', Blockly.Python.ORDER_NONE);

  var code = "";
  if(value_input)
    code = value_label+"=" + value_input;
  else
    code = value_label

  return  [code, Blockly.Python.ORDER_NONE];
};



var key_in_Json ={
  "type": "key_in",
  "message0": "%1",
  "args0": [
    {
      "type": "input_value",
      "name": "key"
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": ""
}
Blockly.Blocks['key_in'] = {
  init: function() {
    this.jsonInit(key_in_Json);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return "";
    });
  }
};
Blockly.Python['key_in'] = function(block) {
  var value_key = Blockly.Python.valueToCode(block, 'key', Blockly.Python.ORDER_NONE);
  var code = value_key;

  return [code, Blockly.JavaScript.ORDER_NONE];
}


var set_var_json = {
  "type": "set_variable",
  "message0": "set %1 %2",
  "args0": [
    {
      "type": "input_value",
      "name": "variable"
    },
    {
      "type": "input_statement",
      "name": "input"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
}
Blockly.Blocks['set_variable'] = {
  init: function() {
    this.jsonInit(set_var_json);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    
    this.setTooltip(function() {
      return "Set variable";
    });
  }
};
Blockly.Python['set_variable'] = function(block) {
  var value_variable = Blockly.Python.valueToCode(block, 'variable', Blockly.Python.ORDER_NONE);
  var statements_input = Blockly.Python.statementToCode(block, 'input');
  // TODO: Assemble Python into code variable.
  var code = value_variable + " = " + statements_input;
  return code;
};




var text_code_Json = {
  "type": "code",
  "message0": "raw %1",
  "args0": [
    {
      "type": "field_multilinetext",//"field_input",
      "name": "input",
      "text": ""
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 210,
  "tooltip": "",
  "helpUrl": ""
}

Blockly.Blocks['code'] = {
  init: function() {
    this.jsonInit(text_code_Json);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return "Text code";
    });
  }
};
Blockly.Python['code'] = function(block) {
  var value_code =  block.getFieldValue('input');

  return value_code+'\n';
};

var block_code_json = {
  "type": "block_type",
  "message0": "%1",
  "args0": [
    {
      "type": "field_input",
      "name": "text",
      "text": ""
    }
  ],
  "output": null,
  "colour": 210,
  "tooltip": "",
  "helpUrl": ""
}

Blockly.Blocks['code_l'] = {
  init: function() {
    this.jsonInit(block_code_json);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return "code";
    });
  }
};
Blockly.Python['code_l'] = function(block) {
  var value_code =  block.getFieldValue('text');
  return [value_code,Blockly.Python.ORDER_ATOMIC];
};



var text_comment_Json = {
  "type": "comment",
  "message0": "tag %1",
  "args0": [
    {
      "type": "field_input",
      "name": "input",
      "text": ""
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 260,
  "tooltip": "",
  "helpUrl": ""
}

Blockly.Blocks['comment'] = {
  init: function() {
    this.jsonInit(text_comment_Json);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return "Comment";
    });
  }
};
Blockly.Python['comment'] = function(block) {
  var value_code =  block.getFieldValue('input');

  return '#'+value_code+'\n';
};


var comment_statement_Json = {
  "type": "comment_statement",
  "message0": "comment %1",
  "args0": [
    {
      "type": "input_statement",
      "name": "code"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 260,
  "tooltip": "",
  "helpUrl": ""
}
Blockly.Blocks['comment_statement'] = {
  init: function() {
    this.jsonInit(comment_statement_Json );
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return "comment";
    });
  }
};

Blockly.Python['comment_statement'] = function(block) {
  var statements_code = Blockly.Python.statementToCode(block, 'code');
  var code = '"""\n'+statements_code+'\n"""\n';
  return code;
};

var label_text_Json = {
  "type": "label_text",
  "message0": "%1 = %2",
  "args0": [
    {
      "type": "field_input",
      "name": "label",
      "text": "j0"
    },                
    {
        "type": "input_value",
        "name": "input",
      }
    ],
    "inputsInline": false,
    "output": null,
    "colour": 75,
    "tooltip": "",
    "helpUrl": ""
    }
Blockly.Blocks['label_text'] = {
  init: function() {
    this.jsonInit(label_text_Json);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return "Text label";
    });
  }
};
Blockly.Python['label_text'] = function(block) {
  var text_label = block.getFieldValue('label');
  var code = text_label;
  var value_input = Blockly.Python.valueToCode(block, 'input', Blockly.JavaScript.ORDER_NONE);
  if(value_input){
    code += "=" + value_input;
  }
  return [code, Blockly.Python.ORDER_ATOMIC];
};


/*
var val_Json = {
  "type": "val",
  "message0": "val %1",
  "args0": [
    {
      "type": "input_value",
      "name": "val"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 150,
  "tooltip": "",
  "helpUrl": ""
}
Blockly.Blocks['val'] = {
  init: function() {
    this.jsonInit(val_Json );
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return "val";
    });
  }
};
Blockly.Python['val'] = function(block) {
  var value_val = Blockly.Python.valueToCode(block, 'val', Blockly.Python.ORDER_NONE);
  // TODO: Assemble Python into code variable.
  var code = "robot.val"+value_val+"\n";
  return code;
};

*/
var dic_key_Json = {
  "type": "dic_key",
  "message0": "%1 [ %2 ]",
  "args0": [
    {
      "type": "input_value",
      "name": "var"
    },
    {
      "type": "input_value",
      "name": "key"
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": 330,
  "tooltip": "",
  "helpUrl": ""
}
Blockly.Blocks['dic_key'] = {
  init: function() {
    this.jsonInit(dic_key_Json );
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return "";
    });
  }
};
Blockly.Python['dic_key'] = function(block) {
  var value_var = Blockly.Python.valueToCode(block, 'var', Blockly.Python.ORDER_NONE);
  var value_key = Blockly.Python.valueToCode(block, 'key', Blockly.Python.ORDER_NONE);
  // TODO: Assemble Python into code variable.
  var code = value_var + "["+value_key +"]";
  // TODO: Change ORDER_ATOMIC to the correct strength.
  return [code, Blockly.Python.ORDER_ATOMIC];
};


var set_Json = {
  "type": "set",
  "message0": "%1 = %2",
  "args0": [
    {
      "type": "input_value",
      "name": "a"
    },
    {
      "type": "input_value",
      "name": "b"
    }
  ],
  "inputsInline": true,
  "previousStatement": null,
  "nextStatement": null,
  "colour": 90,
  "tooltip": "",
  "helpUrl": ""
}
Blockly.Blocks['set'] = {
  init: function() {
    this.jsonInit(set_Json );
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return "Set a = b";
    });
  }
};
Blockly.Python['set'] = function(block) {
  var value_a = Blockly.Python.valueToCode(block, 'a', Blockly.Python.ORDER_NONE);
  var value_b = Blockly.Python.valueToCode(block, 'b', Blockly.Python.ORDER_NONE);
  // TODO: Assemble Python into code variable.
  var code = value_a + ' = ' + value_b + '\n';
  return code;
};


var method_Json = {
  "type": "method",
  "message0": "def %1 %2 %3",
  "args0": [
    {
      "type": "field_input",
      "name": "name",
      "text": "main(robot)"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "statement"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 195,
  "tooltip": "",
  "helpUrl": ""
}
Blockly.Blocks['method'] = {
  init: function() {
    this.jsonInit(method_Json );
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return "define method (functions)";
    });
  }
};

Blockly.Python['method'] = function(block) {
  var text_name = block.getFieldValue('name');
  var statements_statement = Blockly.Python.statementToCode(block, 'statement');
  // TODO: Assemble Python into code variable.
  var code = 'def '+text_name +":\n"+ del_start_space(statements_statement)+"\n";
  return code;
};


function del_start_space(str){
  while(str.indexOf(" ")==0){
    str= str.slice(1,str.length)
  }
  while(str.lastIndexOf("\n ")!=-1){
    let k = str.lastIndexOf("\n ")
    str = str.slice(0,k+1)+str.slice(Math.min(k+3,str.length),str.length)
  }
  return str
}


function create_list_blocks(name){//javad
    var list_Json = {
      "type": name + "_list",
      "message0": "%1 = %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "label",
          "options": lists[name+"_list"]
        },
                {
          "type": "input_value",
          "name": "input",
        }
      ],
      "inputsInline": false,
      "output": null,
      "colour": 75,
      "tooltip": "",
      "helpUrl": ""
    }

    Blockly.Blocks[ name + '_list' ] = {
      init: function() {
        this.jsonInit(list_Json);
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function() {
          return name + ' list' ;
        });
      }
    };
    Blockly.Python[name+'_list'] = function(block) {
      var dropdown = block.getFieldValue('label');
      var value_input = Blockly.Python.valueToCode(block, 'input', Blockly.JavaScript.ORDER_NONE);
      // TODO: Assemble Python into code variable.
      var code = dropdown;
      if(value_input){
        code += "=" + value_input;
      }
      // TODO: Change ORDER_ATOMIC to the correct strength.
      return [code, Blockly.Python.ORDER_ATOMIC];
    };
}

function create_number_drpdown_blocks(name,n,zero=0){
  let l = []
  let title =  name + "_drpdown";
  for(let i=zero;i<n;i++){
    l.push([String(i),String(i)])
  } 
  var list_Json = {
    "type": title,
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "label",
        "options": l
      }
    ],
    "inputsInline": true,
    "output": "label",
    "colour": 225,
    "tooltip": "",
    "helpUrl": ""
  }

    Blockly.Blocks[  title ] = {
      init: function() {
        this.jsonInit(list_Json);
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function() {
          return  title ;
        });
      }
    };
    Blockly.Python[ title] = function(block) {
      var dropdown = block.getFieldValue('label');
      // TODO: Assemble Python into code variable.
      var code = dropdown;
      // TODO: Change ORDER_ATOMIC to the correct strength.
      return [code, Blockly.Python.ORDER_ATOMIC];
    };
}

function create_casual_function_blocks_no_inputs(name){

    Blockly.Blocks[name] = {
      init: function() {
        this.jsonInit({
          "type": name,
          "message0": "%1" + name ,
          "args0": [
            {
              "type": "input_value",
              "name": "ret"
            }
          ],
          "inputsInline": true,
          "previousStatement": null,
          "nextStatement": null,
          "colour": 285,
          "tooltip": "",
          "helpUrl": ""
        });
      }
    };

  Blockly.Python[name] = function(block) {
    var value_ret = Blockly.Python.valueToCode(block, 'ret', Blockly.Python.ORDER_NONE);
    var code = 'robot.'+name+'()\n';
    if(value_ret!=""){
      code = value_ret + " = " + code
    }
    return code;
  };

}

function create_casual_function_blocks(name, dbutton = false, dbutton_type = null){

    let create_image_field = function(b){

      if (b.inputList[0].fieldRow.length == 0 && dbutton) {
        let block = b;
        let onclick = function(){

            let comp_pos = dbutton_type;
            let i=0;
            for(i=0;i<5+ND_count ;i++){
              if(i<5||ND[i]){
                let name_joint = "j" + i;
                let name_xyz = xyz_names[i];
                let name_f = "";
                let value = 0.0;
                let comp_pos = position(dbutton_type);

                if(!(typeof comp_pos[name_joint]==='undefined')){
                  value = comp_pos[name_joint];
                  name_f = name_joint;
                }
                if(!(typeof comp_pos[name_xyz]==='undefined')){
                  value = comp_pos[name_xyz];
                  name_f = name_xyz;
                }

                let last_input = block.inputList[block.inputList.length - 1];
                let last_input_number = Number(last_input.name.split("ADD")[1])
                let new_input_string = "ADD"+(last_input_number+1);
                let new_input =  block.appendValueInput(new_input_string);
                block.inputCounter ++;
                let xml = Blockly.Xml.textToDom(`<xml>                
                  <block type="coord_list"><field name="label">`+name_f+`</field>
                  <value name="input">
                  <block type="math_number"><field name="NUM">`+value.toFixed(3)+`</field> </block>
                  </value>
                  </block></xml>`
                );
                let added_block_id=Blockly.Xml.appendDomToWorkspace(xml,workspace)
                let added_block = workspace.getBlockById(added_block_id);
                last_input.connection.connect(added_block.outputConnection);
              }
            }


        }
       b.image_field = new  Blockly.FieldImage("https://www.gstatic.com/codesite/ph/images/star_on.gif", 15, 15,"*",onclick);
       b.inputList[0].appendField(b.image_field);//this.image_field);
      }
    }

    Blockly.Blocks[name] = {

      inputCounter: 1,

      minInputs: 1,

      init: function() { 
        /*
        this.jsonInit({
          "type": name,
          "message0": "%1 "+name+" %2",
          "args0": [
            {
              "type": "input_value",
              "name": "ret"
            },
            {
              "type": "input_value",
              "name": "ADD0"
            }
          ],
          "inputsInline": true,
          "previousStatement": null,
          "nextStatement": null,
          "colour": 285,
          "tooltip": "",
          "helpUrl": ""
        });*/
        this.setHelpUrl('');
        this.setColour(285);
        this.appendValueInput('ret');
        this.appendValueInput('ADD0').appendField(name);
        this.setTooltip('');
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);

        if(dbutton){
         create_image_field(this)
        }

      },

      mutationToDom: function() {
        const container = Blockly.utils.xml.createElement('mutation');
        const inputNames = this.inputList.map((input) => input.name).join(',');
        container.setAttribute('inputs', inputNames);
        container.setAttribute('next', this.inputCounter);
        return container;
      },

      domToMutation: function(xmlElement) {
        if (xmlElement.getAttribute('inputs')) {
          this.deserializeInputs_(xmlElement);
        } else {
          this.deserializeCounts_(xmlElement);
        }
      },

      deserializeInputs_: function(xmlElement) {
        const items = xmlElement.getAttribute('inputs');
        if (items) {
          const inputNames = items.split(',');
          this.inputList = [];
          inputNames.forEach((name) => this.appendValueInput(name));
          create_image_field(this)
          for(let i=0 ; i <this.inputList.length; i++){
            if(this.inputList[i].name.indexOf("ADD")==0){
              this.inputList[i].appendField(name);
              break;
            }
          }

        }
        const next = parseInt(xmlElement.getAttribute('next'));
        this.inputCounter = next;
      },

      deserializeCounts_: function(xmlElement) {
        const itemCount = Math.max( parseInt(xmlElement.getAttribute('items'), 10)+1, this.minInputs);
        for (let i = this.minInputs; i < itemCount ; i++) {
          this.appendValueInput('ADD' + i);
        }
        this.inputCounter = itemCount;
      },

      getIndexForNewInput: function(connection) {
        if (!connection.targetConnection) {
          // this connection is available
          return null;
        }

        let connectionIndex;
        for (let i = 0; i < this.inputList.length; i++) {
          if (this.inputList[i].connection == connection) {
            connectionIndex = i;
          }
        }

        if (connectionIndex == this.inputList.length - 1) {
          // this connection is the last one and already has a block in it, so
          // we should add a new connection at the end.
          return this.inputList.length + 1;
        }

        const nextInput = this.inputList[connectionIndex + 1];
        const nextConnection = nextInput && nextInput.connection.targetConnection;
        if (nextConnection && !nextConnection.sourceBlock_.isInsertionMarker()) {
          return connectionIndex + 1;
        }

        // Don't add new connection
        return null;
      },

      onPendingConnection: function(connection) {
        const insertIndex = this.getIndexForNewInput(connection);
        if (insertIndex == null) {
          return;
        }
        this.appendValueInput('ADD' + (this.inputCounter++));
        this.moveNumberedInputBefore(this.inputList.length - 1, insertIndex);
      },


      finalizeConnections: function() {
        if (this.inputList.length > this.minInputs + 1) {
          let toRemove = [];
          this.inputList.forEach((input) => {
            const targetConnection = input.connection.targetConnection;
            if (!targetConnection && input.name!="ret") {
              toRemove.push(input.name);
            }
          });

          if (this.inputList.length - toRemove.length < this.minInputs+1) {
            // Always show at least two inputs
            toRemove = toRemove.slice(this.minInputs);
          }
          this.inputCounter = this.inputCounter - toRemove.length;
          toRemove.forEach((inputName) => this.removeInput(inputName));
          // The first input should have the block text. If we removed the
          // first input, add the block text to the new first input.

          for(let i=0 ; i <this.inputList.length; i++){
            if(this.inputList[i].name.indexOf("ADD")==0){
              if (this.inputList[i].fieldRow.length == 0) {
                    this.inputList[i].appendField(name);}
              break;
            }
          }
        }               

        let last_element = this.inputList[this.inputList.length-1];
        const last_element_conection = last_element.connection.targetConnection;
        if (last_element_conection) {
            this.appendValueInput('ADD' + (this.inputCounter++));
        }
        let i = -1;
          this.inputList.forEach((input) => {
            if(i>-1){
              input.name = 'ADD'+i;
            }
            i++;
        });
        create_image_field(this);
      }
    };

    Blockly.Python[name] = function(block) {
    var value_ret = Blockly.Python.valueToCode(block, 'ret', Blockly.Python.ORDER_NONE);
    var code = 'robot.'+name+'(';

    let i = 0;//loop over all inputs (other than ret)
    while(Blockly.Python.valueToCode(block, 'ADD'+i, Blockly.Python.ORDER_NONE)){
      if(i!=0)code+=", "
      code += Blockly.Python.valueToCode(block, 'ADD'+i, Blockly.Python.ORDER_NONE);
      i += 1;
    }

    code = code + ')\n';

    if(value_ret!=""){
      code = value_ret + " = " + code
    }

    return code;
  };

}

Blockly.Blocks["function_call"] = {
      init: function() {
        this.jsonInit({
          "type": "function_call",
          "message0": "%1 %2 %3",
          "args0":  [
            {
              "type": "field_input",
              "name": "func",
              "text": "function"
            },
             {
              "type": "input_value",
              "name": "ret"
            },
            
            {
              "type": "input_statement",
              "name": "inputs"//,
              //"check": "set_label"
            }
          ],
          "inputsInline": true,
          "previousStatement": null,
          "nextStatement": null,
          "colour": 320,
          "tooltip": "",
          "helpUrl": ""
        });
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function() {
          return "function_call";
        });
      }
    };
  Blockly.Python["function_call"] = function(block) {
    var value_ret = Blockly.Python.valueToCode(block, 'ret', Blockly.Python.ORDER_NONE);
    var text_func = block.getFieldValue('func');
    var code = text_func+'(';

      var statements_inputs = Blockly.Python.statementToCode(block, 'inputs');
      if(statements_inputs.indexOf("  ")==0){
        statements_inputs = statements_inputs.slice(2,statements_inputs.length)
      }

      let f = statements_inputs.lastIndexOf(',');
      if(f!=-1)
       code = code +statements_inputs.slice(0,f);
      else
        code = code +statements_inputs;


    code = code + ')\n';

    if(value_ret!=""){
      code = value_ret + " = " + code
    }

    return code;
  };


function create_num_input_blocks(name,min,max,step){
    Blockly.Blocks[name] = {
      init: function() {
        this.jsonInit({
      "type": name,
      "message0": "%1",
      "args0": [
        {
          "type": "field_number",
          "name": "NUM",
          "value": 0,
          "min": min,
          "max": max,
          "precision": step
        }
      ],
      "inputsInline": true,
      "output": null,
      "colour": 225,
      "tooltip": "",
      "helpUrl": ""
      });
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function() {
          return name;
        });
      }
    };
  Blockly.Python[name] = function(block) {
    var number_num = block.getFieldValue('NUM');
    var code = ''+number_num;
    return [code, Blockly.Python.ORDER_NONE];
};
}

create_list_blocks('val');
create_list_blocks('probe');
create_list_blocks('pwm');
create_list_blocks('output');

create_list_blocks('cmd');
create_list_blocks('rapid');
create_list_blocks('coord');
create_list_blocks('mcoord');


create_num_input_blocks('num_0_inf_0',0,10000,0.0001);
create_num_input_blocks('num_0_inf_1',0,10000000,1);
create_num_input_blocks('num_1_inf_1',1,10000000,1);
create_num_input_blocks('num_1_inf_0',1,10000000,0.0001);
create_num_input_blocks('num_0_1_1',0,1,1);
create_num_input_blocks('num_freq',0,120000000,0.001);
create_num_input_blocks('num_duty',0,100,0.001);

create_number_drpdown_blocks("5",5);
create_number_drpdown_blocks("8",8);
create_number_drpdown_blocks("16",16);
create_number_drpdown_blocks("5_8",8,5);
create_number_drpdown_blocks("5_7",7,5);
create_number_drpdown_blocks("0_1",2,0);

create_casual_function_blocks('wait');
create_casual_function_blocks('lmove',true,"xyz");
create_casual_function_blocks('jmove',true,"joint");
create_casual_function_blocks('rmove',true,"xyz");
create_casual_function_blocks('cmove',true,"xyz");

create_casual_function_blocks('connect');
create_casual_function_blocks_no_inputs('close');
create_casual_function_blocks('play');
create_casual_function_blocks('play_script');
create_casual_function_blocks('play_json');
create_casual_function_blocks('play_dict');

create_casual_function_blocks('log');
create_casual_function_blocks('logger_setup');
create_casual_function_blocks('rand_id');
create_casual_function_blocks('val');
create_casual_function_blocks('probe');
create_casual_function_blocks('iprobe');
create_casual_function_blocks('halt');
create_casual_function_blocks('sleep');
create_casual_function_blocks_no_inputs('version');
create_casual_function_blocks_no_inputs('uid');
create_casual_function_blocks_no_inputs('track_cmd');
create_casual_function_blocks_no_inputs('last_cmd');
create_casual_function_blocks_no_inputs('last_msg');
create_casual_function_blocks_no_inputs('union');

create_casual_function_blocks_no_inputs('get_alarm');
create_casual_function_blocks('set_alarm');
create_casual_function_blocks_no_inputs('get_all_joint');
create_casual_function_blocks('get_joint');
create_casual_function_blocks('set_joint');
create_casual_function_blocks_no_inputs('get_all_pose');
create_casual_function_blocks('get_pose');
create_casual_function_blocks_no_inputs('get_toollength');
create_casual_function_blocks('set_toollength');
create_casual_function_blocks_no_inputs('get_all_output');
create_casual_function_blocks('get_output');
create_casual_function_blocks('set_output');
create_casual_function_blocks_no_inputs('get_all_input');
create_casual_function_blocks('get_input');
create_casual_function_blocks('get_pwm');
create_casual_function_blocks('set_pwm');
create_casual_function_blocks('get_freq');
create_casual_function_blocks('set_freq');
create_casual_function_blocks('get_duty');
create_casual_function_blocks('set_duty');
create_casual_function_blocks('get_adc');
create_casual_function_blocks_no_inputs('get_motor');
create_casual_function_blocks('set_motor');

create_casual_function_blocks('get_axis');
create_casual_function_blocks('set_axis');
create_casual_function_blocks('get_axis_ratio');
create_casual_function_blocks('set_axis_ratio');
create_casual_function_blocks('get_pid');
create_casual_function_blocks('set_pid');

create_casual_function_blocks_no_inputs('get_error');
create_casual_function_blocks('set_error');

create_casual_function_blocks_no_inputs('get_all_event');
create_casual_function_blocks_no_inputs('clear_all_event');
create_casual_function_blocks('add_event');
create_casual_function_blocks('clear_event');



Blockly.InsertionMarkerManager.prototype.update = function(dxy, dragTarget) {
  const newCandidate = this.getCandidate_(dxy);

  this.wouldDeleteBlock_ = this.shouldDelete_(!!newCandidate, dragTarget);

  const shouldUpdate =
      this.wouldDeleteBlock_ || this.shouldUpdatePreviews_(newCandidate, dxy);

  if (shouldUpdate) {
    // Begin monkey patch
    if (newCandidate &&
        newCandidate.closest &&
        newCandidate.closest.sourceBlock_.onPendingConnection) {
      newCandidate.closest.sourceBlock_
          .onPendingConnection(newCandidate.closest);
      if (!this.pendingBlocks) {
        this.pendingBlocks = new Set();
      }
      this.pendingBlocks.add(newCandidate.closest.sourceBlock_);
    }
    // End monkey patch
    // Don't fire events for insertion marker creation or movement.
    Blockly.Events.disable();
    this.maybeHidePreview_(newCandidate);
    this.maybeShowPreview_(newCandidate);
    Blockly.Events.enable();
  }
};

const oldDispose = Blockly.InsertionMarkerManager.prototype.dispose;
Blockly.InsertionMarkerManager.prototype.dispose = function() {
  if (this.pendingBlocks) {
    this.pendingBlocks.forEach((block) => {
      if (block.finalizeConnections) {
        block.finalizeConnections();
      }
    });
  }
  oldDispose.call(this);
};


