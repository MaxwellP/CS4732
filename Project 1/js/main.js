/* Module      : Follow My Spline!!
 * Author      : Maxwell Perlman
 * Email       : mhperlman@wpi.edu
 * Course      : CS 4732
 *
 * Description : This is the code for project 1.
 *
 * Date        : 2014/11/11
 *
 * History:
 * Revision      Date          Changed By
 * --------      ----------    ----------
 * 01.00         2014/11/11    mhperlman
*/
/*INCLUDE FILES*/
/* three.min.js: The WebGL library used to draw the scene
 * OribtControl.js: Mouse Control:
 					left click and drag the mouse to rotate the camera.
 					middle click and drag the mouse to zoom in and out.
 					right click and drag the mouse to pan the camera
*/
/*GLOBAL VARIABLES*/
/* scene, camera, controls, renderer: needed by three.js in order to draw the canvas and render the scene properly
 * splineCount: the number of splines (read by the parseFile function)
 * splineControlPointCount: a 1D array used to store the total number of control points per spline
 * splineTransitionTimes: a 1d array used to store the total time over which the objects interpolate (multiplied by constants to set frames epr second)
 * splinePositions: an array of array of Vector3 positions used to store all spline locations
 * splineRotations: an array of array of Vector3 rotations used to store all spline rotations
 * timer: used to track frames passed
 * currentSpline: used to iterate through multiple splines
 * currentControlPoint: used to iterate thrpough control points of a spline
 * catmullromPoints: the array of interpolation vector3 positions used for the catmull rom interpolation
 * bsplinePoints: the array of interpolation vector3 positions used for the uniform b-spline interpolation
 * slerpRotations: the array of interpolation vector3 rotations used for the spherical linear interpolation
*/

var scene, camera, controls, renderer;

var splineCount;
var splineControlPointCount = [];
var splineTransitionTimes = [];
var splinePositions = [[]];
var splineRotations = [[]];

var timer = 0;
var currentSpline = 0;
var currentControlPoint = 0;

var catmullromPoints = [];
var bsplinePoints = [];
var slerpRotations = [];

var cube;

