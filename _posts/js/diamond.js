// Boilerplate: direction.cc, adapted from Atilla Szabo's code

let direction = {}

direction.Lx =8;
direction.Ly =8;
direction.Lz =8;

direction.pyro = [
    [ 1, 1, 1],
    [ 1,-1,-1],
    [-1, 1,-1],
    [-1,-1, 1]];

direction.r = [direction.pyro[0]*0.125, direction.pyro[1]*0.125,
                              direction.pyro[2]*0.125, direction.pyro[3]*0.125];

direction.diamond = [[0,0,0], [2,2,2]];

direction.fcc_Dy = [
    [0,0,0],
    [0,4,4],
    [4,0,4],
    [4,4,0]];

direction.fcc_Ti = [
    [4,4,4],
    [4,0,0],
    [0,4,0],
    [0,0,4]];

direction.plaqt = [
    [
	[ 0,-2, 2],
	[ 2,-2, 0],
	[ 2, 0,-2],
	[ 0, 2,-2],
	[-2, 2, 0],
	[-2, 0, 2]],
    [
	[ 0, 2,-2],
	[ 2, 2, 0],
	[ 2, 0, 2],
	[ 0,-2, 2],
	[-2,-2, 0],
	[-2, 0,-2]],
    [
	[ 0,-2,-2],
	[-2,-2, 0],
	[-2, 0, 2],
	[ 0, 2, 2],
	[ 2, 2, 0],
	[ 2, 0,-2]],
    [
	[ 0, 2, 2],
	[-2, 2, 0],
	[-2, 0,-2],
	[ 0,-2,-2],
	[ 2,-2, 0],
	[ 2, 0, 2]]
];

// Square roots of 2, 3, and 6 for normalisation
const S2 = 1.414213562373095048801688724209698078569671875376948073176
const S3 = 1.732050807568877293527446341505872366942805253810380628055
const S6 = 2.449489742783178098197284074705891391965947480656670128432

direction.axis = [
    [[ 1, 1,-2]/S6, [-1, 1, 0]/S2, [ 1, 1, 1]/S3],
    [[ 1,-1, 2]/S6, [-1,-1, 0]/S2, [ 1,-1,-1]/S3],
    [[-1, 1, 2]/S6, [ 1, 1, 0]/S2, [-1, 1,-1]/S3],
    [[-1,-1,-2]/S6, [ 1,-1, 0]/S2, [-1,-1, 1]/S3]
];


const fcc_coords = {'Dy': direction.fcc_Dy, 'Ti': direction.fcc_Ti};

// Global variables
let scene, camera, renderer, controls, clickMouse, moveMouse, raycaster;

// Parameters for the lattice
let Nx = 2;
let Ny = 2;
let Nz = 2;

let unitcells = []

// the parent
let mum = document.getElementById('3D_TARGET'); 

// Assets

let materialsA = {
		'Dy':  {color: 0x9cc968, flatShading: false, transparent: true} ,
		'Ti':  {color: 0x9568c9, flatShading: false, transparent: true} 
}

let materialsB = {
		'Dy':  {color: 0x638003, flatShading: false, transparent: true} ,
		'Ti':  {color: 0x604350, flatShading: false, transparent: true} 
}

let materials_pyro = {
		'Dy':  {color: 0x040404, flatShading: false, transparent: true},
		'Ti':  {color: 0x888888, flatShading: false, transparent: true} 
}



// Create Scene and lights
function init() {
    // SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    // CAMERA
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(20, 20, 40);

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);

    // rescale everything
    onWindowResize();

    renderer.shadowMap.enabled = true;
    mum.appendChild(renderer.domElement);

    // CAMERA MOVEMENT CONTROLS
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(Nx*4, Ny*4, Nz*4);
    controls.enableDamping = true;
    controls.update();

    // LIGHTS
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.30);
    let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-30, 50, 150);
    scene.add(ambientLight);
    scene.add(directionalLight);

    // RAYCASTING (mouse functionality)
    raycaster = new THREE.Raycaster();
    clickMouse = new THREE.Vector2();
    moveMouse = new THREE.Vector2();

    // scene.fog = new THREE.Fog();

    // FLOOR
//    let floor = new THREE.Mesh(
//        new THREE.BoxBufferGeometry(2000, 3, 2000),
//        new THREE.MeshPhongMaterial({ color: 0x1B8F06 })
//    );
//    floor.isDraggable = false;
//    scene.add(floor);


    // DIAMOND LATTICE
	construct_qsi();

};


// Build the arrays from qsi.cc
let qsi = {
		m_spin: [], // all spins
        m_plaq: [], // all plaquettes
		m_tetra: [], // all tetrahedra
		m_ptetra: [] // all dual tetrahedra
}


