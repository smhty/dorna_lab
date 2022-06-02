// ===================== VALUES ===================
let buttons = [],   
    is_connected = false, 
    clicked_button_index, 
    gamepad_loop, 
    joy_button, 
    joy_axis, 
    clicked_listItem_index, 
    gamepad_pressed_flag = false;
let joint_buttons = Object.create(null),
    line_buttons = Object.create(null);
let array_map = [
    "j0p",
    "j0m",
    "j1p",
    "j1m",
    "j2p",
    "j2m",
    "j3p",
    "j3m",
    "j4p",
    "j4m",
    "j5p",
    "j5m",
    "j6p",
    "j6m",
    "j7p",
    "j7m",
    "xp",
    "xm",
    "yp",
    "ym",
    "zp",
    "zm",
    "ap",
    "am",
    "bp",
    "bm",
    "cp",
    "cm",
    "dp",
    "dm",
    "ep",
    "em",
    "halt",
    "play_script",
    "motor",
    "record_joint",
    "record_line"];


let local_information = {
    j0p: String,
    j0m: String,
    j1p: String,
    j1m: String,
    j2p: String,
    j2m: String,
    j3p: String,
    j3m: String,
    j4p: String,
    j4m: String,
    j5p: String,
    j5m: String,
    j6p: String,
    j6m: String,
    j7p: String,
    j7m: String,
    xp: String,
    xm: String,
    yp: String,
    ym: String,
    zp: String,
    zm: String,
    ap: String,
    am: String,
    bp: String,
    bm: String,
    cp: String,
    cm: String,
    dp: String,
    dm: String,
    ep: String,
    em: String,
    halt:String,
    play_script: String,
    motor: String,
    record_joint: String,
    record_line: String
}
let keyboard_default = {
    "am": 83,
    "ap": 87,
    "bm": 70,
    "bp": 72,
    "cm": 71,
    "cp": 84,
    "dm": 74,
    "dp": 76,
    "em": 75,
    "ep": 73,
    "halt": 49,
    "j0m": 37,
    "j0p": 39,
    "j1m": 40,
    "j1p": 38,
    "j2m": 65,
    "j2p": 68,
    "j3m": 83,
    "j3p": 87,
    "j4m": 70,
    "j4p": 72,
    "j5m": 71,
    "j5p": 84,
    "j6m": 74,
    "j6p": 76,
    "j7m": 75,
    "j7p": 73,
    "motor": 81,
    "play_script": 50,
    "record_joint": 51,
    "record_line": 52,
    "xm": 37,
    "xp": 39,
    "ym": 40,
    "yp": 38,
    "zm": 65,
    "zp": 68
}
let gamepad_default = {
    "am": -7,
    "ap": -8,
    "bm": 14,
    "bp": 15,
    "cm": 13,
    "cp": 12,
    "dm": 4,
    "dp": 5,
    "em": 6,
    "ep": 7,
    "halt": 1,
    "j0m": -2,
    "j0p": -1,
    "j1m": -3,
    "j1p": -4,
    "j2m": -6,
    "j2p": -5,
    "j3m": -7,
    "j3p": -8,
    "j4m": 14,
    "j4p": 15,
    "j5m": 13,
    "j5p": 12,
    "j6m": 4,
    "j6p": 5,
    "j7m": 6,
    "j7p": 7,
    "motor": 9,
    "play_script": 0,
    "record_joint": 2,
    "record_line": 3,
    "xm": -2,
    "xp": -1,
    "ym": -3,
    "yp": -4,
    "zm": -6,
    "zp": -5
}