/* ----------------------------------------------------------------------- */
/* 
 * Function    :	window.onload
 * Description :	this function is called when the program starts.
 					it calls the parseFileandBegin function
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
window.onload = function()
{
	parseFileandBegin();
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	init()
 * Description :	this function is called by parseFileandBegin
 					it calls functions to initialize the scene before rendering
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function init()
{
	scene = new THREE.Scene();
	initCube();
	initControlPoints();
	initCamera();
	initRenderer();
	document.body.appendChild(renderer.domElement);
	controls = new THREE.OrbitControls(camera);
	window.addEventListener('resize', onWindowResize, false);
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	initCube()
 * Description :	this function is called by init()
 					it creates the cube and adds it to the scene 
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function initCube()
{
	cube = new THREE.Mesh
	(
		new THREE.CubeGeometry(2, 2, 2),
		new THREE.MeshNormalMaterial()
	);
	cube.rotation.x = 0;
	cube.rotation.y = 0;
	cube.rotation.z = 0;
	cube.position = splinePositions[0][0];
	scene.add(cube);
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	initControlPoints()
 * Description :	this function is called by init()
 					it creates the control points for interpolation
 					and adds them to the scene
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function initControlPoints()
{
	/*for each spline*/
	for(var i = 0; i < splinePositions.length; i += 1)
	{
		/*for each point on that spline*/
		for(var j = 0; j < splinePositions[i].length; j += 1)
		{
			/*create a sphere at the designated location and add it to the scene*/
			var sphere = new THREE.Mesh(
				new THREE.SphereGeometry(1, 10, 10),
				new THREE.MeshNormalMaterial()
			);
			sphere.position = splinePositions[i][j];
			sphere.rotation = splineRotations[i][j];
			sphere.material.wireframe = true;
			scene.add(sphere);
		}
	}
	/*initialize the array of catmullrom interpolation points*/
	catmullrom();
	/*initialize the array of bspline interpolation points*/
	bspline();
	/*initialize the array of spherical linear interpolation rotations*/
	slerp();
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	initCamera()
 * Description :	this function is called by init()
 					creates and positions the camera, has it look at the
 					center of the screen and adds it to the scene
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function initCamera()
{
	camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 100000);
	camera.position.set(3.45, 6.62, 14.7);
	camera.aspect = 2;
	camera.lookAt(scene.position);
	camera.rotation.set(-0.32, 0.003, 0.001);
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	initRenderer()
 * Description :	this function is called by init()
 					prepares the renderer for drawing
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function initRenderer()
{
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	render()
 * Description :	this function is called every frame
 					computes and draws the scene every frame
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function render()
{
	requestAnimationFrame(render);
	animation();
	renderer.render(scene, camera);
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	animation()
 * Description :	this function is called by render()
 					responsible for the animation based on the number of frames that have passed
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function animation()
{
	/*Perform the Catmull-Rom Algorithm for 60 frames times the specified interpolation time*/
	if(timer < (splineTransitionTimes[currentSpline] * 60))
	{
		cube.position = catmullromPoints[timer];
	}
	/*Perform the Uniform B-Spline Algorithm for 60 frames times the specified interpolation time*/
	else if(timer >= (60 * splineTransitionTimes[currentSpline]) && timer < (120 * splineTransitionTimes[currentSpline]))
	{
		cube.position = bsplinePoints[timer - (splineTransitionTimes[currentSpline] * 60)];
	}
	/*Perform a Spherical Linear Interpolation on the cubes rotation matrix*/
	else if(timer >= (120 * splineTransitionTimes[currentSpline]) && timer < (180 * splineTransitionTimes[currentSpline]))
	{
		cube.rotation = slerpRotations[timer - (splineTransitionTimes[currentSpline] * 120)];
		if(slerpRotations[timer - (splineTransitionTimes[currentSpline] * 120)] == slerpRotations[slerpRotations.length - 1])
		{
			timer = 0;
		}
	}
	else
	{
		timer = 0;
	}
	/*Increase the timer variable (indicating the number of frames that have passed)*/
	timer += 1;
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	catmullrom()
 * Description :	this function is called by initControlPoints()
					this function creates spline interpolation points to
					perform a catmull rom interpolation over 10 seconds
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function catmullrom()
{
	/*Loop through each spline*/
	for(var i = 0; i < splinePositions.length; i += 1)
	{
		/*loop through each control point in that spline*/
		for(var j = 0; j < splinePositions[i].length; j += 1)
		{
			/*between each control point, loop the proper number of times based on the transition time of the current spline*/
			for(var t = 0; t < 1 ; t += 1/(splineTransitionTimes[i] * 5))
			{
				/*a modulous function that accounts for negative values. used to set the proper points for the spline subsections*/
				function mod(n, m)
				{
					return ((m % n) + n) % n;
				};
				/*set the spline subsection control points to account for*/
				var P0 = splinePositions[i][mod(splinePositions[i].length, j - 1)];
				var P1 = splinePositions[i][j];
				var P2 = splinePositions[i][mod(splinePositions[i].length, j + 1)];
				var P3 = splinePositions[i][mod(splinePositions[i].length, j + 2)];
				/*calculate the x value of the new position for the object*/
				var x = (2.0 * P1.x) + (-P0.x + P2.x) * t;
				x += ((2.0 * P0.x) - (5.0 * P1.x) + (4 * P2.x) - P3.x) * Math.pow(t, 2);
				x += (-P0.x + (3.0 * P1.x) - (3.0 * P2.x) + P3.x) * Math.pow(t, 3);
				x *= 0.5;
				/*calculate the y value of the new position for the object*/
				var y = (2.0 * P1.y) + (-P0.y + P2.y) * t;
				y += ((2.0 * P0.y) - (5.0 * P1.y) + (4 * P2.y) - P3.y) * Math.pow(t, 2);
				y += (-P0.y + (3.0 * P1.y) - (3.0 * P2.y) + P3.y) * Math.pow(t, 3);
				y *= 0.5;
				/*calculate the z value of the new position for the object*/
				var z = (2.0 * P1.z) + (-P0.z + P2.z) * t;
				z += ((2.0 * P0.z) - (5.0 * P1.z) + (4 * P2.z) - P3.z) * Math.pow(t, 2);
				z += (-P0.z + (3.0 * P1.z) - (3.0 * P2.z) + P3.z) * Math.pow(t, 3);
				z *= 0.5;
				/*create a new vector3 to hold the position for the object to interpolate to*/
				var newPos = new THREE.Vector3();
				newPos.setX(x);
				newPos.setY(y);
				newPos.setZ(z);
				/*add the position to the global array holding all catmull rom interpolation points*/
				catmullromPoints.push(newPos)
			}
		}
	}
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	bspline()
 * Description :	this function is called by initControlPoints()
					this function creates spline interpolation points to
					perform a bspline interpolation over 10 seconds
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function bspline()
{
	/*Loop through each spline*/
	for(var i = 0; i < splinePositions.length; i += 1)
	{
		/*loop through each control point in that spline*/
		for(var j = 0; j < splinePositions[i].length; j += 1)
		{
			/*between each control point, loop the proper number of times based on the transition time of the current spline*/
			for(var t = 0; t < 1 ; t += 1/(splineTransitionTimes[i] * 5))
			{
				/*a modulous function that accounts for negative values. used to set the proper points for the spline subsections*/
				function mod(n, m)
				{
					return ((m % n) + n) % n;
				};
				/*set the spline subsection control points to account for*/
				var P0 = splinePositions[i][mod(splinePositions[i].length, j - 1)];
				var P1 = splinePositions[i][j];
				var P2 = splinePositions[i][mod(splinePositions[i].length, j + 1)];
				var P3 = splinePositions[i][mod(splinePositions[i].length, j + 2)];
				/*set the time related variables that are used frequently*/
				var t2 = t * t;
				var t3 = t2 * t;

				/*calculate the x value of the new position for the object*/
				var x = (
					((1/6 * Math.pow((1 - t),3)) * P0.x) +
					(((1/2 * t3) - t2 + (2/3)) * P1.x) +
					(((-1/2 * t3) + (1/2 * t2) + (1/2 * t) + 1/6) * P2.x) +
					((1/6 * t3) * P3.x)
				);
				/*calculate the y value of the new position for the object*/
				var y = (
					((1/6 * Math.pow((1 - t),3)) * P0.y) +
					(((1/2 * t3) - t2 + (2/3)) * P1.y) +
					(((-1/2 * t3) + (1/2 * t2) + (1/2 * t) + 1/6) * P2.y) +
					((1/6 * t3) * P3.y)
				);
				/*calculate the z value of the new position for the object*/
				var z = (
					((1/6 * Math.pow((1 - t),3)) * P0.z) +
					(((1/2 * t3) - t2 + (2/3)) * P1.z) +
					(((-1/2 * t3) + (1/2 * t2) +
					(1/2 * t) + 1/6) * P2.z) +
					((1/6 * t3) * P3.z)
				);
				/*create a new vector3 to hold the position for the object to interpolate to*/
				var newPos = new THREE.Vector3();
				newPos.setX(x);
				newPos.setY(y);
				newPos.setZ(z);
				/*add the position to the global array holding all bspline interpolation points*/
				bsplinePoints.push(newPos)
			}
		}
	}
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	slerp()
 * Description :	this function is called by initControlPoints()
					this function creates the array of rotations needed for
					a spherical linear interpolation over all given splines
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function slerp()
{
	/*Loop through each spline*/
	for(var i = 0; i < splineRotations.length; i += 1)
	{
		/*loop through each control point in that spline*/
		for(var j = 0; j < splineRotations[i].length; j += 1)
		{
			/*between each control point, loop the proper number of times based on the transition time of the current spline*/
			for(var t = 0; t < 1 ; t += 1/(splineTransitionTimes[i] * 5))
			{
				/*a modulous function that accounts for negative values. used to set the proper points for the spline subsections*/
				function mod(n, m)
				{
					return ((m % n) + n) % n;
				};
				/*a vec4 used for the spherical linear interpolation*/
				var newQuat = new THREE.Vector4();
				/*the euler rotations of interest for this piece of the slerp*/
				var rot0 = splineRotations[i][j];
				var rot1 = splineRotations[i][mod(splineRotations[i].length, j + 1)];
				/*convert the eulers to quaternions*/
				rot0 = eulerToQuaternion(rot0);
				rot1 = eulerToQuaternion(rot1);
				/*calculate the angle between the quaternions of interest*/
				var cosineHalfTheta = (rot0.w * rot1.w) + (rot0.x * rot1.x) + (rot0.y * rot1.y) + (rot0.z * rot1.z);
				/*theta = 0: can return rot0*/
				if(Math.abs(cosineHalfTheta) >= 1.0)
				{
					newQuat.w = rot0.w;
					newQuat.x = rot0.x;
					newQuat.y = rot0.y;
					newQuat.z = rot0.z;
					slerpRotations.push(quaternionToEuler(newQuat));
					break;
				}
				/*values used in comparisons*/
				var halfTheta = Math.acos(cosineHalfTheta);
				var sinHalfTheta = Math.sqrt(1.0 - (cosineHalfTheta * cosineHalfTheta));
				/*if the angle is equal to  180 degrees then the result is not defined, rotate aroudn any axis normal to rot0 or rot1*/
				if(Math.abs(sinHalfTheta) < 0.001)
				{
					newQuat.w = (rot0.w * 0.5) + (rot1.w * 0.5);
					newQuat.x = (rot0.x * 0.5) + (rot1.x * 0.5);
					newQuat.y = (rot0.y * 0.5) + (rot1.y * 0.5);
					newQuat.z = (rot0.z * 0.5) + (rot1.z * 0.5);
					slerpRotations.push(quaternionToEuler(newQuat));
					break;
				}
				/*prepare for conversion to euler angles*/
				var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
				var ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
				newQuat.w = (rot0.w * ratioA) + (rot1.w * ratioB);
				newQuat.x = (rot0.x * ratioA) + (rot1.x * ratioB);
				newQuat.y = (rot0.y * ratioA) + (rot1.y * ratioB);
				newQuat.z = (rot0.z * ratioA) + (rot1.z * ratioB);
				slerpRotations.push(quaternionToEuler(newQuat));
			}
		}
	}
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	eulerToQuaternion()
 * Description :	this function is called by slerp()
					this function returns the quaternion(vector4)
					conversion of the given euler (vector3)
 * Parameters  :	a Vector3
 * Returns     :	a Vector4(quaternion)
*/
/* ----------------------------------------------------------------------- */
function eulerToQuaternion(vec)
{
	var rotX = ((Math.PI * vec.x) / 180) / 2;
	var rotY = ((Math.PI * vec.y) / 180) / 2;
	var rotZ = ((Math.PI * vec.z) / 180) / 2;
	var quat = new THREE.Vector4();
	var w = Math.cos(rotX) * Math.cos(rotY) * Math.cos(rotZ) - Math.sin(rotX) * Math.sin(rotY) * Math.sin(rotZ);
	var x = Math.sin(rotX) * Math.cos(rotY) * Math.cos(rotZ) + Math.cos(rotX) * Math.sin(rotY) * Math.sin(rotZ);
	var y = Math.cos(rotX) * Math.sin(rotY) * Math.cos(rotZ) - Math.sin(rotX) * Math.cos(rotY) * Math.sin(rotZ);
	var z = Math.cos(rotX) * Math.cos(rotY) * Math.sin(rotZ) + Math.sin(rotX) * Math.sin(rotY) * Math.cos(rotZ);
	quat.set(x, y, z, w);
	return quat;
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	quaternionToEuler()
 * Description :	this function is called by slerp()
					this function returns the euler (vector3) conversion
					of the given quaternion (vector4)
 * Parameters  :	a Vector4(quaternion)
 * Returns     :	a Vector3
*/
/* ----------------------------------------------------------------------- */
function quaternionToEuler(qat)
{
	var wW = qat.w * qat.w;
	var xX = qat.x * qat.x;
	var yY = qat.y * qat.y;
	var zZ = qat.z * qat.z;
	var vec = new THREE.Vector3();
	vec.x = Math.atan(2 * (qat.x * qat.w - qat.y * qat.z), (wW - xX - yY + zZ));
	vec.y = Math.asin(2 * (qat.x * qat.z + qat.y * qat.w) , -1, 1);
	vec.z = Math.atan(2 * (qat.x * qat.y + qat.z * qat.w) , (wW + xX - yY - zZ));
	return vec;
};

/* ----------------------------------------------------------------------- */
/* 
 * Function    :	parseFileandBegin()
 * Description :	this function is called by window.onLoad()
 					reads the specified spline.txt file and stores the
 					values as needed into the global variables for later use
 					it then calls init and render to begin drawing the scene
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function parseFileandBegin()
{
	/*request the spline file*/
	var request = new XMLHttpRequest();
	request.open("GET", "http://users.wpi.edu/~mhperlman/webgl/project1/spline1.txt", true);
	/*a callback function for once the file has been loaded*/
	request.onload = function(e)
	{
		/*read the file turn it into an array split at every new line character*/
		var file = request.responseText.split("\n");
		/*local variables used for file parsing*/
		var splitFileItems = [];
		var currentLocation = 0;
		var unparsedPositions = [[]];
		var unparsedRotations = [[]];
		/*eliminate all lines in the file beginning with a "#" or an empty character*/
		file.forEach
		(
			function(item)
			{
				if(item.charAt(0) != "#" && item.charAt(0) != "")
				{
					splitFileItems.push(item);
				}
			}
		);
		/*read in the spline count*/
		splineCount = parseInt(splitFileItems[currentLocation]);
		currentLocation += 1;
		/*for each spline*/
		for(var i = 0; i < splineCount; i += 1)
		{
			/*store the number of control points for that spline*/
			splineControlPointCount[i] = parseInt(splitFileItems[currentLocation]);
			currentLocation += 1;
			/*store the transition time for that spline*/
			splineTransitionTimes[i] = parseInt(splitFileItems[currentLocation]);
			currentLocation += 1;
			/*store an unparsed version of both the denoted position and rotation vectors*/
			for(var j = 0; j < splineControlPointCount[i]; j += 1)
			{
				unparsedPositions[i][j] = splitFileItems[currentLocation];
				currentLocation += 1;
				unparsedRotations[i][j] = splitFileItems[currentLocation];
				currentLocation += 1;
			}
		}
		/*for each unparsedposition/rotation*/
		for(var i = 0; i < unparsedPositions.length; i += 1)
		{
			for(var j = 0; j < unparsedPositions[i].length; j += 1)
			{
				/*split the position and rotation at the "," mark*/
				var tempPos = unparsedPositions[i][j].split(",");
				var tempRot = unparsedRotations[i][j].split(",");
				/*store the newly parsed positions and rotations to arrays*/
				splinePositions[i][j] = new THREE.Vector3(
						parseFloat(tempPos[0]),
						parseFloat(tempPos[1]),
						parseFloat(tempPos[2]));
				splineRotations[i][j] = new THREE.Vector3(
						parseFloat(tempRot[0]),
						parseFloat(tempRot[1]),
						parseFloat(tempRot[2]));
			}
		}
		/*call the init function to prepare the scene*/
		init();
		/*call the render function to begin drawing the scene every frame*/
		render();
	};
	/*send the file request*/
	request.send();
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	onWindowResize()
 * Description :	resizes the canvas to account for changes in the window size
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function onWindowResize()
{
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth,window.innerHeight);
	render();
};