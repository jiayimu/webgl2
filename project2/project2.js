// ProgramObject.js (c) 2016 jiayi
// Vertex shader for texture drawing
var TEXTURE_VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Normal;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'uniform vec3 u_LightDirection;\n' +
    'varying float v_NdotL;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '  v_NdotL = max(dot(normal, u_LightDirection), 0.0);\n' +
    '  v_TexCoord = a_TexCoord;\n' +
    '}\n';

// Fragment shader for texture drawing
var TEXTURE_FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'uniform sampler2D u_Sampler;\n' +
    'varying vec2 v_TexCoord;\n' +
    'varying float v_NdotL;\n' +
    'void main() {\n' +
    '  vec4 color = texture2D(u_Sampler, v_TexCoord);\n' +
    '  gl_FragColor = vec4(color.rgb * v_NdotL, color.a);\n' +
    '}\n';

//some variables
var texture1;
var texture2;
var texture3;

var angle = 0.0;
var lx = 0.0;
var lz = -1.0;
var x = 0.0;
var z = 15.0;
var y = 0.0;
var end = 0;

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    var texProgram = createProgram(gl, TEXTURE_VSHADER_SOURCE, TEXTURE_FSHADER_SOURCE);
    if (!texProgram) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get storage locations of attribute and uniform variables in program object for texture drawing
    texProgram.a_Position = gl.getAttribLocation(texProgram, 'a_Position');
    texProgram.a_Normal = gl.getAttribLocation(texProgram, 'a_Normal');
    texProgram.a_TexCoord = gl.getAttribLocation(texProgram, 'a_TexCoord');
    texProgram.u_MvpMatrix = gl.getUniformLocation(texProgram, 'u_MvpMatrix');
    texProgram.u_NormalMatrix = gl.getUniformLocation(texProgram, 'u_NormalMatrix');
    texProgram.u_LightDirection = gl.getUniformLocation(texProgram, 'u_LightDirection');
    texProgram.u_Sampler = gl.getUniformLocation(texProgram, 'u_Sampler');

    if (texProgram.a_Position < 0 || texProgram.a_Normal < 0 || texProgram.a_TexCoord < 0 ||
        !texProgram.u_MvpMatrix || !texProgram.u_NormalMatrix || !texProgram.u_Sampler ||
        !texProgram.u_LightDirection) {
        console.log('Failed to get the storage location of attribute or uniform variable');
        return;
    }

    // Set the vertex information
    var cube = initVertexBuffers(gl);
    if (!cube) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Set texture
    //the last number display which cube is init
    texture1 = initTextures(gl, texProgram,1);
    texture2 = initTextures(gl, texProgram,2);
    texture3 = initTextures(gl, texProgram,3);
    if (!texture1|| !texture2|| !texture3) {
        console.log('Failed to intialize the texture.');
        return;
    }

    // Set the clear color and enable the depth test
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Calculate the view projection matrix
    var viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(30.0, canvas.width/canvas.height, 1.0, 100.0);
    viewProjMatrix.lookAt(x,y,z, x+lx, 0.0, z+lz, 0.0, 1.0, 0.0);
    //viewProjMatrix.lookAt(0.0,0.0,15.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0);


        document.onkeydown = function (ev) {

            if (ev.keyCode == 35) {
                end = 35;
            }

            if(end!=35) {
                var fraction = 0.1;

                switch (ev.keyCode) {
                    case 39: //left key
                        angle -= 0.01;
                        lx = Math.sin(angle);
                        lz = -Math.cos(angle);
                        break;
                    case 37: //right key
                        angle += 0.01;
                        lx = Math.sin(angle);
                        lz = -Math.cos(angle);
                        break;
                    case 38: //down key
                        x -= lx * fraction;
                        z -= lz * fraction;
                        break;
                    case 40: //up key
                        x += lx * fraction;
                        z += lz * fraction;
                        break;
                    default:
                        return;
                }
            }

            // Calculate the view projection matrix
            var viewProjMatrix = new Matrix4();
            viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
            viewProjMatrix.lookAt(x, 0.0, z, x + lx, 0.0, z + lz, 0.0, 1.0, 0.0);

            var currentAngle = 0.0; // Current rotation angle (degrees)
            var tick = function () {
                currentAngle = animate(currentAngle);  // Update current rotation angle

                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear color and depth buffers
                // Draw a cube with texture
                //the last number display which cube is init


                drawTexCube(gl, texProgram, cube, texture3, 2.0, currentAngle, viewProjMatrix, 3);
                drawTexCube(gl, texProgram, cube, texture2, 1.0, currentAngle, viewProjMatrix, 2);
                drawTexCube(gl, texProgram, cube, texture1, 0.0, currentAngle, viewProjMatrix, 1);
                window.requestAnimationFrame(tick, canvas);
            };
            tick();
        }

     //Start drawing
    startDraw(gl,texProgram,cube,viewProjMatrix,canvas);
}

