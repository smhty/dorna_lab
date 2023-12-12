const image_input = document.querySelector("#image-input")
const image_output = document.querySelector("#image-output")
let image_array = []

const image_reader = new FileReader();

image_reader.onload = function (e) {
  image_array.push(e.target.result);
  update_upload_image_preview();
};

function update_upload_image_preview(){
  let img_table = document.getElementById("image-preview"); 
  img_table.innerHTML = "";

  var row; 
  for (let i = 0; i < image_array.length; i++) {
    const imageSrc = image_array[i];

    // Create a new row and cell
    if(i%4==0) row = img_table.insertRow();
    const cell = row.insertCell();

    // Create an image element and set its source
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = 'Image ' + (i + 1);
    img.height = 100;
    img.width = 100;
    img.num = i;
    img.addEventListener('click', function() {
      const in_im = new image_input_node(this.num,process);
      rete_editor.addNode(in_im);
    });

    // Append the image to the cell
    cell.appendChild(img);
  }

}

image_input.addEventListener("change", (e) => {
    const file = image_input.files
    image_reader.readAsDataURL(file[0]);
})