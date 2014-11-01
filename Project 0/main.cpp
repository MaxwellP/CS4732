/*Maxwell Perlman*/
/* Author      : Maxwell Perlman
 * Email       : max@maxperlman.com / mhperlman@wpi.edu
 * Course      : CS 4732 - Computer Animation
 * Description : An animated cube
 * Date        : 20014/10/30
 * (c) Copyright 2014, Maxwell Perlman.
 * The youtube video of the project is available here: https://www.youtube.com/watch?v=omEmPUxCiBM
*/

/*Angel.h is a library provided to students by Professor Agu in CS 4731 class. I contains numerous linear-agebra related functions and data structures used throughout this code.*/
#include "Angel.h"

/*The width of the window, to be set later*/
int width = 0;
/*The height of the window, to be set later*/
int height = 0;
/*The cube's rotation around the x-axis*/
float thetaX = 0.0f;
/*The cube's rotation around the y-axis*/
float thetaY = 0.0f;
/*The cube's rotation around the z-axis*/
float thetaZ = 0.0f;
/*The cube's scale in the x-direction*/
float scaleX = 0.0f;
/*The cube's scale in the y-direction*/
float scaleY = 0.0f;
/*The cube's scale in the z-direction*/
float scaleZ = 0.0f;
/*A boolean used to determine if the cube is growing or shrinking*/
bool scaleUp = false;

/*Function prototypes*/
auto generateGeometry() -> void;
auto display() -> void;
auto keyboard(unsigned char key, int x, int y) -> void;
auto quad(int a, int b, int c, int d) -> void;
auto colorcube() -> void;
auto drawCube() -> void;
auto idle() -> void;

/*The program itself*/
GLuint program;
using namespace std;

/*The cube will consist of 36 verticies*/
const int NumVertices = 36;
/*A variable used to control how the color of verticies are assigned*/
int Index = 0;
/*Array of vec4(vector with 4 components) used to describe the location of verticies in 3D space*/
vec4 points[NumVertices];
/*Array of vec4(vector with 4 components) used to describe the color of verticies the verticies*/
vec4 colors[NumVertices];

/*All points used for the cube*/
vec4 vertices[8] =
{
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
};
/*All colors used for the cube*/
vec4 vertex_colors[8] =
{
    vec4( 0.0, 0.0, 0.0, 1.0 ),	// black
    vec4( 1.0, 0.0, 0.0, 1.0 ),	// red
    vec4( 1.0, 1.0, 0.0, 1.0 ),	// yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),	// green
    vec4( 0.0, 0.0, 1.0, 1.0 ),	// blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),	// magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),	// white
    vec4( 0.0, 1.0, 1.0, 1.0 )	// cyan
};
/*The entry point of the program. It is responsibel for the order of operations as well as creating the window and assigning specail functions used for animation and keyboard input*/
auto main(int argc, char **argv) -> int
{
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_RGBA | GLUT_DOUBLE | GLUT_DEPTH);
	width = 800;
	height = 450;
    glutInitWindowSize(width, height);
    glutCreateWindow("Maxwell Perlman - CS 4732 - Project 0");
    glewInit();
    generateGeometry();
    glutDisplayFunc(display);
    glutKeyboardFunc(keyboard);
	glutIdleFunc(idle);
    glutMainLoop();
    return 0;
};