function startDraw(gl,texProgram,cube,viewProjMatrix,canvas){

    var currentAngle = 0.0; // Current rotation angle (degrees)
    var tick = function() {
        currentAngle = animate(currentAngle);  // Update current rotation angle

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear color and depth buffers
        // Draw a cube with texture
        //the last number display which cube is init


        drawTexCube(gl, texProgram, cube, texture3, 2.0, currentAngle, viewProjMatrix,3);
        drawTexCube(gl, texProgram, cube, texture2, 1.0, currentAngle, viewProjMatrix,2);
        drawTexCube(gl, texProgram, cube, texture1, 0.0, currentAngle, viewProjMatrix,1);
        window.requestAnimationFrame(tick, canvas);
    };
    tick();
}

function initVertexBuffers(gl) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3

    var vertices = new Float32Array([   // Vertex coordinates
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
        -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
    ]);

    var normals = new Float32Array([   // Normal
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,     // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,     // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,     // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,     // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,     // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0      // v4-v7-v6-v5 back
    ]);

    var texCoords = new Float32Array([   // Texture coordinates
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
        0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
        1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
    ]);

    var indices = new Uint8Array([        // Indices of the vertices
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);

    var o = new Object(); // Utilize Object to to return multiple buffer objects together

    // Write vertex information to buffer object
    o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
    o.normalBuffer = initArrayBufferForLaterUse(gl, normals, 3, gl.FLOAT);
    o.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
    o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
    if (!o.vertexBuffer || !o.normalBuffer || !o.texCoordBuffer || !o.indexBuffer) return null;

    o.numIndices = indices.length;

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return o;
}

function initTextures(gl, program,cubeNumber) {
    var texture = gl.createTexture();   // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return null;
    }

    var image = new Image();  // Create a image object
    if (!image) {
        console.log('Failed to create the image object');
        return null;
    }
    // Register the event handler to be called when image loading is completed
    image.onload = function() {
        // Write the image data to texture object
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Pass the texure unit 0 to u_Sampler
        gl.useProgram(program);
        gl.uniform1i(program.u_Sampler, 0);

        gl.bindTexture(gl.TEXTURE_2D, null); // Unbind texture
    };

    // Tell the browser to load an Image
    if(cubeNumber == 1){
        image.src = '../resources/lava.jpg';
    }else if(cubeNumber == 2){
        image.src = '../resources/flower.jpg';
    }else if(cubeNumber == 3){
        image.src = '../resources/flower2.png';
    }

    return texture;
}

var sliderBar2 = document.getElementById("cube2");
var sliderBar3 = document.getElementById("cube3");

