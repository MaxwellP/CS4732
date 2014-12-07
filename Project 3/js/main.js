/* Module      : Boids of a Feather!!
 * Author      : Maxwell Perlman
 * Email       : mhperlman@wpi.edu
 * Course      : CS 4732
 *
 * Description : This is the code for project 3.
 *
 * Date        : 2014/11/30
 *
 * Revision      Date          Changed By
 * --------      ----------    ----------
 * 01.00         2014/11/30    mhperlman
*/
/*INCLUDE FILES*/
/* three.min.js: The WebGL library used to draw the scene
 * OribtControl.js: Mouse Control:
 					left click and drag the mouse to rotate the camera.
 					middle click and drag the mouse to zoom in and out.
 					right click and drag the mouse to pan the camera
*/
/*GLOBAL VARIABLES*/
/* 
	scene, camera, controls, renderer: needed by three.js in order to draw the canvas and render the scene properly
	boundary: the cube containing all particle objects and the obstacle the particles avoid
	obstacle: the sphere in the center of the scene that the particles avoid
	objects: the array of particles that are flocking
	worldSize: the dimensions of the boundary cube
	velocityMax: the maximum velocity that a particle can move
	velocityMin: the minimum velocity that a particle can move
	positionMaxX: the maximum X position a particle can move to
	positionMinX: the minimum X position a particle can move to
	positionMaxY: the maximum Y position a particle can move to
	positionMinY: the minimum Y position a particle can move to
	positionMaxZ: the maximum Z position a particle can move to
	positionMinZ: the minimum Z position a particle can move to
*/
var scene, camera, controls, renderer, timer;
var boundary;
var obstacle;
var objects = [];
var worldSize = new THREE.Vector3(6, 6, 6);
var velocityMax = 0.25;
var velocityMin = -0.25;
var positionMaxX = worldSize.x;
var positionMinX = (worldSize.x * -1);
var positionMaxY = worldSize.y;
var positionMinY = (worldSize.y * -1);
var positionMaxZ = worldSize.z;
var positionMinZ = (worldSize.z * -1);
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
	initCamera();
	initObjects();
	initRenderer();
	document.body.appendChild(renderer.domElement);
	controls = new THREE.OrbitControls(camera);
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	initCamera()
 * Description :	called by the init() function, it creates and places
 					the camera in the scene
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function initCamera()
{
	camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 100000);
	camera.position.set(0, 0, -25);
	camera.aspect = 2;
	camera.lookAt(scene.position);
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	initObjects()
 * Description :	called by the init() function, it creates the boundary,
 					obstacle, and particles and places them in the scene
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function initObjects()
{
	/*Create a cube to be the boundary of the scene*/
	boundary = new THREE.Mesh
	(
		new THREE.CubeGeometry(worldSize.x * 2, worldSize.y * 2, worldSize.z * 2),
		new THREE.MeshNormalMaterial()
	);
	boundary.material.wireframe = true;
	scene.add(boundary);
	/*Create a sphere to be the obstacle in the scene*/
	obstacle = new THREE.Mesh
	(
		new THREE.SphereGeometry(1.5, 100, 100),
		new THREE.MeshNormalMaterial()
	);
	obstacle.velocity = new THREE.Vector3(0, 0, 0);
	obstacle.forceField = 3;
	scene.add(obstacle);
	/*Create three particles in the scene (red, green, and blue) each iteration*/
	for(var i = 0; i < 66; i += 1)
	{
		addObject(0xCC3333, "red");
		addObject(0x33CC33, "green");
		addObject(0x3333CC, "blue");
	};
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	initRenderer()
 * Description :	called by the init() function, prepares the renderer
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
 * Description :	called each frame, calculates changes to the scene
 					and draws the scene
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
 * Description :	called each frame by render(), calculates the changes to
 					the particles in the scene and handles their flocking
 * Parameters  :	N/A
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function animation()
{
	var red = 0;
	var green = 0;
	var blue = 0;
	/*Go through each particle in the scene*/
	objects.forEach(function(item)
	{
		/*Check if the object is colliding with another object*/
		doCollisionCheck(item);
		/*Calculate the alignment vector for the given particle*/
		var alignment = computeAlignment(item);
		/*Calculate the cohesion vector for the given particle*/
		var cohesion = computeCohesion(item);
		/*Calculate the separation vector for the given particle*/
		var separation = computeSeparation(item);
		/*Avoid the obstacle in the center of the scene*/
		var avoid = avoidObstacle();
		/*Add the calculated vectors to the velocity of the particle*/
		item.velocity.x += (alignment.x * 0.5) + (cohesion.x * 0.5) + (separation.x * 0.5) + (avoid.x * 1.0);
		item.velocity.y += (alignment.y * 0.5) + (cohesion.y * 0.5) + (separation.y * 0.5) + (avoid.y * 1.0);
		item.velocity.z += (alignment.z * 0.5) + (cohesion.z * 0.5) + (separation.z * 0.5) + (avoid.z * 1.0);
		/*Clamp the velocity of the particle to be within the minimum and maximum velocity range*/
		if(item.velocity.x > velocityMax){item.velocity.x = velocityMax;}
		if(item.velocity.x < velocityMin){item.velocity.x = velocityMin;}
		if(item.velocity.y > velocityMax){item.velocity.y = velocityMax;}
		if(item.velocity.y < velocityMin){item.velocity.y = velocityMin;}
		if(item.velocity.z > velocityMax){item.velocity.z = velocityMax;}
		if(item.velocity.z < velocityMin){item.velocity.z = velocityMin;}
		/*Keep the object within the range of the world space*/
		if(item.position.x + item.geometry.width/2 > worldSize.x)	{item.velocity.x *= -1; item.position.x = worldSize.x - item.geometry.width/2;}
		if(item.position.x - item.geometry.width/2 < -worldSize.x)	{item.velocity.x *= -1; item.position.x = -worldSize.x + item.geometry.width/2;}
		if(item.position.y + item.geometry.height/2 > worldSize.y)	{item.velocity.y *= -1; item.position.y = worldSize.y - item.geometry.height/2;}
		if(item.position.y - item.geometry.height/2 < -worldSize.y)	{item.velocity.y *= -1; item.position.y = -worldSize.y + item.geometry.height/2;}
		if(item.position.z + item.geometry.depth/2 > worldSize.z)	{item.velocity.z *= -1; item.position.z = worldSize.z - item.geometry.depth/2;}
		if(item.position.z - item.geometry.depth/2 < -worldSize.z)	{item.velocity.z *= -1; item.position.z = -worldSize.z + item.geometry.depth/2;}
		/*Add the object's velocity to it's position*/
		item.position.add(item.velocity);
		/*Keep track of the number of red green and blue particles per loop*/
		if(item.type == "red"){red += 1;}
		else if(item.type == "green"){green += 1;}
		else if(item.type == "blue"){blue += 1;}
	});
	/*If there are zero red particles in the environment, select a random particle and make it red*/
	if(red == 0){assignRandom("red", 0xCC3333);}
	/*If there are zero green particles in the environment, select a random particle and make it green*/
	if(green == 0){assignRandom("green", 0x33CC33);}
	/*If there are zero blue particles in the environment, select a random particle and make it blue*/
	if(blue == 0){assignRandom("blue", 0x3333CC);}
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	assignRandom()
 * Description :	called when there are zero particles of a given color,
 					randomly assign a particle to the given color and type
 * Parameters  :	a string and a color
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function assignRandom(objType, objColor)
{
	var index = Math.floor(Math.random() * objects.length);
	objects[index].type = objType;
	objects[index].material.color = new THREE.Color(objColor);
}
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	avoidObstacle()
 * Description :	called each frame by animation(), calculates the total
 					distance the entire flock is from the obstacle and keeps
 * Parameters  :	N/A
 * Returns     :	a Vector3 of the distance a given particle should be from
 					the obstacle
*/
/* ----------------------------------------------------------------------- */
function avoidObstacle()
{
	var point = new THREE.Vector3(0,0,0);
	var neighborCount = 0;
	objects.forEach(function(obj)
	{
		if(obj != obstacle)
		{
			if(CubeSphereCollision(obj, obstacle))
			{
				var difference = new THREE.Vector3().subVectors(obj.position, obstacle.position);
				difference.normalize();
				point.add(difference);
				neighborCount += 1;
			}
		}
	});
	if(neighborCount == 0){return point;}
	else
	{
		point.divideScalar(neighborCount);
		point.setLength(1);
		return point;
	}
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	doCollisionCheck()
 * Description :	called each frame by animation(), checks if the given
 					particle is colling with any other object in the scene.
 					if it is, it handles the interaction
 * Parameters  :	a particle object
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function doCollisionCheck(obj)
{	
	/*For each other moving object in the scene*/
	objects.forEach(function(other)
	{
		if(obj != other)
		{	/*Check for a collision between objects, if they collided, change it's color*/
			if(checkCollision(obj, other))
			{	/*Two cubes collided*/
				if(obj != obstacle && other != obstacle)
				{
					other.type = obj.type;
					other.material.color = obj.material.color;
				}
				/*If the particle is within the radius of the force field of the obstacle, negate its velocity*/
				else
				{
					obj.velocity.negate();
				}
			}
		}
	})
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	computeAlignment()
 * Description :	called each frame by animation(), calculates the
 					alignment vector for a given particle
 * Parameters  :	a particle object
 * Returns     :	a Vector3 of influence on the given particles velocity
*/
/* ----------------------------------------------------------------------- */
function computeAlignment(obj)
{
	var point = new THREE.Vector3(0,0,0);
	var neighborCount = 0;
	objects.forEach(function(other)
	{
		if(obj != other && other != obstacle)
		{
			if(getSquareDistance(obj,other) <= obj.sensingRadius)
			{
				if((obj.type == "red" && other.type == "blue") ||
					(obj.type == "blue" && other.type == "green") ||
					(obj.type == "green" && other.type == "red"))
				{
					point.x = point.x + other.velocity.x;
					point.y = point.y + other.velocity.y;
					point.z = point.z + other.velocity.z;
					neighborCount += 1;
				}
				else if((obj.type == "red" && other.type == "green") ||
					(obj.type == "blue" && other.type == "red") ||
					(obj.type == "green" && other.type == "blue"))
				{
					point.x = point.x - other.velocity.x;
					point.y = point.y - other.velocity.y;
					point.z = point.z - other.velocity.z;
					neighborCount += 1;
				}
			}
		}
	});
	if(neighborCount == 0){return point;}
	else
	{
		point.divideScalar(neighborCount);
		point.setLength(1);
		return point;
	}
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	computeCohesion()
 * Description :	called each frame by animation(), calculates the
 					cohesion vector for a given particle
 * Parameters  :	a particle object
 * Returns     :	a Vector3 of influence on the given particles velocity
*/
/* ----------------------------------------------------------------------- */
function computeCohesion(obj)
{
	var point = new THREE.Vector3(0,0,0);
	var neighborCount = 0;
	objects.forEach(function(other)
	{
		if(obj != other && other != obstacle)
		{
			if(getSquareDistance(obj,other) <= obj.sensingRadius)
			{
				if((obj.type == "red" && other.type == "blue") ||
					(obj.type == "blue" && other.type == "green") ||
					(obj.type == "green" && other.type == "red"))
				{
					point.x = point.x + other.position.x;
					point.y = point.y + other.position.y;
					point.z = point.z + other.position.z;
					neighborCount += 1;
				}
				else if((obj.type == "red" && other.type == "green") ||
					(obj.type == "blue" && other.type == "red") ||
					(obj.type == "green" && other.type == "blue"))
				{
					point.x = point.x - other.position.x;
					point.y = point.y - other.position.y;
					point.z = point.z - other.position.z;
					neighborCount += 1;
				}
			}
		}
	});
	if(neighborCount == 0){return point;}
	else
	{
		point.divideScalar(neighborCount);
		point.set((point.x - obj.position.x), (point.y - obj.position.y), (point.z - obj.position.z));
		point.setLength(1);
		return point;
	}
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	computeSeparation()
 * Description :	called each frame by animation(), calculates the
 					separation vector for a given particle
 * Parameters  :	a particle object
 * Returns     :	a Vector3 of influence on the given particles velocity
*/
/* ----------------------------------------------------------------------- */
function computeSeparation(obj)
{
	var point = new THREE.Vector3(0,0,0);
	var neighborCount = 0;
	objects.forEach(function(other)
	{
		if(obj != other && other != obstacle)
		{
			if(getSquareDistance(obj,other) <= obj.sensingRadius)
			{
				if((obj.type == "red" && other.type == "blue") ||
					(obj.type == "blue" && other.type == "green") ||
					(obj.type == "green" && other.type == "red"))
				{
					point.x = point.x + (obj.position.x - other.position.x);
					point.y = point.y + (obj.position.y - other.position.y);
					point.z = point.z + (obj.position.z - other.position.z);
					neighborCount += 1;
				}
				else if((obj.type == "red" && other.type == "green") ||
					(obj.type == "blue" && other.type == "red") ||
					(obj.type == "green" && other.type == "blue"))
				{
					point.x = point.x - (obj.position.x - other.position.x);
					point.y = point.y - (obj.position.y - other.position.y);
					point.z = point.z - (obj.position.z - other.position.z);
					neighborCount += 1;
				}
			}
		}
	});
	if(neighborCount == 0){return point;}
	else
	{
		point.divideScalar(neighborCount);
		point.multiplyScalar(-1);
		point.setLength(1);
		return point;
	}
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	getSquareDistance()
 * Description :	called each frame by computeAlignment(), computeCohesion(),
 					and computeSeparation(), it calculates the square distance
 					between two objects
 * Parameters  :	two particle objects
 * Returns     :	a scalar
*/
/* ----------------------------------------------------------------------- */
function getSquareDistance(obj1, obj2)
{
	var distance = new THREE.Vector3().subVectors(obj1.position, obj2.position);
	var squareDistance = (
		(distance.x * distance.x) +
		(distance.y * distance.y) +
		(distance.z * distance.z)
	);
	return squareDistance;
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	checkCollision()
 * Description :	called each frame by animation(), it checks if the two
 					given objects are colliding
 * Parameters  :	two objects
 * Returns     :	a boolean
*/
/* ----------------------------------------------------------------------- */
function checkCollision(a, b)
{
	/*Cube-Cube Collision*/
	if(a != obstacle && b != obstacle)
	{
		return CubeCubeCollision(a,b);
	}
	/*Cube-Sphere Collision*/
	else
	{	/*A is the obstacle*/
		if(a == obstacle)
		{
			return CubeSphereCollision(b, a);
		}
		/*B is the obstacle*/
		else
		{
			return CubeSphereCollision(a, b);
		}
		return false;
	}
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	CubeCubeCollision()
 * Description :	called each frame by checkCollision(), it checks if the two
 					given particles are colliding
 * Parameters  :	two particle objects
 * Returns     :	a boolean
*/
/* ----------------------------------------------------------------------- */
function CubeCubeCollision(c1, c2)
{
	if(Math.abs(c1.position.x - c2.position.x) < c1.geometry.width + c2.geometry.width)
	{
		if(Math.abs(c1.position.y - c2.position.y) < c1.geometry.height + c2.geometry.height)
		{
			if(Math.abs(c1.position.z - c2.position.z) < c1.geometry.depth + c2.geometry.depth)
			{
				return true;
			}
		}
	}
	return false;
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	CubeSphereCollision()
 * Description :	called each frame by checkCollision(), it checks if the two
 					given objects (a particle and the obstacle) are colliding
 * Parameters  :	two objects
 * Returns     :	a boolean
*/
/* ----------------------------------------------------------------------- */
function CubeSphereCollision(cube, sphere)
{
	if(cube.position.length() <= sphere.forceField)
	{
		return true;
	}
	return false;
};
/* ----------------------------------------------------------------------- */
/* 
 * Function    :	addObject()
 * Description :	called by initObjects(), it creates a particle (cube)
 					object of the specified color and type and adds it to
 					the scene
 * Parameters  :	a color and a string
 * Returns     :	N/A
*/
/* ----------------------------------------------------------------------- */
function addObject(objColor, objType)
{
	var randVelX = Math.random() * (velocityMax - velocityMin) + velocityMin;
	var randVelY = Math.random() * (velocityMax - velocityMin) + velocityMin;
	var randVelZ = Math.random() * (velocityMax - velocityMin) + velocityMin;
	var newObj;
	newObj = new THREE.Mesh
	(
		new THREE.CubeGeometry(0.25, 0.25, 0.25),
		new THREE.MeshBasicMaterial()
	);
	newObj.material.color = new THREE.Color(objColor);
	newObj.material.vertexColors = THREE.FaceColors;
	newObj.position.set(0, 0, 0);
	/*Ensure that the position of the particle is not within the obstacle*/
	while(CubeSphereCollision(newObj, obstacle) == true)
	{
		var randPosX = Math.random() * (positionMaxX - positionMinX) + positionMinX;
		var randPosY = Math.random() * (positionMaxY - positionMinY) + positionMinY;
		var randPosZ = Math.random() * (positionMaxZ - positionMinZ) + positionMinZ;
		newObj.position.set(randPosX, randPosY, randPosZ);
	}
	newObj.type = objType;
	newObj.sensingRadius = 25;
	newObj.velocity = new THREE.Vector3(randVelX, randVelY, randVelZ);
	objects.push(newObj);
	scene.add(newObj);
};
/*Begin Here*/
init();
render();