/* Module      : Take a Walk on the Wild Side!!
 * Author      : Maxwell Perlman
 * Email       : mhperlman@wpi.edu
 * Course      : CS 4732
 *
 * Description : This is the code for project 2.
 *
 * Date        : 2014/11/23
 *
 * History:
 * Revision      Date          Changed By
 * --------      ----------    ----------
 * 01.00         2014/11/23    mhperlman
*/
/*INCLUDE FILES*/
/* three.min.js: The WebGL library used to draw the scene
 * OribtControl.js: Mouse Control:
 					left click and drag the mouse to rotate the camera.
 					middle click and drag the mouse to zoom in and out.
 					right click and drag the mouse to pan the camera
*//*GLOBAL VARIABLES*/
/* 
	scene, camera, controls, renderer: needed by three.js in order to draw the canvas and render the scene properly
	timer: used to track frames passed
	theta1: used to track the angle of the 1st children of the character
	incrementTheta1: ued to track whether theta1 should be incrementing or decrementing
	theta2: used to track the angle of the 2nd children of the character
	incrementTheta2: ued to track whether theta2 should be incrementing or decrementing
	theta3: used to track the angle of the 3rd children of the character
	incrementTheta3: ued to track whether theta3 should be incrementing or decrementing
	floor: the floor objetc drawn below the character
	character: the character object moving about the scene
	characterLWing1,characterRWing1: the children objects of character
	characterLWing2,characterRWing2: the children objects of characterLWing1 and characterRWing1 respectively
	characterLWing3,characterRWing3: the children objects of characterLWing2 and characterRWing2 respectively
	spline: an array of control points over which to travel
	splinePoints: the catmull-rom interpolation points of the character
*/
var scene, camera, controls, renderer;
var timer = 0;
var theta1 = 0;
var incrementTheta1 = true;
var theta2 = 0;
var incrementTheta2 = true;
var theta3 = 0;
var incrementTheta3 = true;

var floor;
var character;
var characterLWing1;
var characterRWing1;
var characterLWing2;
var characterRWing2;
var characterLWing3;
var characterRWing3;
var spline;
var splinePoints = [];


