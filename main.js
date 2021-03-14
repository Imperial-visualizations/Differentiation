// A. Freddie Page - 2017 - Imperial College London
// http://fourier.space/

var MODULE = (function () {
    "use strict";
    var that = {},
      t = 0, T = 1, f = 60,
      ivl, iFn, lastFrame;
    var fn="sin", oldfn="sin", p=1; // Default: start with sine
    // c, o, t used for taylor series
    var c1=1, c2=0, c3=0; // current c0 etc.
    var o1=1, o2=0, o3=0; // old c0 etc.
    var t1=1, t2=0, t3=0; // target c0 etc.
    var X0 = [0,0], X0_1=[0,0], dX = [0,0], z00=0.45, z0 = 0.45;;
    var el = that.el = {};
  
    var fnOnChange;
    var xScale, yScale, xScale_1, yScale_1;

  
    /* Defines functions mathematically.
      These functions have been scaled - presumably for aesthetic reasons
      */
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
  
    /* First derivates of the functions in the fns object. This could be useful for
      the second page of our vis
      */
    var fn1s = { // First Derivative
      "sin" : function (z) {
        return (3 * 2 * Math.PI * Math.cos(3 * 2 * Math.PI * z)); //19
      },
      "exp" : function (z) {
        return (-3*5*Math.exp(-5*z)); //5
      },
      "tan" : function (z) {
        return (6*Math.PI/Math.pow(Math.cos(3 * 2 * Math.PI * z), 2)); //15
      },
      "gauss" : function (z) {
        return (Math.exp(-Math.pow((z-0.5)/0.1,2)/2)*(0.5-z)/0.1/0.1); //7
      },
      "parab" : function (z) {
        return (2*20*(z-0.5)); //5
      },
      "poly" : function (x) {
        return (8*((8*(x-0.5))**5 - 12*(8*(x-0.5))**3 - 2*(8*(x-0.5))**2 + 27*(8*(x-0.5)) + 18) / 100*3); //10
      }
    }
    fn1s["parabStep"] = fn1s["parab"]
  
    /* This function is called when the function is changed and performs the 
      animation
      */
    fnOnChange = function () {
      oldfn = fn; // Store the original function as oldfn
      fn = el["function"].value; // Find the new function from the dropdown box
      clearInterval(ivl); // Reset the animation
      // Set t=0 at current time, and prepare to increment t inside setInterval
      lastFrame = +new Date;
      t=0;
      /* setInterval repeatedly calls the function iFn with delay 1000/60
        At 60 fps the animation takes 1000ms
        */
      ivl = setInterval(iFn, 1000/f);
    };

    /* iFn gives the frame of the animation depending on the time 
      which is given by t, calculated using Date 
      */
    iFn = function () {
      var now, x;
      now = +new Date;
      t += (now - lastFrame)/1000;
      lastFrame = now;
      // if t > T, we stop the animation
      if (t > T) {
        clearInterval(ivl);
        // c1, c2, c3 are for interpolating the Taylor series approximations
        o1 = c1 = t1;
        o2 = c2 = t2;
        o3 = c3 = t3;
        p = 1; // When p=1 the displayed function will fully be the new function
        oldfn = fn;
        that.redraw();
        return;
      }
      /* otherwise, calculate an interpolation of the old function and new function
        using the x definition to make it ease in rather than linear.
        */
      x = (1 - Math.cos(Math.PI * t / T)) / 2;
      // c1, c2, c3 are for interpolating the Taylor series approximations
      c1 = o1 + (t1 - o1) * x;
      c2 = o2 + (t2 - o2) * x;
      c3 = o3 + (t3 - o3) * x;
      p = x;
      that.redraw();
    };
  
    that.redraw = function () {
      var x0 = 55.123835, y0 = 497.57214; // Page Coordinates
      var xOffset = el["deltaX"].valueAsNumber;
      var fxStr = "";
      let f1xStr = "";
      var f, inRange;
      let f1, inRange1, adj;

      switch(fn) { // Gets the scaling adjustements for each derivative
        case "sin":
          adj = 19;
          break;
        case "exp":
          adj = 5;
          break;
        case "tan":
          adj = 15;
          break;
        case "gauss":
          adj = 7;
          break;
        case "parab":
          adj = 5;
          break;
        case "poly":
          adj = 10;
      }

      /* This draws each of the functions, including when animation is running, by
        calculating the function at 512 points and drawing straight lines between
        each point
      */
      for (var i = 0; i < 512; i += 1) {
        //
        f = p*fns[fn](i/512) + (1-p)*fns[oldfn](i/512) || 0
        f1 = p*fn1s[fn](i/512)/adj + (1-p)*fn1s[oldfn](i/512)/adj || 0

        inRange = Math.abs(f) < 4;
        inRange1 = Math.abs(f1) < 4;

        f = Math.min(Math.max(f, -4), 4)
        f1 = Math.min(Math.max(f1, -4), 4)

        fxStr += ((i && inRange)?" L ":" M ") + (x0 + xScale*i/512) + "," + (y0 + yScale * f)
        f1xStr += ((i && inRange1)?" L ":" M ") + (x0 + xScale_1*i/512) + "," + (y0 + yScale_1 * f1)

      }

      el["fx"].setAttribute("d", fxStr);
      el["fx-1"].setAttribute("d", f1xStr);

      el["blob"].setAttribute("d", "M " + (x0+xScale*z0) + "," + y0 + " L " + (x0+xScale*z0) + "," + (y0+yScale* (p*fns[fn](z0) + (1-p)*fns[oldfn](z0)) ));
      el["blob2"].setAttribute("d", "M " + (x0+xScale*z0 + xOffset) + "," + y0 + " L " + (x0+xScale*z0 + xOffset) + "," + (y0+yScale* (p*fns[fn](z0 + xOffset/xScale) + (1-p)*fns[oldfn](z0 + xOffset/xScale)) ));

      // Change line style when not at exact derivative 
      if(xOffset === parseFloat(el["deltaX"].getAttribute("min"))){
        el["lineExt"].setAttribute("stroke-dasharray", "0") 
      } else{
        el["lineExt"].setAttribute("stroke-dasharray", "8 3") 
      }

      let angle = Math.atan2((y0+yScale* (p*fns[fn](z0 + xOffset/xScale) + (1-p)*fns[oldfn](z0 + xOffset/xScale))) - (y0+yScale* (p*fns[fn](z0) + (1-p)*fns[oldfn](z0))), (x0+xScale*z0 + xOffset) - (x0+xScale*z0)) * 180 / Math.PI;
      const xDiff = (parseFloat(el["lineExt"].getAttribute('x1')) + parseFloat(el["lineExt"].getAttribute("x2"))) / 2;

      el["lineExt"].setAttribute("transform", `translate(${((x0+xScale*z0)+(x0+xScale*z0 + xOffset))/2 - xDiff}, ${((y0+yScale* (p*fns[fn](z0) + (1-p)*fns[oldfn](z0)))+(y0+yScale* (p*fns[fn](z0 + xOffset/xScale) + (1-p)*fns[oldfn](z0 + xOffset/xScale))))/2 - y0}) rotate(${angle}, ${xDiff}, ${y0})`);      
    };
  
    // This function runs when the page loads (see <body> tag in index.html)
    that.init = function () {

      // Create an array of the elements using their ids and getElementById
      ["root", "layer1", "layer2", "graph", "function", "xAxis", "yAxis", "xAxis-1", "yAxis-1", "fx", "fx-1", "blob", "blob2", "lineExt", "deltaX"].map(

        function (id) {
          el[id] = document.getElementById(id);
        });
  
      // When "function" changes, animate the change
      el["function"].onchange = fnOnChange;
      // When "deltaX" changes, redraw the graph
      el["deltaX"].oninput = this.redraw;
  
      // Find the size of the bounding box in pixels
      xScale = el["xAxis"].getBBox().width;
      yScale = -el["yAxis"].getBBox().height / 2 / 3;

      xScale_1 = el["xAxis-1"].getBBox().width;
      yScale_1 = -el["yAxis-1"].getBBox().height / 2 / 3;
  
      // Set the cursor to pointer mode when hovering over the graph
      el["graph"].style.cursor = "pointer";
      X0 = [el["blob"].getBBox().x + 207, el["blob"].getBBox().y];
  
      // Create mousePressed variable, set to false by default
      var mousePressed = false
      // When the mouse is moved over the graph,
      el["graph"].onmousemove = function (e) {
        /* If the mouse is not pressed, set the cursor to pointer mode 
          and prevent any default events */
        if (!mousePressed) {
          el["graph"].style.cursor = "pointer";
          return e.preventDefault();
        }
        // Otherwise, set the cursor to grab mode
        el["graph"].style.cursor = "grabbing";
        // Find the position of the cursor
        dX = [e.clientX - X0[0], e.clientY - X0[1]]
        // Scale the x component of the mouse position between 0 and 1
        z0 = Math.min(Math.max(z00 + dX[0]/xScale, 0), 1 - el["deltaX"].valueAsNumber/xScale);
        // Redraw the graph
        that.redraw();
        return e.preventDefault();
      };
  
      // Perform the onmousemove function when the mouse is pressed down
      el["graph"].onmousedown = function (e) {
        mousePressed = true;
        return el["graph"].onmousemove(e);
      };
  
      // on mouse up, set mousePressed to false
      el["graph"].onmouseup = function (e) {
        mousePressed = false;
        return e.preventDefault();
      };
  
      // Prevent default drag behaviour on "root"
      el["root"].ondragstart = function (e) { return e.preventDefault(); };
  
      // Set fn to the value in "function" and draw the graph for the first time
      el["function"].value = fn;
      that.redraw()
  
      document.body.onclick = null;
      el["layer1"].style.filter = null;
      el["layer2"].style.filter = null;

    };
  
    return that;
  }());