auto generateGeometry() -> void
{
	/*Assigns the proper color values to the quads (faces of the cube)*/
    colorcube();

	/*Binds verticies to the application*/
    GLuint vao;
    glGenVertexArrays( 1, &vao);
    glBindVertexArray(vao);
	/*Binds the buffer to the applocation*/
    GLuint buffer;
    glGenBuffers(1, &buffer);
    glBindBuffer(GL_ARRAY_BUFFER, buffer);
	/*Ensures the size of the data used in the application is enough that the applicaion will draw all verticies properly*/
    glBufferData(GL_ARRAY_BUFFER, sizeof(points) + sizeof(colors), NULL, GL_STATIC_DRAW);
    glBufferSubData(GL_ARRAY_BUFFER, 0, sizeof(points), points);
    glBufferSubData(GL_ARRAY_BUFFER, sizeof(points), sizeof(colors), colors);
	/*Connect the application to the vertex and fragment shaders*/
    program = InitShader("vshader1.glsl", "fshader1.glsl");
    glUseProgram(program);
	/*Sends the vertex's positition to the vertex shader*/
    GLuint vPosition = glGetAttribLocation(program, "vPosition" );
    glEnableVertexAttribArray(vPosition);
    glVertexAttribPointer(vPosition, 4, GL_FLOAT, GL_FALSE, 0, BUFFER_OFFSET(0));
	/*Sends the vertex's color to the vertex shader*/
    GLuint vColor = glGetAttribLocation( program, "vColor"); 
    glEnableVertexAttribArray(vColor);
    glVertexAttribPointer(vColor, 4, GL_FLOAT, GL_FALSE, 0, BUFFER_OFFSET(sizeof(points)));
	/*Set the color to clear the screen before drawing again*/
    glClearColor(0.0, 0.0, 0.0, 1.0);
};

/*Assign which points to use for each vertex of each face as well as their color*/
auto colorcube() -> void
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
};

/*Creates the quads (cubes faces) from verticies and properly set it's verticies' colors*/
auto quad(int a, int b, int c, int d) -> void
{
    colors[Index] = vertex_colors[a]; points[Index] = vertices[a]; Index++;
    colors[Index] = vertex_colors[b]; points[Index] = vertices[b]; Index++;
    colors[Index] = vertex_colors[c]; points[Index] = vertices[c]; Index++;
    colors[Index] = vertex_colors[a]; points[Index] = vertices[a]; Index++;
    colors[Index] = vertex_colors[c]; points[Index] = vertices[c]; Index++;
    colors[Index] = vertex_colors[d]; points[Index] = vertices[d]; Index++;
};

/*Draws the scene*/
auto display() -> void
{
	/*Clears the screen before drawing new points*/
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	/*Creates the perspective matrix and sets its position and rotation*/
	Angel::mat4 perspectiveMat = Angel::Perspective((GLfloat)45.0, (GLfloat)width/(GLfloat)height, (GLfloat)0.1, (GLfloat) 100.0);

	/*Assigns the perspcetive matrix's values to the an array of float to be used as a camera*/
	float viewMatrixf[16];
	viewMatrixf[0] = perspectiveMat[0][0];
	viewMatrixf[4] = perspectiveMat[0][1];
	viewMatrixf[1] = perspectiveMat[1][0];
	viewMatrixf[5] = perspectiveMat[1][1];
	viewMatrixf[2] = perspectiveMat[2][0];
	viewMatrixf[6] = perspectiveMat[2][1];
	viewMatrixf[3] = perspectiveMat[3][0];
	viewMatrixf[7] = perspectiveMat[3][1];
	viewMatrixf[8] = perspectiveMat[0][2];
	viewMatrixf[12] = perspectiveMat[0][3];
	viewMatrixf[9] = perspectiveMat[1][2];
	viewMatrixf[13] = perspectiveMat[1][3];
	viewMatrixf[10] = perspectiveMat[2][2];
	viewMatrixf[14] = perspectiveMat[2][3];
	viewMatrixf[11] = perspectiveMat[3][2];
	viewMatrixf[15] = perspectiveMat[3][3];
	
	/*Creates an identity matrix for the cube*/
	Angel::mat4 modelMat = Angel::identity();
	/*Creates a rotation matrix for the cube*/
	Angel::mat4 rotationMatrix = Angel::identity();
	/*Creates a scaling matrix for the cube*/
	Angel::mat4 scaleMatrix = Angel::identity();

	/*Multiplies the rotation maxtrix by assined x-axis rotation (updated in the idle function)*/
	rotationMatrix *= Angel::RotateX(thetaX);
	/*Multiplies the rotation maxtrix by assined y-axis rotation (updated in the idle function)*/
	rotationMatrix *= Angel::RotateY(thetaY);
	/*Multiplies the rotation maxtrix by assined z-axis rotation (updated in the idle function)*/
	rotationMatrix *= Angel::RotateZ(thetaZ);
	
	/*Multiplies the scaling matrix by a scaling matrix with the x, y, and z scaling values (updated in thew idle function)*/
	scaleMatrix *= Angel::Scale(scaleX, scaleY, scaleZ);

	/*Multiplies the model matrix by a translation of 2 units backwards, then by the roatation matrix, then finally by the scaling matrix*/
	modelMat = modelMat * Angel::Translate(0.0, 0.0, -2.0f) * rotationMatrix * scaleMatrix;

	/*Assigns the model matrix's values to an array of float values representing the cube*/
	float modelMatrixf[16];
	modelMatrixf[0] = modelMat[0][0];
	modelMatrixf[4] = modelMat[0][1];
	modelMatrixf[1] = modelMat[1][0];
	modelMatrixf[5] = modelMat[1][1];
	modelMatrixf[2] = modelMat[2][0];
	modelMatrixf[6] = modelMat[2][1];
	modelMatrixf[3] = modelMat[3][0];
	modelMatrixf[7] = modelMat[3][1];
	modelMatrixf[8] = modelMat[0][2];
	modelMatrixf[12] = modelMat[0][3];
	modelMatrixf[9] = modelMat[1][2];
	modelMatrixf[13] = modelMat[1][3];
	modelMatrixf[10] = modelMat[2][2];
	modelMatrixf[14] = modelMat[2][3];
	modelMatrixf[11] = modelMat[3][2];
	modelMatrixf[15] = modelMat[3][3];
	
	/*sends the model matrix (of the cube) to the fragment shader*/
	GLuint modelMatrix = glGetUniformLocationARB(program, "model_matrix");
	glUniformMatrix4fv(modelMatrix, 1, GL_FALSE, modelMatrixf);
	/*sends the projection matrix (the camera) to the fragment shader*/
	GLuint viewMatrix = glGetUniformLocationARB(program, "projection_matrix");
	glUniformMatrix4fv(viewMatrix, 1, GL_FALSE, viewMatrixf);

	/*Controls the drawing settings of the cube*/
	drawCube();
	/*Forces an output from the GPU*/
    glFlush();
	/*Swaps the old buffer with the newly pushed one*/
	glutSwapBuffers();
};

