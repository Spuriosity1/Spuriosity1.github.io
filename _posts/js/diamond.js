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
//

let shapesA = {
		'Dy': new THREE.SphereGeometry(1,32,32),
		'Ti': new THREE.SphereGeometry(1,32,32),
}

let shapesB = {
		'Dy': new THREE.SphereGeometry(1,32,32),
		'Ti': new THREE.SphereGeometry(1,32,32),
}


let shapes_pyro = {
		'Dy': new THREE.SphereGeometry(0.8,32,32),
		'Ti': new THREE.SphereGeometry(0.8,32,32),
}

let materialsA = {
		'Dy': new THREE.MeshPhongMaterial( {color: 0x9cc968, flatShading: false} ),
		'Ti': new THREE.MeshPhongMaterial( {color: 0x9568c9, flatShading: false} )
}

let materialsB = {
		'Dy': new THREE.MeshPhongMaterial( {color: 0x638003, flatShading: false} ),
		'Ti': new THREE.MeshPhongMaterial( {color: 0x604350, flatShading: false} )
}


let materials_pyro = {
		'Dy': new THREE.MeshPhongMaterial( {color: 0x040404, flatShading: false, transparent: true} ),
		'Ti': new THREE.MeshPhongMaterial( {color: 0x888888, flatShading: false, transparent: true} )
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

    scene.fog = new THREE.Fog();

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
		m_tera: [], // all tetrahedra
		m_ptetra: [] // all dual tetrahedra
}


function spin_at(pos){
	// make a copy so we don't do anything weird and nonlocal
	pos = pos.slice()
	let sl = -1;
	for (let i=0; i<4; i++) {
		if (pos.every((xj,j) => (xj - direction.pyro[i][j]) %4 == 0 )){
			sl = i;
			break;
		}
	}
	if (sl < 0) throw "Invalid sublattice";
	pos.map( (pos,i) => pos - direction.pyro[sl][i]);

	let inc = -1;
	for (let i=0; i<4; i++) {
			if (pos.every((xj,j) => (xj - direction.fcc_Dy[i][j]) %8 == 0 )){
					inc = i;
					break;
			}
	}
	if (inc < 0) throw "Invalid FCC reference";
	pos.map( (pos,i) => pos - direction.fcc_Dy[inc][i]);

	let x = mod(pos[0]/8, Nx);
	let y = mod(pos[1]/8, Ny);
	let z = mod(pos[2]/8, Nz);
	let cell = (x*Ny+y)*Nz+z;


	return qsi.m_spin[16*cell+4*inc+sl];
}

function construct_qsi(){
	for (let i=0; i<Nx; i++){
		for (let j=0; j<Ny; j++){
			for (let k=0; k<Nz; k++){
				for (let fcc=0; fcc<4; fcc++) {
				    for (let ssl=0; ssl<4; ssl++){
						spin = unitcells[i][j][k]['pyro_Dy'][fcc*4+ssl]
						// Monkey Patch 
						spin.subl = ssl;
						spin.plaqs = []
						qsi.m_plaq.push(spin)
				    }
				    qsi.m_ptetra.push(unitcells[i][j][k]['Dy'][2*fcc])
				    qsi.m_ptetra.push(unitcells[i][j][k]['Dy'][2*fcc+1])
				}
				for (let fcc=0; fcc<4; fcc++) {
				    for (let psl=0; psl<4; psl++){
						plaq = unitcells[i][j][k]['pyro_Ti'][fcc*4+psl]
						// Monkey Patch 
						plaq.subl = psl;
						qsi.m_plaq.push(plaq)
				    } 
				    qsi.m_ptetra.push(unitcells[i][j][k]['Ti'][2*fcc])
				    qsi.m_ptetra.push(unitcells[i][j][k]['Ti'][2*fcc+1])
				}

				for (let p of qsi.m_plaq) {
					for (let j = 0; j < 6; ++j) {
						let r = [];
						r[0] = p.position.x + direction.plaqt[p.subl][j][0];
						r[1] = p.position.y + direction.plaqt[p.subl][j][1];
						r[2] = p.position.z + direction.plaqt[p.subl][j][2];
						s = spin_at(r);
						s.plaqs.push(p);
					}
				}
			}
		}
	}
}