/* ----------------------------------------------------------------------- */
/* 
 * Function    :	init()
 * Description :	it calls functions to initialize the scene before rendering
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function init()
{
	scene = new THREE.Scene();
	initCharacter();
	initSpline();
	initCamera();
	initRenderer();
	document.body.appendChild(renderer.domElement);
	controls = new THREE.OrbitControls(camera);
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	initCharacter()
 * Description :	this function is called by init()
 					it function creates the character and all of its children
 					it also creates the floor object
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function initCharacter()
{
	/*These variables are used to adjust the pivot points of child objects of the character*/
	var geometry;
	var tempMat;
	/*set the geometry of the shape (size)*/
	geometry = new THREE.CubeGeometry(2, 2, 3);
	/*set the translation matrix to be applied to the object's geometry (it's pivot point)*/
	tempMat = new THREE.Matrix4().makeTranslation(0, 0, 0);
	/*apply the translation matrix to the geometry*/
	geometry.applyMatrix(tempMat);
	/*set the character object to have the desired geometry*/
	character = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
	/*set the geometry of the shape (size)*/
	geometry = new THREE.CubeGeometry(3, 1, 1.5);
	/*set the translation matrix to be applied to the object's geometry (it's pivot point)*/
	tempMat = new THREE.Matrix4().makeTranslation(-1, 0, 0);
	/*apply the translation matrix to the geometry*/
	geometry.applyMatrix(tempMat);
	/*set the characterLWing1 object to have the desired geometry*/
	characterLWing1 = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
	/*adjust the position of the characterLWing1 object*/
	characterLWing1.position.x = character.position.x - 1;
	/*set the characterLWing1 object to be a child of the character object*/
	character.children.push(characterLWing1);
	/*set the geometry of the shape (size)*/
	geometry = new THREE.CubeGeometry(3, 1, 1.5);
	/*set the translation matrix to be applied to the object's geometry (it's pivot point)*/
	tempMat = new THREE.Matrix4().makeTranslation(1, 0, 0);
	/*apply the translation matrix to the geometry*/
	geometry.applyMatrix(tempMat);
	/*set the characterLWing1 object to have the desired geometry*/
	characterRWing1 = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
	/*adjust the position of the characterRWing1 object*/
	characterRWing1.position.x = character.position.x + 1;
	/*set the characterRWing1 object to be a child of the character object*/
	character.children.push(characterRWing1);
	/*set the geometry of the shape (size)*/
	geometry = new THREE.CubeGeometry(2, 0.5, 1);
	/*set the translation matrix to be applied to the object's geometry (it's pivot point)*/
	tempMat = new THREE.Matrix4().makeTranslation(-1.25, 0, 0);
	/*apply the translation matrix to the geometry*/
	geometry.applyMatrix(tempMat);
	/*set the characterLWing2 object to have the desired geometry*/
	characterLWing2 = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
	/*adjust the position of the characterLWing2 object*/
	characterLWing2.position.x = character.position.x - 2.5;
	/*set the characterLWing2 object to be a child of the characterLWing1 object*/
	character.children.push(characterLWing2);
	/*set the geometry of the shape (size)*/
	geometry = new THREE.CubeGeometry(2, 0.5, 1);
	/*set the translation matrix to be applied to the object's geometry (it's pivot point)*/
	tempMat = new THREE.Matrix4().makeTranslation(1.25, 0, 0);
	/*apply the translation matrix to the geometry*/
	geometry.applyMatrix(tempMat);
	/*set the characterRWing2 object to have the desired geometry*/
	characterRWing2 = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
	/*adjust the position of the characterRWing2 object*/
	characterRWing2.position.x = character.position.x + 2.5;
	/*set the characterRWing2 object to be a child of the characterRWing1 object*/
	character.children.push(characterRWing2);
	/*set the geometry of the shape (size)*/
	geometry = new THREE.CubeGeometry(1, 0.25, 0.75);
	/*set the translation matrix to be applied to the object's geometry (it's pivot point)*/
	tempMat = new THREE.Matrix4().makeTranslation(-1.25, 0, 0);
	/*apply the translation matrix to the geometry*/
	geometry.applyMatrix(tempMat);
	/*set the characterLWing3 object to have the desired geometry*/
	characterLWing3 = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
	/*adjust the position of the characterLWing3 object*/
	characterLWing3.position.x = character.position.x - 3.5;
	/*set the characterLWing3 object to be a child of the characterLWing2 object*/
	character.children.push(characterLWing3);
	/*set the geometry of the shape (size)*/
	geometry = new THREE.CubeGeometry(1, 0.25, 0.75);
	/*set the translation matrix to be applied to the object's geometry (it's pivot point)*/
	tempMat = new THREE.Matrix4().makeTranslation(1.25, 0, 0);
	/*apply the translation matrix to the geometry*/
	geometry.applyMatrix(tempMat);
	/*set the characterRWing3 object to have the desired geometry*/
	characterRWing3 = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
	/*adjust the position of the characterRWing3 object*/
	characterRWing3.position.x = character.position.x + 3.5;
	/*set the characterRWing3 object to be a child of the characterRWing2 object*/
	character.children.push(characterRWing3);
	/*add the character and all of its children to the scene*/
	scene.add(character);
	/*create the floor object*/
	floor = new THREE.Mesh
	(
		new THREE.CubeGeometry(40, 1, 30),
		new THREE.MeshNormalMaterial()
	);
	/*set the position of the floor object*/
	floor.position.set(0,-5,5);
	/*add the floor object to the scene*/
	scene.add(floor);
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	initSpline()
 * Description :	this function is called by init()
 					it function creates the list of spline interpolation points
 					it calls the catmullrom function to create the list of
 					interpolation points
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function initSpline()
{
	/*Create a spline with the specified control points*/
	var spline = [
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(10, 0, 0),
		new THREE.Vector3(10, 0, 10),
		new THREE.Vector3(-10, 0, 10),
		new THREE.Vector3(-10, 0, 0),
		new THREE.Vector3(0, 0, 0)
	];
	/*call the catmullrom function to get the interpolation points of the spline*/
	catmullrom(spline);
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	initCamera()
 * Description :	this function is called by init()
 					it function creates camera and places it in the scene
 					it initially looks at the character's position
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function initCamera()
{
	camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 100000);
	camera.position.set(0, 5, -10);
	camera.aspect = 2;
	camera.lookAt(character.position);
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	initRenderer()
 * Description :	this function is called by init()
 					it function prepares the renderer to draw the scene
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
 * Description :	this function draws the scene every frame
 					it calls the animation function that calculates changes
 					to the scene
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
 					it calculates and changes the positions and rotations that
 					the objects in the scene will need to interpolate to
 					it calls the setLocation function and the doRotations function
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function animation()
{
	timer += 1;
	/*calculate the distance vector between the character's current position and its next position*/
	var distance = new THREE.Vector3(
		splinePoints[timer%600].x - character.position.x,
		splinePoints[timer%600].y - character.position.y,
		splinePoints[timer%600].z - character.position.z
	);
	/*call the setLocation function to set the position of the character and all of it's children*/
	setLocation(distance, character);
	doRotations();
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	setLocation()
 * Description :	this function is called by animation()
 					it is a recursive function that goes through all children
 					of the object it is visiting and applies the translation
 					to them
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function setLocation(distanceVector, item)
{
	/*add the distance vector between the object and its desired location to the position of the object*/
	item.position.add(distanceVector);
	/*if the object has children*/
	if(item.children)
	{
		/*for each of the object's children*/
		item.children.forEach(function(subItem)
		{
			/*call the setLocation function for the current child being processed*/
			setLocation(distanceVector, subItem);
		})
	}
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	doRotations()
 * Description :	this function is called by animation()
 					it calculates and preforms the rotations on the child
 					objects of the character
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function doRotations()
{
	/*manage the theta1 and incrementTheta1 variables*/
	if(theta1 >= 60){incrementTheta1 = false;}else if(theta1 <= -60){incrementTheta1 = true;}
	if(incrementTheta1 == true){theta1 += 3;}else{theta1 -= 3;}
	var characterRWing1Rotation = new THREE.Vector3(0,0,theta1 * Math.PI/180);
	var characterLWing1Rotation = new THREE.Vector3(0,0,-theta1 * Math.PI/180);
	/*set the rotation of the characterRWing1 and characterLWing1 objects*/
	characterRWing1.rotation = characterRWing1Rotation;
	characterLWing1.rotation = characterLWing1Rotation;
	/*manage the theta2 and incrementTheta2 variables*/
	if(theta2 >= 40){incrementTheta2 = false;}else if(theta2 <= -40){incrementTheta2 = true;}
	if(incrementTheta2 == true){theta2 += 2;}else{theta2 -= 2;}
	var characterRWing2Rotation = new THREE.Vector3(0,0,theta2 * Math.PI/180);
	var characterLWing2Rotation = new THREE.Vector3(0,0,-theta2 * Math.PI/180);
	/*set the position of the characterRWing2 and characterLWing2 objects, accounting for their parents locations*/
	characterRWing2.position.y = Math.sin(theta1 * Math.PI/180) * 2;
	characterLWing2.position.y = Math.sin(theta1 * Math.PI/180) * 2;
	/*set the rotation of the characterRWing2 and characterLWing2 objects*/
	characterRWing2.rotation = characterRWing2Rotation;
	characterLWing2.rotation = characterLWing2Rotation;
	/*manage the theta3 and incrementTheta3 variables*/
	if(theta3 >= 20){incrementTheta3 = false;}else if(theta3 <= -20){incrementTheta3 = true;}
	if(incrementTheta3 == true){theta3 += 1;}else{theta3 -= 1;}
	var characterRWing3Rotation = new THREE.Vector3(0,0,theta3 * Math.PI/180);
	var characterLWing3Rotation = new THREE.Vector3(0,0,-theta3 * Math.PI/180);
	/*set the position of the characterRWing3 and characterLWing3 objects, accounting for their parents locations*/
	characterRWing3.position.y = (Math.sin(theta2 * Math.PI/180) * 2) + (Math.sin(theta1 * Math.PI/180) * 2);
	characterLWing3.position.y = (Math.sin(theta2 * Math.PI/180) * 2) + (Math.sin(theta1 * Math.PI/180) * 2);
	/*set the rotation of the characterRWing3 and characterLWing3 objects*/
	characterRWing3.rotation = characterRWing3Rotation;
	characterLWing3.rotation = characterLWing3Rotation;
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
function catmullrom(spline)
{
	/*loop through each control point in that spline*/
	for(var i = 0; i < spline.length; i += 1)
	{
		/*between each control point, loop the proper number of times based on the transition time of the current spline*/
		for(var t = 0; t < 1 ; t += 1/(600/spline.length))
		{
			/*a modulous function that accounts for negative values. used to set the proper points for the spline subsections*/
			function mod(n, m)
			{
				return ((m % n) + n) % n;
			};
			/*set the spline subsection control points to account for*/
			var P0 = spline[mod(spline.length, i - 1)];
			var P1 = spline[i];
			var P2 = spline[mod(spline.length, i + 1)];
			var P3 = spline[mod(spline.length, i + 2)];
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
			splinePoints.push(newPos)
		}
	}
};
/*Begin Here*/
init();
render();