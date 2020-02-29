const img = new Image();
const w = 300;
const h = 300;

const get_ctx = (klass, _w = w, _h = h) => {
  const canvas = document.querySelector(`.${klass}`);
  const ctx = canvas.getContext("2d");

  canvas.width = ctx.width = _w;
  canvas.height = ctx.height = _h;

  return ctx;
}

const ctx = {
  offset: get_ctx("offset"),
  out: get_ctx("out", w * 3, h),
};

img.onload = () => {
  ctx.offset.drawImage(img, 0, 0, w, h);

  const image_data = ctx.offset.getImageData(0, 0, w, h);

  for (let i = 0; i < image_data.data.length; i += 4) {
    const [x, y] = [i / 4 % w, Math.floor(i / 4 / w)];

    ctx.out.fillStyle = `rgb(${image_data.data[i + 0]}, 0, 0)`;
    ctx.out.fillRect(x, y, 1, 1);

    ctx.out.fillStyle = `rgb(0, ${image_data.data[i + 1]}, 0)`;
    ctx.out.fillRect(x + w, y, 1, 1);

    ctx.out.fillStyle = `rgb(0, 0, ${image_data.data[i + 2]})`;
    ctx.out.fillRect(x + w * 2, y, 1, 1);
  }
}

img.src = "/static/root/img/self_4.jpg";