/*Drawing settings*/
auto drawCube() -> void
{
	glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
	glEnable(GL_DEPTH_TEST);
    glDrawArrays(GL_TRIANGLES, 0, NumVertices);
	glDisable(GL_DEPTH_TEST); 
};

/*Controls keyboard input*/
auto keyboard( unsigned char key, int x, int y ) -> void
{
    switch(key)
	{
		case 033:
			exit(EXIT_SUCCESS);
			break;
    };
};

/*Controls the program after the main has finished executing*/
auto idle() -> void
{
	/*Sets and controls the rotation of the cube*/
	/*The cube will rotate around its x and z axes positively while it will rotate around its y axis negatively*/
	thetaX += 0.025f;
	thetaY -= 0.025f;
	thetaZ += 0.025f;
	/*To avoid the value of the rotations overflowing, the values are reset to zero after reaching a value of 360 or -360 degrees*/
	thetaX = (thetaX >=  360) ? 0 : thetaX;
	thetaY = (thetaX <=  -360) ? 0 : thetaY;
	thetaZ = (thetaX >=  360) ? 0 : thetaZ;
	
	/*Sets and control the scaling of the scube*/
	/*If cube is less than or equal to than 0.1f in each dimensions, the cube will scale positively*/
	if(scaleX <= 0.1f && scaleY <= 0.1f && scaleZ <= 0.1f)
	{
		scaleUp = true;
	}
	/*If cube is greaterthan or equal to than 0.95f in each dimensions, the cube will scale negatively*/
	else if(scaleX >= 0.95 && scaleY >= 0.95 && scaleZ >= 0.95)
	{
		scaleUp = false;
	}
	/*If the cube should be scaling postitvely, increase the scale of the x, y, and z dimensions of the cube*/
	if(scaleUp)
	{
		scaleX += 0.00025f;
		scaleY += 0.00025f;
		scaleZ += 0.00025f;
	}
	/*If the cube should be scaling negatively, increase the scale of the x, y, and z dimensions of the cube*/
	else
	{
		scaleX -= 0.00025f;
		scaleY -= 0.00025f;
		scaleZ -= 0.00025f;
	}

	/*Redisplay the newly transformed geometry*/
	glutPostRedisplay();
};