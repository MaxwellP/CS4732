uniform mat4 projection_matrix;
uniform mat4 model_matrix;

in  vec4 vPosition;
in  vec4 vColor;
out vec4 interpolatedColor;

void main() 
{
  gl_Position = projection_matrix * model_matrix*vPosition;
  interpolatedColor = vColor;
}