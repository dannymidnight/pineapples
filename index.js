var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var pineapples = [];

function init() {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  var image = new Image();
  image.src = "./pineapple.png";
  image.onload = function() {

    pineapples = [];
    for (var i = 0; i < 100; i++) {

      pineapples.push({
        dx: Math.random() * 2 + 1,
        dy: Math.random() * 2 + 1,
        image: image,
        width: image.width * .5,
        height: image.height * .5,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
      });
    }

    window.requestAnimationFrame(draw);
  };
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  window.requestAnimationFrame(draw);

  var pineapple;
  for (var i in pineapples) {
    pineapple = pineapples[i];

    ctx.drawImage(
      pineapple.image,
      pineapple.x,
      pineapple.y,
      pineapple.width,
      pineapple.height
    );

    if ((pineapple.x + pineapple.width) >= canvas.width) {
      pineapple.dx = -1 * Math.abs(pineapple.dx);
    } else if (pineapple.x <= 0) {
      pineapple.dx = Math.abs(pineapple.dx);
    }

    if ((pineapple.y + pineapple.height) >= canvas.height) {
      pineapple.dy = -1 * Math.abs(pineapple.dy);
    } else if (pineapple.y <= 0) {
      pineapple.dy = Math.abs(pineapple.dy);
    }


    pineapple.x += pineapple.dx;
    pineapple.y += pineapple.dy;
  }
}

init();