function drawTexCube(gl, program, o, texture, x, angle, viewProjMatrix,cubeNumber) {
    gl.useProgram(program);   // Tell that this program object is used

    // Assign the buffer objects and enable the assignment
    initAttributeVariable(gl, program.a_Position, o.vertexBuffer);  // Vertex coordinates
    initAttributeVariable(gl, program.a_Normal, o.normalBuffer);    // Normal
    initAttributeVariable(gl, program.a_TexCoord, o.texCoordBuffer);// Texture coordinates
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer); // Bind indices

    // Bind texture object to texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);


    if(cubeNumber == 1) {
        drawCube(gl, program, o, x, angle, viewProjMatrix); // Draw
    }else if(cubeNumber == 2){
        sliderBar2.addEventListener("change",drawCubeAround(gl, program, o, x, angle, viewProjMatrix, cubeNumber,(512-sliderBar2.value)));
    }else if(cubeNumber ==3){
        sliderBar3.addEventListener("change",drawCubeAround(gl, program, o, x, angle, viewProjMatrix, cubeNumber,(510-sliderBar3.value)));
    }
}


// Assign the buffer objects and enable the assignment
function initAttributeVariable(gl, a_attribute, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}

function drawCube(gl, program, o, x, angle, viewProjMatrix) {
    // Coordinate transformation matrix
    var g_modelMatrix = new Matrix4();
    var g_mvpMatrix = new Matrix4();
    var g_normalMatrix = new Matrix4();

    // Calculate a model matrix
    g_modelMatrix.setTranslate(x, 0.0, 0.0);
    //g_modelMatrix.rotate(20.0, 1.0, 0.0, 0.0);
    g_modelMatrix.rotate(100, 1, 1, 0.5);

    // Calculate transformation matrix for normals and pass it to u_NormalMatrix
    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(program.u_NormalMatrix, false, g_normalMatrix.elements);

    // Calculate model view projection matrix and pass it to u_MvpMatrix
    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);

    gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

    // Set the light direction (in the world coordinate)
    var lightDirection = new Vector3([0.5, 2.0, 2.0]);
    lightDirection.normalize();     // Normalize
    gl.uniform3fv(program.u_LightDirection, lightDirection.elements);

    gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0);   // Draw
}


function drawCubeAround(gl, program, o, x, angle, viewProjMatrix, cubeNumber,speed) {
    // Coordinate transformation matrix
    var g_modelMatrix = new Matrix4();
    var g_mvpMatrix = new Matrix4();
    var g_normalMatrix = new Matrix4();

    var rotate_x = 5*Math.sin(Math.PI*angle/speed);
    var rotate_y = 5*Math.cos(Math.PI*angle/speed);

    // Calculate a model matrix
    g_modelMatrix.setTranslate(rotate_x,rotate_y, (6.0 - cubeNumber*6));
    g_modelMatrix.rotate(20.0, 0.0, 0.0, 1.0);
    g_modelMatrix.rotate(angle, 1, 1, 1.5);

    // Calculate transformation matrix for normals and pass it to u_NormalMatrix
    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(program.u_NormalMatrix, false, g_normalMatrix.elements);

    // Calculate model view projection matrix and pass it to u_MvpMatrix
    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

    // Set the light direction (in the world coordinate)
    var lightDirection = new Vector3([0.0, 0.0, 4.0]);
    lightDirection.normalize();     // Normalize
    gl.uniform3fv(program.u_LightDirection, lightDirection.elements);

    gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0);   // Draw
}

function initArrayBufferForLaterUse(gl, data, num, type) {
    var buffer = gl.createBuffer();   // Create a buffer object
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return null;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    // Keep the information necessary to assign to the attribute variable later
    buffer.num = num;
    buffer.type = type;

    return buffer;
}

function initElementArrayBufferForLaterUse(gl, data, type) {
    var buffer = gl.createBuffer();  // Create a buffer object
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return null;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

    buffer.type = type;

    return buffer;
}

var ANGLE_STEP = 30;   // The increments of rotation angle (degrees)

var last = Date.now(); // Last time that this function was called
function animate(angle) {
    var now = Date.now();   // Calculate the elapsed time
    var elapsed = now - last;
    last = now;
    // Update the current rotation angle (adjusted by the elapsed time)
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle;
}