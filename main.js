// Â© A. Freddie Page - 2017 - Imperial College London
// http://fourier.space/
var MODULE = (function () {
    "use strict";
    var that = {},
      t = 0, T = 1, f = 60,
      ivl, iFn, lastFrame;
    var order=1, fn="sin", oldfn="sin", p=1;
    var c1=1, c2=0, c3=0; // current c0 etc.
    var o1=1, o2=0, o3=0; // old c0 etc.
    var t1=1, t2=0, t3=0; // target c0 etc.
    var X0 = [0,0], dX = [0,0], z00=0.45, z0 = 0.45;;
    var el = that.el = {};
    var fnOnChange, ordOnChange;
    var xScale, yScale;
  
    var fns = {
      "sin" : function (z) {
        return Math.sin(3 * 2 * Math.PI * z);
      },
      "exp" : function (z) {
        return 3*Math.exp(-5*z);
      },
      "tan" : function (z) {
        return Math.tan(3 * 2 * Math.PI * z);
      },
      "gauss" : function (z) {
        return Math.exp(-Math.pow((z-0.5)/0.1,2)/2);
      },
      "parab" : function (z) {
        return 20*(z-0.5)*(z-0.5)-2.5;
      },
      "parabStep" : function (z) {
        return 20*(z-0.5)*(z-0.5)-2.5 + ((z<0.6)?0:2);
      },
      "poly" : function (x) {
        return ((8*(x-0.5))**6/6 - 3*(8*(x-0.5))**4 - 2*(8*(x-0.5))**3/3 + 27*(8*(x-0.5))**2/2 + 18*(8*(x-0.5)) - 30) / 100*3;
      }
    }
  
    var fn1s = { // First Derivative
      "sin" : function (z) {
        return 3 * 2 * Math.PI * Math.cos(3 * 2 * Math.PI * z)
      },
      "exp" : function (z) {
        return -3*5*Math.exp(-5*z);
      },
      "tan" : function (z) {
        return 6*Math.PI/Math.pow(Math.cos(3 * 2 * Math.PI * z), 2);
      },
      "gauss" : function (z) {
        return Math.exp(-Math.pow((z-0.5)/0.1,2)/2)*(0.5-z)/0.1/0.1;
      },
      "parab" : function (z) {
        return 2*20*(z-0.5);
      },
      "poly" : function (x) {
        return 8*((8*(x-0.5))**5 - 12*(8*(x-0.5))**3 - 2*(8*(x-0.5))**2 + 27*(8*(x-0.5)) + 18) / 100*3;
      }
    }
    fn1s["parabStep"] = fn1s["parab"]
  
    var fn2s = { // Second Derivative
      "sin" : function (z) {
        return -9 * 4 * Math.PI * Math.PI * Math.sin(3 * 2 * Math.PI * z)
      },
      "exp" : function (z) {
        return 3*25*Math.exp(-5*z);
      },
      "tan" : function (z) {
        return 36*Math.PI*Math.PI*Math.tan(3 * 2 * Math.PI * z)/Math.pow(Math.cos(3 * 2 * Math.PI * z), 2);
      },
      "gauss" : function (z) {
        return Math.exp(-Math.pow((z-0.5)/0.1,2)/2)*((0.5-z)*(0.5-z)-0.1*0.1)/Math.pow(0.1,4);
      },
      "parab" : function (z) {
        return 2*20;
      },
      "poly" : function (x) {
        return 8*8*(5*(8*(x-0.5))**4 - 36*(8*(x-0.5))**2 - 4*(8*(x-0.5)) + 27) / 100*3;
      }
    }
    fn2s["parabStep"] = fn2s["parab"]
  
    var fn3s = { // Third Derivative
      "sin" : function (z) {
        return -27 * 8 * Math.PI * Math.PI * Math.PI * Math.cos(3 * 2 * Math.PI * z)
      },
      "exp" : function (z) {
        return -3*125*Math.exp(-5*z);
      },
      "tan" : function (z) {
        return -432*Math.PI**3 *(Math.cos(12 * Math.PI * z)-2)/Math.pow(Math.cos(6 * Math.PI * z), 4);
      },
      "gauss" : function (z) {
        return Math.exp(-Math.pow((z-0.5)/0.1,2)/2)*(z-0.5)*(-(z-0.5)*(z-0.5)+3*0.1*0.1)/Math.pow(0.1,6);
      },
      "parab" : function (z) {
        return 0;
      },
      "poly" : function (x) {
        return 8*8*8*(20*(8*(x-0.5))**3 - 72*(8*(x-0.5)) - 4) / 100*3;
      }
    }
    fn3s["parabStep"] = fn3s["parab"]
  
    fnOnChange = function () {
      oldfn = fn;
      fn = el["function"].value;
      clearInterval(ivl);
      lastFrame = +new Date;
      t=0;
      ivl = setInterval(iFn, 1000/f);
    };
  
    ordOnChange = function () {
      o1 = c1;
      o2 = c2;
      o3 = c3;
      switch (+el["order"].value) {
        case 0:
          t1 = 0; t2 = 0; t3 = 0;
          break;
        case 1:
          t1 = 1; t2 = 0; t3 = 0;
          break;
        case 2:
          t1 = 1; t2 = 1; t3 = 0;
          break;
        case 3:
          t1 = 1; t2 = 1; t3 = 1;
          break;
      }
      clearInterval(ivl);
      lastFrame = +new Date;
      t=0;
      ivl = setInterval(iFn, 1000/f);
    };
  
    iFn = function () {
      var now, x;
      now = +new Date;
      t += (now - lastFrame)/1000;
      lastFrame = now;
      if (t > T) {
        clearInterval(ivl);
        o1 = c1 = t1;
        o2 = c2 = t2;
        o3 = c3 = t3;
        p = 1;
        oldfn = fn;
        that.redraw();
        return;
      }
      x = (1 - Math.cos(Math.PI * t / T)) / 2;
      c1 = o1 + (t1 - o1) * x;
      c2 = o2 + (t2 - o2) * x;
      c3 = o3 + (t3 - o3) * x;
      p = x;
      that.redraw();
    };
  
    that.redraw = function () {
      var x0 = 55.123835, y0 = 497.57214; // Page Coordinates
      var xOffset = 50
      var fxStr = "", gxStr = "";
      var f, g, inRange;
      for (var i = 0; i < 512; i += 1) {
        f = p*fns[fn](i/512) + (1-p)*fns[oldfn](i/512) || 0
        inRange = Math.abs(f) < 4;
        f = Math.min(Math.max(f, -4), 4)
        g = p *(fns[fn](z0)  + (i/512 - z0)   * (
            c1*fn1s[fn](z0) + (i/512 - z0)/2 * (
            c2*fn2s[fn](z0) + (i/512 - z0)/3 *
            c3*fn3s[fn](z0) )))
        g += (1-p) *(fns[oldfn](z0)  + (i/512 - z0)   * (
            c1*fn1s[oldfn](z0) + (i/512 - z0)/2 * (
            c2*fn2s[oldfn](z0) + (i/512 - z0)/3 *
            c3*fn3s[oldfn](z0) )))

        fxStr += ((i && inRange)?" L ":" M ") + (x0 + xScale*i/512) + "," + (y0 + yScale * f)
        gxStr += (i?" L ":" M ") + (x0 + xScale*i/512) + "," + (y0 + yScale * g)
      }

      el["fx"].setAttribute("d", fxStr);
      el["gx"].setAttribute("d", "M " + (x0+xScale*z0) + "," + (y0+yScale* (p*fns[fn](z0) + (1-p)*fns[oldfn](z0))) + " L "  + (x0+xScale*z0 + xOffset) + "," + (y0+yScale* (p*fns[fn](z0 + xOffset/xScale) + (1-p)*fns[oldfn](z0 + xOffset/xScale))));
      el["blob"].setAttribute("d", "M " + (x0+xScale*z0) + "," + y0 + " L " + (x0+xScale*z0) + "," + (y0+yScale* (p*fns[fn](z0) + (1-p)*fns[oldfn](z0)) ));
      el["blob2"].setAttribute("d", "M " + (x0+xScale*z0 + xOffset) + "," + y0 + " L " + (x0+xScale*z0 + xOffset) + "," + (y0+yScale* (p*fns[fn](z0 + xOffset/xScale) + (1-p)*fns[oldfn](z0 + xOffset/xScale)) ));
    };
  
    that.init = function () {
      ["root", "layer1", "initText", "graph", "function", "order", "xAxis", "yAxis", "fx", "gx", "blob", "blob2"].map(
        function (id) {
          el[id] = document.getElementById(id);
        });
  
      el["function"].onchange = fnOnChange;
      el["order"].onchange = ordOnChange;
  
      xScale = el["xAxis"].getBBox().width;
      yScale = -el["yAxis"].getBBox().height / 2 / 3;
  
      el["graph"].style.cursor = "pointer";
      X0 = [el["blob"].getBBox().x + 207, el["blob"].getBBox().y];
      X0 = [el["blob2"].getBBox().x + 207, el["blob2"].getBBox().y];
  
      var mousePressed = false
      el["graph"].onmousemove = function (e) {
        if (!mousePressed) {
          el["graph"].style.cursor = "pointer";
          return e.preventDefault();
        }
        el["graph"].style.cursor = "grabbing";
        dX = [e.clientX - X0[0], e.clientY - X0[1]]
        z0 = Math.min(Math.max(z00 + dX[0]/xScale, 0), 1);
        that.redraw();
        return e.preventDefault();
      };
  
      el["graph"].onmousedown = function (e) {
        mousePressed = true;
        return el["graph"].onmousemove(e);
      };
  
      el["graph"].onmouseup = function (e) {
        mousePressed = false;
        return e.preventDefault();
      };
  
      el["root"].ondragstart = function (e) { return e.preventDefault(); };
  
      el["order"].value = order;
      el["function"].value = fn;
      that.redraw()
  
      document.body.onclick = null;
      el["layer1"].style.filter = null;
      el["initText"].style.display = "none";
    };
  
    return that;
  }());