let dropdown_buttons = {
    jk: "joint-keyboard",
    jg: "joint-gamepad",
    lk: "line-keyboard",
    lg: "line-gamepad",
    ck: "command-keyboard",
    cg: "command-gamepad"
}
let keyboard_map = [
    "", // [0]
    "", // [1]
    "", // [2]
    "CANCEL", // [3]
    "", // [4]
    "", // [5]
    "HELP", // [6]
    "", // [7]
    "BACK_SPACE", // [8]
    "TAB", // [9]
    "", // [10]
    "", // [11]
    "CLEAR", // [12]
    "ENTER", // [13]
    "ENTER_SPECIAL", // [14]
    "", // [15]
    "SHIFT", // [16]
    "CONTROL", // [17]
    "ALT", // [18]
    "PAUSE", // [19]
    "CAPS_LOCK", // [20]
    "KANA", // [21]
    "EISU", // [22]
    "JUNJA", // [23]
    "FINAL", // [24]
    "HANJA", // [25]
    "", // [26]
    "ESCAPE", // [27]
    "CONVERT", // [28]
    "NONCONVERT", // [29]
    "ACCEPT", // [30]
    "MODECHANGE", // [31]
    "SPACE", // [32]
    "PAGE_UP", // [33]
    "PAGE_DOWN", // [34]
    "END", // [35]
    "HOME", // [36]
    "LEFT", // [37]
    "UP", // [38]
    "RIGHT", // [39]
    "DOWN", // [40]
    "SELECT", // [41]
    "PRINT", // [42]
    "EXECUTE", // [43]
    "PRINTSCREEN", // [44]
    "INSERT", // [45]
    "DELETE", // [46]
    "", // [47]
    "0", // [48]
    "1", // [49]
    "2", // [50]
    "3", // [51]
    "4", // [52]
    "5", // [53]
    "6", // [54]
    "7", // [55]
    "8", // [56]
    "9", // [57]
    "COLON", // [58]
    "SEMICOLON", // [59]
    "LESS_THAN", // [60]
    "EQUALS", // [61]
    "GREATER_THAN", // [62]
    "QUESTION_MARK", // [63]
    "AT", // [64]
    "A", // [65]
    "B", // [66]
    "C", // [67]
    "D", // [68]
    "E", // [69]
    "F", // [70]
    "G", // [71]
    "H", // [72]
    "I", // [73]
    "J", // [74]
    "K", // [75]
    "L", // [76]
    "M", // [77]
    "N", // [78]
    "O", // [79]
    "P", // [80]
    "Q", // [81]
    "R", // [82]
    "S", // [83]
    "T", // [84]
    "U", // [85]
    "V", // [86]
    "W", // [87]
    "X", // [88]
    "Y", // [89]
    "Z", // [90]
    "OS_KEY", // [91] Windows Key (Windows) or Command Key (Mac)
    "", // [92]
    "CONTEXT_MENU", // [93]
    "", // [94]
    "SLEEP", // [95]
    "NUMPAD0", // [96]
    "NUMPAD1", // [97]
    "NUMPAD2", // [98]
    "NUMPAD3", // [99]
    "NUMPAD4", // [100]
    "NUMPAD5", // [101]
    "NUMPAD6", // [102]
    "NUMPAD7", // [103]
    "NUMPAD8", // [104]
    "NUMPAD9", // [105]
    "MULTIPLY", // [106]
    "ADD", // [107]
    "SEPARATOR", // [108]
    "SUBTRACT", // [109]
    "DECIMAL", // [110]
    "DIVIDE", // [111]
    "F1", // [112]
    "F2", // [113]
    "F3", // [114]
    "F4", // [115]
    "F5", // [116]
    "F6", // [117]
    "F7", // [118]
    "F8", // [119]
    "F9", // [120]
    "F10", // [121]
    "F11", // [122]
    "F12", // [123]
    "F13", // [124]
    "F14", // [125]
    "F15", // [126]
    "F16", // [127]
    "F17", // [128]
    "F18", // [129]
    "F19", // [130]
    "F20", // [131]
    "F21", // [132]
    "F22", // [133]
    "F23", // [134]
    "F24", // [135]
    "", // [136]
    "", // [137]
    "", // [138]
    "", // [139]
    "", // [140]
    "", // [141]
    "", // [142]
    "", // [143]
    "NUM_LOCK", // [144]
    "SCROLL_LOCK", // [145]
    "WIN_OEM_FJ_JISHO", // [146]
    "WIN_OEM_FJ_MASSHOU", // [147]
    "WIN_OEM_FJ_TOUROKU", // [148]
    "WIN_OEM_FJ_LOYA", // [149]
    "WIN_OEM_FJ_ROYA", // [150]
    "", // [151]
    "", // [152]
    "", // [153]
    "", // [154]
    "", // [155]
    "", // [156]
    "", // [157]
    "", // [158]
    "", // [159]
    "CIRCUMFLEX", // [160]
    "EXCLAMATION", // [161]
    "DOUBLE_QUOTE", // [162]
    "HASH", // [163]
    "DOLLAR", // [164]
    "PERCENT", // [165]
    "AMPERSAND", // [166]
    "UNDERSCORE", // [167]
    "OPEN_PAREN", // [168]
    "CLOSE_PAREN", // [169]
    "ASTERISK", // [170]
    "PLUS", // [171]
    "PIPE", // [172]
    "HYPHEN_MINUS", // [173]
    "OPEN_CURLY_BRACKET", // [174]
    "CLOSE_CURLY_BRACKET", // [175]
    "TILDE", // [176]
    "", // [177]
    "", // [178]
    "", // [179]
    "", // [180]
    "VOLUME_MUTE", // [181]
    "VOLUME_DOWN", // [182]
    "VOLUME_UP", // [183]
    "", // [184]
    "", // [185]
    "SEMICOLON", // [186]
    "EQUALS", // [187]
    "COMMA", // [188]
    "MINUS", // [189]
    "PERIOD", // [190]
    "SLASH", // [191]
    "BACK_QUOTE", // [192]
    "", // [193]
    "", // [194]
    "", // [195]
    "", // [196]
    "", // [197]
    "", // [198]
    "", // [199]
    "", // [200]
    "", // [201]
    "", // [202]
    "", // [203]
    "", // [204]
    "", // [205]
    "", // [206]
    "", // [207]
    "", // [208]
    "", // [209]
    "", // [210]
    "", // [211]
    "", // [212]
    "", // [213]
    "", // [214]
    "", // [215]
    "", // [216]
    "", // [217]
    "", // [218]
    "OPEN_BRACKET", // [219]
    "BACK_SLASH", // [220]
    "CLOSE_BRACKET", // [221]
    "QUOTE", // [222]
    "", // [223]
    "META", // [224]
    "ALTGR", // [225]
    "", // [226]
    "WIN_ICO_HELP", // [227]
    "WIN_ICO_00", // [228]
    "", // [229]
    "WIN_ICO_CLEAR", // [230]
    "", // [231]
    "", // [232]
    "WIN_OEM_RESET", // [233]
    "WIN_OEM_JUMP", // [234]
    "WIN_OEM_PA1", // [235]
    "WIN_OEM_PA2", // [236]
    "WIN_OEM_PA3", // [237]
    "WIN_OEM_WSCTRL", // [238]
    "WIN_OEM_CUSEL", // [239]
    "WIN_OEM_ATTN", // [240]
    "WIN_OEM_FINISH", // [241]
    "WIN_OEM_COPY", // [242]
    "WIN_OEM_AUTO", // [243]
    "WIN_OEM_ENLW", // [244]
    "WIN_OEM_BACKTAB", // [245]
    "ATTN", // [246]
    "CRSEL", // [247]
    "EXSEL", // [248]
    "EREOF", // [249]
    "PLAY", // [250]
    "ZOOM", // [251]
    "", // [252]
    "PA1", // [253]
    "WIN_OEM_CLEAR", // [254]
    "" // [255]
];
let key_map_exceptions = [
    "BACK_QUOTE",
    "TAB",
    "CAPS_LOCK",
    "SHIFT",
    "CONTROL",
    "ALT",
    "SPACE",
    "CONTEXT_MENU",
    "ENTER",
    "BACK_SLASH",
    "BACK_SPACE",
    "F1",
    "F2",
    "F3",
    "F4",
    "F5",
    "F6",
    "F7",
    "F8",
    "F9",
    "F10",
    "F11",
    "F12",
    "END",
    "PAGE_DOWN",
    "PAGE_UP",
    "HOME",
    "NUM_LOCK"
]
// ================ SETUP FUNCTIONS ================
get_buttons();
first_init_keyboard();
first_init_gamepad();
keyboard_setup();
joystick_setup();
erase_button_individually();
clear_all_button();
set_default_button();
// gamepad main functions that should be called first of all
window.addEventListener("gamepadconnected", function(e) {
    gamepad_connection_setup()
});
window.addEventListener("gamepaddisconnected", function(e) {
    gamepad_disconnection_setup()
});
// ============= FUNCTIONS DEFINITION ==============
// button setup
function get_buttons() {
    buttons = document.querySelectorAll(".my-button")
}
function erase_button_individually() {
    document.querySelectorAll(".eraser-button").forEach((e) => {
        e.addEventListener("click", () => {
            e.previousElementSibling.value = null;
            e.previousElementSibling.innerHTML = "..."
            update_storage()
        });
    })
}
function clear_all_button(){
    document.querySelectorAll(".clear-all").forEach((clear, i) => {
        clear.addEventListener("click", () => {
            document.querySelectorAll(".my-button-" + Object.values(dropdown_buttons)[i]).forEach((e) => {
                e.value = null;
                e.innerHTML = "..."
            });
            update_storage();
        })
    })
}
function set_default_button(){
 /*
    document.querySelectorAll(".set-default").forEach((set,i)=>{
        set.addEventListener("click", () => {
            document.querySelectorAll(".my-button-" + Object.values(dropdown_buttons)[i]).forEach((e, index) => {
                split_at_line(gamepad_default)
                if(e.classList.contains("my-button-joint-gamepad")){
                    let temp = check_params(Object.values(joint_buttons)[index])
                    e.value = temp[2];
                    e.innerHTML = temp[0] + temp[1]
                }
                if(e.classList.contains("my-button-line-gamepad")){
                    let temp = check_params(Object.values(line_buttons)[index])
                    e.value = temp[2];
                    e.innerHTML = temp[0] + temp[1]
                }
                split_at_line(keyboard_default)
                if(e.classList.contains("my-button-joint-keyboard")){
                    e.value = Object.values(joint_buttons)[index];
                    e.innerHTML = keyboard_map[Object.values(joint_buttons)[index]]
                }
                if(e.classList.contains("my-button-line-keyboard")){
                    e.value = Object.values(line_buttons)[index];
                    e.innerHTML = keyboard_map[Object.values(line_buttons)[index]]
                }
                update_storage();
            });
        })
    })
*/
}
// gamepad setup
function gamepad_connection_setup() {
    //show_dismiss_alert('success', 'Gamepad connected!', 3000)
    //$('.toast_joystick').toast('show')
    add_note("joystick_connected")
    enable_disable(false, "contents")
    is_connected = true;
    gamepad_loop = setInterval(joystick_loop, 70); 
    update_storage()
    // get button indexes from gamepad
    gamepad_agent.press.add(e => {
        if(gamepad_pressed_flag){
            gamepad_pressed_flag = false;
            buttons[clicked_listItem_index].innerHTML = check_params(e)[0] + check_params(e)[1];
            buttons[clicked_listItem_index].value = check_params(e)[2];
            update_storage()
            $(".controller-modal").modal('hide');
        }
    })
}
function gamepad_disconnection_setup() {
    //show_dismiss_alert('danger', 'Gamepad disconnected!', 3000)
    //$('.toast_diconnectjoystick').toast('show')
    add_note("joystick_disconnected")
    enable_disable(true, "none")
    is_connected = false;
    clearInterval(gamepad_loop);
}
function joystick_loop() {
    joy_button = navigator.getGamepads()[0].buttons;
    joy_axis = navigator.getGamepads()[0].axes;
};
function joystick_setup() {
    buttons.forEach((e, i) => {
        if(e.classList.contains("my-button-gamepad")){
            e.addEventListener("click", () => {
                setTimeout(() => {
                    gamepad_pressed_flag = true;
                    clicked_listItem_index = i;
                }, 500);
            })
        }
    })
}
function first_init_gamepad() {
    enable_disable(true, "none");
    var joystick_local_storage = get_from_storage_joystick();
    document.querySelectorAll(".my-button-gamepad").forEach((button, i) => {
        let temp;
        joystick_local_storage ? temp = check_params(Object.values(joystick_local_storage)[i]) : temp = check_params(gamepad_default[array_map[i]]);
        button.value = temp[2];
        button.innerHTML = button.value == "null" ? "..." : temp[0] + temp[1];
    })
    update_storage();
}
// keyboard setup
function first_init_keyboard() {
    var keyboard_local_storage = get_from_storage_keyboard()
    document.querySelectorAll(".my-button-keyboard").forEach((button, i) => {
        let temp;
        keyboard_local_storage ? temp = Object.values(keyboard_local_storage)[i] : temp = keyboard_default[array_map[i]];
        button.value = temp;
        button.innerHTML = button.value != "null" ? keyboard_map[temp] : "...";
    })
    //update_storage();
}
function keyboard_setup() {
    for(let i in buttons){
        if(buttons[i] && typeof(buttons[i]) === "object" && buttons[i].classList.contains("my-button-keyboard")){
            buttons[i]
            .addEventListener("click", () => {
                clicked_button_index = i;
                setTimeout(() => {
                    document.body.addEventListener('keydown', any_keyboard_button_pressed);
                }, 500);
            });
        }
    }
}
// getting character from keyboard that called in keyboard_setup()
function any_keyboard_button_pressed(e){
    let char = e.char || e.charCode || e.which; 
    if(key_map_exceptions.indexOf(keyboard_map[char]) === -1){
        if(char != 27){
            buttons[clicked_button_index].innerHTML = keyboard_map[char];
            buttons[clicked_button_index].value = char;  
            update_storage()
        }
        $(".controller-modal").on("hidden.bs.modal", function () { 
            document.body.removeEventListener('keydown', any_keyboard_button_pressed);
        }).modal('hide');
    }
}
// storage
function get_from_storage_keyboard() {
    if(localStorage.getItem("key_values")){ 
        return JSON.parse(localStorage.getItem("key_values"));
    } 
    return null
}
function get_from_storage_joystick() {
    if(localStorage.getItem("joy_values")){
        return JSON.parse(localStorage.getItem("joy_values"));
    }
    return null;
}
function update_storage(){
    let gamepad_info = Object.create(local_information);
    let keyboard_info = Object.create(local_information);
    let j = 0;
    for(let i in keyboard_info) {
        keyboard_info[i] = document.querySelectorAll(".my-button-keyboard")[j++].value
    }
    if(true){//is_connected){
        j = 0;
        for(let i in gamepad_info) {
            gamepad_info[i] =  document.querySelectorAll(".my-button-gamepad")[j++].value
        }
        localStorage.setItem("joy_values", JSON.stringify(gamepad_info))
    }
    localStorage.setItem("key_values", JSON.stringify(keyboard_info))
}
// helper
function split_at_line(input) { 
    var after_line = 0;
    for (var i in input) {
        if(input[i] != undefined){
            after_line ? line_buttons[i] = input[i] : joint_buttons[i] = input[i];
        }
        if (i == "j7m") {
            after_line = true;
        }
    }
}
function enable_disable(input_1, input_2) {//enable disables gamepad settings when game pad connects/disconnects
    /*
    document.querySelectorAll(".my-button-gamepad").forEach(e => {
        e.disabled = input_1;
        e.nextElementSibling.style.display =  input_2;
        document.querySelectorAll(".dropdown-toggle")[2].disabled = document.querySelectorAll(".dropdown-toggle")[4].disabled = input_1
    })
    */
}
function check_params(item) {
    let label, index, event = item;
    if(item >= 0){
        label = "Button ";
        index = item
    } else {
        item = -item;
        index = item % 2 == 1 ? Math.floor((item / 2) + 1) : -(item / 2);
        
        label = "Axis ";
        if(index>0)label = label + "+ ";
        if(index<0)label = label + "- ";
        index = (Math.abs(index) - 1);
    }
    return [label, index, event]
}

$(".set_default_b").on("click", function(e){
    localStorage.removeItem("joy_values");
    localStorage.removeItem("key_values");
    first_init_keyboard();
    first_init_gamepad();
});

