AFRAME.registerComponent("smooth-teleport", {
  schema: {
    target: { type: "vec3" }
  },

  init: function () {
    this.el.addEventListener("click", function () {
      var data = this.components["smooth-teleport"].data;
      var rig = document.querySelector("#rig");

      rig.removeAttribute("animation");

      rig.setAttribute("animation", {
        property: "position",
        to: data.target.x + " " + data.target.y + " " + data.target.z,
        dur: 1200,
        easing: "easeInOutQuad"
      });
    });
  }
});


// window.addEventListener("load", function () {
//   var container = document.querySelector("#studentDesks");

//   var rows = 3;
//   var columns = 3;

//   for (var r = 0; r < rows; r++) {
//     for (var c = 0; c < columns; c++) {
//       var x = -4 + c * 4;
//       var z = 1 + r * 2.7;

//       var desk = document.createElement("a-entity");
//       desk.setAttribute("gltf-model", "#deskModel");
//       desk.setAttribute("position", x + " 0 " + z);
//       desk.setAttribute("rotation", "0 180 0");
//       desk.setAttribute("scale", "1 1 1");
//       container.appendChild(desk);

//       var chair = document.createElement("a-entity");
//       chair.setAttribute("gltf-model", "#chairModel");
//       chair.setAttribute("position", x + " 0 " + (z + 1));
//       chair.setAttribute("rotation", "0 0 0");
//       chair.setAttribute("scale", "1 1 1");
//       container.appendChild(chair);
//     }
//   }
// });