// Recursive function to render the scene
function animate() {
    controls.update();
    renderer.render(scene, camera);
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


function update_sizeof(member,size){
	for (let i=0; i<Nx; i++){
		for (let j=0; j<Ny; j++){
			for (let k=0; k<Nz; k++){
				unitcells[i][j][k][member].forEach(
						(sph) => {sph.scale.set(size,size,size);}
				);
			}
		}
	}
}


function update_shape(member,subl,shape){
	for (let i=0; i<Nx; i++){
		for (let j=0; j<Ny; j++){
			for (let k=0; k<Nz; k++){
				unitcells[i][j][k][member].forEach(function(sph, i){
								if (i%2 == subl% 2) {
										sph.geom
										sph.geometry=shape;
								} 
						});
			}
		}
	}
}


function construct_hexagon(subl){
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



function onShapeToggle(isdual) {
    if ( ! document.getElementById(isdual+'_checkbox').checked ) {
			// Spheres
        update_shape(isdual, 0, shapesA[isdual]);
        update_shape(isdual, 1, shapesB[isdual]);
	} else {
		tetraA = new THREE.TetrahedronGeometry(2);
		tetraB = new THREE.TetrahedronGeometry(2);
		tetraB.applyMatrix4(flip)
        update_shape(isdual, 0, tetraA);
        update_shape(isdual, 1, tetraB);
    }
}


const hexagons = [construct_hexagon(0), construct_hexagon(1),construct_hexagon(2),construct_hexagon(3)];

function onHexToggle(isdual) {
    if ( ! document.getElementById('pyro_'+isdual+'_checkbox').checked ) {
// horrible kludge
        update_shape('pyro_'+isdual, 0, shapes_pyro[isdual]);
        update_shape('pyro_'+isdual, 1, shapes_pyro[isdual]);

		materials_pyro[isdual].opacity=1;

	} else {
			materials_pyro[isdual].opacity=0.5;
			for (let i=0; i<Nx; i++){
				for (let j=0; j<Ny; j++){
					for (let k=0; k<Nz; k++){
						unitcells[i][j][k]['pyro_'+isdual].forEach(function(sph, l){
							sph.geometry=hexagons[l%4];

								});
					}
				}
			}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////

// Interactivity
document.getElementById('Dy_slider').oninput = function() {
	update_sizeof('Dy',this.valueAsNumber/100);
}

document.getElementById('Ti_slider').oninput = function() {
	update_sizeof('Ti',this.valueAsNumber/100);
}


document.getElementById('pyro_Dy_slider').oninput = function() {
	update_sizeof('pyro_Dy',this.valueAsNumber/100);
}

document.getElementById('pyro_Ti_slider').oninput = function() {
	update_sizeof('pyro_Ti',this.valueAsNumber/100);
}

const flip = new THREE.Matrix4()
flip.makeRotationX(3.14159/2)

// Swaps
document.getElementById('Dy_checkbox').onclick = ()=>onShapeToggle('Dy')

document.getElementById('Ti_checkbox').onclick = ()=>onShapeToggle('Ti')

document.getElementById('pyro_Dy_checkbox').onclick = ()=>onHexToggle('Dy')

document.getElementById('pyro_Ti_checkbox').onclick = ()=>onHexToggle('Ti')


// Start the program
document.addEventListener("DOMContentLoaded",function () {
    window.addEventListener('resize', onWindowResize, false);
    init();
    animate();

		onShapeToggle('Dy');
		onShapeToggle('Ti');
		onHexToggle('Dy');
		onHexToggle('Ti');


		document.getElementById('Dy_slider').value = 87;
		document.getElementById('Ti_slider').value = 87;
		document.getElementById('pyro_Dy_slider').value = 50;
		document.getElementById('pyro_Ti_slider').value = 100;

		update_sizeof('Ti',0.87);
		update_sizeof('Ti',0.87);
		update_sizeof('pyro_Dy',0.50);
		update_sizeof('pyro_Ti',1);
});