function spin_at(pos){
	// make a copy so we don't do anything weird and nonlocal
	pos = pos.slice()

	let alldiv = (v, b) => v[0]%b ===0 && v[1]%b === 0 && v[2]%b ===0;

	let sl = -1;
	for (let i=0; i<4; i++) {
		if (alldiv(v3_sub(pos, direction.pyro[i]), 4)){
			sl = i;
			break;
		}
	}
	if (sl < 0) throw "Invalid sublattice";
	pos = v3_sub(pos, direction.pyro[sl]);

	let inc = -1;
	for (let i=0; i<4; i++) {
		if (alldiv(v3_sub(pos, direction.fcc_Dy[i]), 8) == 0){
			inc = i;
			break;
		}
	}
	if (inc < 0) throw "Invalid FCC reference";
	pos = v3_sub(pos, fcc_Dy[inc]);

	let x = mod(pos[0]/8, Nx);
	let y = mod(pos[1]/8, Ny);
	let z = mod(pos[2]/8, Nz);
	let cell = (x*Ny+y)*Nz+z;

	return qsi.m_spin[16*cell+4*inc+sl];
}

const flip = new THREE.Matrix4();
flip.makeRotationX(Math.PI/2);
const sphere_shape = new THREE.SphereGeometry(0.2,32,32);
const tetraA_shape = new THREE.TetrahedronGeometry(Math.sqrt(3));
const tetraB_shape = new THREE.TetrahedronGeometry(Math.sqrt(3));
tetraB_shape.applyMatrix4(flip);

