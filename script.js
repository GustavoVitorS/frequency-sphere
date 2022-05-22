// Apply whatever modifications you want and create whatever you want //

/**
 * Classes for 3d transformations and projections
 * in a left handed coordinate system (x right, y up, z forward)
 */
(function (NS, undefined) {
  NS.Vector2 = function (x, y) {
    this.x = x;
    this.y = y;
  }

  NS.Vector3 = function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  NS.Vector3.prototype.length = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  NS.Vector3.prototype.normalize = function () {
    var length = this.length();
    return new NS.Vector3(
      this.x / length,
      this.y / length,
      this.z / length
    );
  }
  NS.Vector3.prototype.add = function (v) {
    return new NS.Vector3(
      this.x + v.x,
      this.y + v.y,
      this.z + v.z
    );
  }
  NS.Vector3.prototype.subtract = function (v) {
    return new NS.Vector3(
      this.x - v.x,
      this.y - v.y,
      this.z - v.z
    );
  }
  NS.Vector3.prototype.cross = function (v) {
    return new NS.Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  NS.Matrix = function (m11, m12, m13, tx, m21, m22, m23, ty, m31, m32, m33, tz) {
    this.m11 = m11;
    this.m12 = m12;
    this.m13 = m13;
    this.m21 = m21;
    this.m22 = m22;
    this.m23 = m23;
    this.m31 = m31;
    this.m32 = m32;
    this.m33 = m33;
    this.tx = tx;
    this.ty = ty;
    this.tz = tz;
  }
  NS.Matrix.fromScale = function (s) {
    if (typeof s == 'number') {
      return new NS.Matrix(
        s, 0, 0, 0,
        0, s, 0, 0,
        0, 0, s, 0
      );
    }
    if (s instanceof NS.Vector3) {
      return new NS.Matrix(
        s.x, 0, 0, 0,
        0, s.y, 0, 0,
        0, 0, s.z, 0
      );
    }

    throw new Error('Scale needs to be a Number or a Vector3');
  }
  NS.Matrix.fromRotation = function (r) {
    // Extrinsic euler rotation in order z, x, y
    if (r instanceof NS.Vector3) {
      return new NS.Matrix(
        Math.cos(r.y) * Math.cos(r.z) + Math.sin(r.y) * Math.sin(r.x) * Math.sin(r.z),
        Math.cos(r.z) * Math.sin(r.y) * Math.sin(r.x) - Math.cos(r.y) * Math.sin(r.z),
        Math.cos(r.x) * Math.sin(r.y),
        0,
        Math.cos(r.x) * Math.sin(r.z),
        Math.cos(r.x) * Math.cos(r.z),
        -Math.sin(r.x),
        0,
        Math.cos(r.y) * Math.sin(r.x) * Math.sin(r.z) - Math.cos(r.z) * Math.sin(r.y),
        Math.sin(r.y) * Math.sin(r.z) + Math.cos(r.y) * Math.cos(r.z) * Math.sin(r.x),
        Math.cos(r.y) * Math.cos(r.x),
        0
      );
    }

    throw new Error('Rotation needs to be a Vector3');
  }
  NS.Matrix.fromTranslation = function (t) {
    if (t instanceof NS.Vector3) {
      return new NS.Matrix(
        1, 0, 0, t.x,
        0, 1, 0, t.y,
        0, 0, 1, t.z
      );
    }

    throw new Error('Translation needs to be a Vector3');
  }
  NS.Matrix.lookAt = function (eye, target, up) {
    var z = target.subtract(eye).normalize(),
      x = up.cross(z).normalize(),
      y = z.cross(x);

    var orientation = new NS.Matrix(
      x.x, x.y, x.z, 0,
      y.x, y.y, y.z, 0,
      z.x, z.y, z.z, 0
    );
    var translation = new NS.Matrix(
      1, 0, 0, -eye.x,
      0, 1, 0, -eye.y,
      0, 0, 1, -eye.z
    );

    return orientation.multiply(translation);
  }
  NS.Matrix.prototype.multiply = function (m) {
    if (m instanceof NS.Matrix) {
      return new NS.Matrix(
        this.m11 * m.m11 + this.m12 * m.m21 + this.m13 * m.m31,
        this.m11 * m.m12 + this.m12 * m.m22 + this.m13 * m.m32,
        this.m11 * m.m13 + this.m12 * m.m23 + this.m13 * m.m33,
        this.m11 * m.tx + this.m12 * m.ty + this.m13 * m.tz + this.tx,
        this.m21 * m.m11 + this.m22 * m.m21 + this.m23 * m.m31,
        this.m21 * m.m12 + this.m22 * m.m22 + this.m23 * m.m32,
        this.m21 * m.m13 + this.m22 * m.m23 + this.m23 * m.m33,
        this.m21 * m.tx + this.m22 * m.ty + this.m23 * m.tz + this.ty,
        this.m31 * m.m11 + this.m32 * m.m21 + this.m33 * m.m31,
        this.m31 * m.m12 + this.m32 * m.m22 + this.m33 * m.m32,
        this.m31 * m.m13 + this.m32 * m.m23 + this.m33 * m.m33,
        this.m31 * m.tx + this.m32 * m.ty + this.m33 * m.tz + this.tz
      );
    }
    if (m instanceof NS.Vector3) {
      return new NS.Vector3(
        this.m11 * m.x + this.m12 * m.y + this.m13 * m.z + this.tx,
        this.m21 * m.x + this.m22 * m.y + this.m23 * m.z + this.ty,
        this.m31 * m.x + this.m32 * m.y + this.m33 * m.z + this.tz
      );
    }

    throw new Error('Can only multiply by Matrix or Vector3');
  }
})(window);

(function (canvas) {
  // user settings
  var n = 9,   // distance to near plane
    f = 13,  // distance to far plane
    e = 2.5, // focal length ( 1 / tan(FOV / 2) )
    eye = new Vector3(4, 4, -12),
    lookAt = new Vector3(0, 0, 0);

  var ratio,
    l, // for projection calc (see function project(v) )
    g = (f + n) / (f - n), // for projection calc
    h = (2 * f * n) / (f - n), // for projection calc
    ctx = canvas.getContext('2d');

  // canvas resizing
  function onResize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    ratio = canvas.height / canvas.width;
    l = -e / ratio;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  window.onresize = onResize;
  onResize();

  // camera
  var camera = Matrix.lookAt(eye, lookAt, new Vector3(0, 1, 0));

  // project 3d coord to view frustum
  function project(v) {
    return new Vector3(
      e * v.x / v.z,
      l * v.y / v.z,
      g - h / v.z
    );
  }

  function pointToScreen(v) {
    console.log(v);
    // to camera space
    v = camera.multiply(v);
    console.log(v);
    // to view frustum
    v = project(v);
    console.log(v);
    // to screen coordinates
    v = new Vector3(
      canvas.width * (0.7 * v.x + 0.5),
      canvas.height * (0.5 * v.y + 0.5),
      6 - 4 * (0.5 * v.z + 0.5) // hacky way to adjust 'pixel' size
    );
    console.log(v);
    return v;
  }

  // render a single 3d point on canvas
  function renderPoint(v, color) {
    // hacky way to get all the colors
    // only works if -1 <= x, y, z <= 1 (death star radius is 1)
    if (color == null) {
      var cr = Math.round(127 * v.x + 127),
        cg = Math.round(127 * v.y + 127),
        cb = Math.round(127 * v.z + 127);
      color = 'rgb(' + cr + ', ' + cg + ', ' + cb + ')';
    }
    v = pointToScreen(v);
    ctx.fillStyle = color;
    ctx.fillRect(v.x, v.y, v.z, v.z); // v.z is hacky 'pixel' size
  }

  var t = 2;
  setInterval(function () {
    t += 0.01;
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var length = imgData.data.length;
    for (var i = 0; i < length; i += 10) {
      if (imgData.data[i])
        imgData.data[i] = Math.floor(0.105 * imgData.data[i]);
      if (imgData.data[i + 1])
        imgData.data[i + 1] = Math.floor(0.105 * imgData.data[i + 3]);
      if (imgData.data[i + 2])
        imgData.data[i + 2] = Math.floor(0.105 * imgData.data[i + 4]);
    }
    ctx.putImageData(imgData, 0, 0);

    // renderPoint(new Vector3(Math.sin(t), Math.cos(t), 0), 'red');
    // this is where the magic happens

    var cnt = 50;
    for (var i = -cnt; i <= cnt; i++) {
      var hgt = i / (cnt + 1);
      var mag = Math.sqrt(1 - hgt * hgt);
      renderPoint(new Vector3(mag * Math.sin(t), hgt, mag * Math.cos(t)));
    }
    t += .02;
  }, 20);

})(document.getElementById('blackboard'));