function construct_hexagon_shape(subl){
	// the hexagon
	hex = new THREE.BufferGeometry();
	let positions = [];
	let normals = [];
	let uvs = [];

	//oriented out pf the A sites
	let norm = direction.pyro[subl];

	// iterate over neighbours
	for (let n=0; n<6; n++){
			pos1 = direction.plaqt[subl][n];
			pos2 = direction.plaqt[subl][(n+1)%6];

			positions.push(...pos1);
			normals.push(...norm);
			uvs.push(0,1);

			positions.push(...pos2);
			normals.push(...norm);
			uvs.push(1,1);

			positions.push(0,0,0);
			normals.push(...norm);
			uvs.push(0,0)


	}
	const positionNumComponents = 3;
	  const normalNumComponents = 3;
	  const uvNumComponents = 2;
	  hex.setAttribute(
		  'position',
		  new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
	  hex.setAttribute(
		  'normal',
		  new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
	  hex.setAttribute(
		  'uv',
		  new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
	return hex;
}

const hexagon_shapes = [0,1,2,3].map(i => construct_hexagon_shape(i));

function v3_add(v1, v2){
	return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}

function v3_sub(v1, v2){
	return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

function construct_qsi(){
	for (let i=0; i<Nx; i++){
		for (let j=0; j<Ny; j++){
			for (let k=0; k<Nz; k++){
				let cubic = [i*8, j*8, k*8];

				// Spins and Tetrahedra
				for (let fcc=0; fcc<4; fcc++) {
					fcc_r = v3_add(cubic,direction.fcc_Dy[fcc]);
				    for (let ssl=0; ssl<4; ssl++){
						pos = v3_add(fcc_r, direction.pyro[ssl]);
						spin = new THREE.Mesh(sphere_shape, new THREE.MeshPhongMaterial(materials_pyro['Dy']));
						spin.subl = ssl;
						spin.plaqs = [];
						spin.position.set(...pos);
						
						scene.add(spin);
						qsi.m_spin.push(spin);
				    }
					tetraA = new THREE.Mesh(tetraA_shape, new THREE.MeshPhongMaterial(materialsA['Dy']));
					tetraB = new THREE.Mesh(tetraB_shape, new THREE.MeshPhongMaterial(materialsB['Dy']));
					tetraA.subl = 'A';
					tetraB.subl = 'B';
					tetraA.position.set(...v3_add(fcc_r,direction.diamond[0]));
					tetraB.position.set(...v3_add(fcc_r,direction.diamond[1]));
				    

					scene.add(tetraA);
					scene.add(tetraB);
					qsi.m_tetra.push(tetraA);
				    qsi.m_tetra.push(tetraB);
				}

				// Plaquettes and dual tetrahedra
				for (let fcc=0; fcc<4; fcc++) {
					fcc_r = v3_add(cubic,direction.fcc_Ti[fcc]);
				    for (let psl=0; psl<4; psl++){
						pos = v3_add(fcc_r, direction.pyro[psl]);

						plaq = new THREE.Mesh(hexagon_shapes[psl], new THREE.MeshPhongMaterial(materials_pyro['Ti']));
						plaq.subl = psl;
						plaq.spins = [];
						plaq.position.set(...pos);
						
						scene.add(plaq);
						qsi.m_plaq.push(plaq);
				    }
					tetraA = new THREE.Mesh(tetraA_shape, new THREE.MeshPhongMaterial(materialsA['Ti']));
					tetraB = new THREE.Mesh(tetraB_shape, new THREE.MeshPhongMaterial(materialsB['Ti']));
					tetraA.subl = 'A';
					tetraB.subl = 'B';
					tetraA.position.set(...v3_add(fcc_r,direction.diamond[0]));
					tetraB.position.set(...v3_add(fcc_r,direction.diamond[1]));
				    

					scene.add(tetraA);
					scene.add(tetraB);
					qsi.m_ptetra.push(tetraA);
				    qsi.m_ptetra.push(tetraB);
				}
				

				// REGISTRATION: spins and plaquettes (ignore the tetrahedra for now)
				for (let p of qsi.m_plaq) {
					for (let j = 0; j < 6; ++j) {
						let r = [];
						r[0] = p.position.x + direction.plaqt[p.subl][j][0];
						r[1] = p.position.y + direction.plaqt[p.subl][j][1];
						r[2] = p.position.z + direction.plaqt[p.subl][j][2];
						// s = spin_at(r);
						// s.plaqs.push(p);
					}
				}
			}
		}
	}
}



///////////////////////////////////////////////////

// Interactivity Implementation

let INTERSECTED;
const pointer = new THREE.Vector2();


function highlight_obj() {
	INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
	INTERSECTED.material.emissive.setHex( 0xff0000 );
	INTERSECTED.material.transparent=false;
}

function unhighlight_obj() {
	INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
	INTERSECTED.material.transparent=true;
}



function render() {
	
	raycaster.setFromCamera( pointer, camera );

		const intersects = raycaster.intersectObjects( scene.children, false );
		if ( intersects.length > 0 ) {
			
			if ( intersects.length>0 ) {
				if ( INTERSECTED != intersects[ 0 ].object && intersects[ 0 ].object.visible) {
					if ( INTERSECTED ) unhighlight_obj();

					INTERSECTED = intersects[ 0 ].object;
					highlight_obj();
				}
			}

		} else {

			if ( INTERSECTED ) unhighlight_obj();
			INTERSECTED = null;
		}
	renderer.render( scene, camera );
}


// Recursive function to render the scene
function animate() {
    controls.update();
	render()
    requestAnimationFrame(animate);
};

// Re-renders the scene upon window resize
function onWindowResize() {
	h = mum.offsetHeight;
	w = mum.offsetWidth;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}


// function getClicked3DPoint(evt) {
//     evt.preventDefault();

//     mousePosition.x = ((evt.clientX - canvasPosition.left) / canvas.width) * 2 - 1;
//     mousePosition.y = -((evt.clientY - canvasPosition.top) / canvas.height) * 2 + 1;

//     rayCaster.setFromCamera(mousePosition, camera);
//     var intersects = rayCaster.intersectObjects(scene.getObjectByName('MyObj_s').children, true);

//     if (intersects.length > 0)
//         return intersects[0].point;
// };
let canvas;

// raycasting
function onPointerMove( event ) {
	rect = canvas.getBoundingClientRect();
	pointer.x = ( (event.clientX - rect.left) / rect.width ) * 2 - 1;
	pointer.y = - ( (event.clientY-rect.top) / rect.height ) * 2 + 1;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// Interactivity Attachments

function update_materials(which, op) {
	qsi[which].forEach((t)=>{
		t.material.opacity=op;
		if (op ==0) {
			t.visible=false;
		} else {
			t.visible=true;
		}
	});
}

// Start the program
document.addEventListener("DOMContentLoaded",function () {
	
    window.addEventListener('resize', onWindowResize, false);
    init();
    animate();

	document.getElementById('Dy_slider').oninput = function() {update_materials("m_tetra", this.valueAsNumber/100)} ;
	document.getElementById('Ti_slider').oninput = function(){update_materials("m_ptetra", this.valueAsNumber/100)} ;
	document.getElementById('pyro_Dy_slider').oninput = function(){update_materials("m_spin", this.valueAsNumber/100)} ;
	document.getElementById('pyro_Ti_slider').oninput = function(){update_materials("m_plaq", this.valueAsNumber/100)} ;
	
	
	for (slider of document.querySelectorAll('.slider')){
		slider.oninput();
	}

	canvas= document.getElementById('3D_TARGET').children[0];
	canvas.addEventListener('mousemove', onPointerMove);

});


