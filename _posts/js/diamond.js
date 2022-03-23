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
let Nx = 4;
let Ny = 4;
let Nz = 4;

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
		'Dy': new THREE.MeshPhongMaterial( {color: 0x040404, flatShading: false} ),
		'Ti': new THREE.MeshPhongMaterial( {color: 0x888888, flatShading: false} )
}



// Create Scene and lights
function init() {
    // SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    // CAMERA
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(100, 100, 200);

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

    // FLOOR
//    let floor = new THREE.Mesh(
//        new THREE.BoxBufferGeometry(2000, 3, 2000),
//        new THREE.MeshPhongMaterial({ color: 0x1B8F06 })
//    );
//    floor.isDraggable = false;
//    scene.add(floor);


    // DIAMOND LATTICE




    for (let i=0; i<Nx; i++){
		unitcells.push([]);
		for (let j=0; j<Ny; j++){
			unitcells[i].push([])
	    	for (let k=0; k<Nz; k++){
        	        let cell = {
				'Dy':[],
				'Ti':[],
				'pyro_Dy':[],
				'pyro_Ti':[]
			}
		    for (key of ['Dy','Ti']){
				    for (xyz of fcc_coords[key]) {
						x = i*direction.Lx + xyz[0];
						y = j*direction.Ly + xyz[1];
						z = k*direction.Lz + xyz[2];

						// diamond A sublattice
						let sphere = new THREE.Mesh(shapesA[key], materialsA[key]);
						sphere.position.x = x;
						sphere.position.y = y;
						sphere.position.z = z;
						scene.add(sphere);
						cell[key].push(sphere);

						// the B sublattice
						sphere = new THREE.Mesh(shapesB[key], materialsB[key]);
						sphere.position.x = x + direction.diamond[1][0];
						sphere.position.y = y + direction.diamond[1][1];
						sphere.position.z = z + direction.diamond[1][2];
						scene.add(sphere);
						cell[key].push(sphere);


						// Pyrochlore sites are indexed off the A sublattice
						
						for (let subl=0; subl<4; subl++){
								
								sphere = new THREE.Mesh(shapes_pyro[key], materials_pyro[key]);
								sphere.position.x = x + direction.pyro[subl][0];
								sphere.position.y = y + direction.pyro[subl][1];
								sphere.position.z = z + direction.pyro[subl][2];
								scene.add(sphere);
								cell['pyro_'+key].push(sphere);
						}
					}
		    }


	    	   unitcells[i][j].push(cell);
	    	}
		}
    }


};



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
										sph.geometry=shape;
								} 
						});
			}
		}
	}
}

  		

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


// Start the program
document.addEventListener("DOMContentLoaded",function () {
		document.getElementById('Dy_slider').value = 100;
		document.getElementById('Ti_slider').value = 100;
		document.getElementById('pyro_Dy_slider').value = 100;
		document.getElementById('pyro_Ti_slider').value=100;

    window.addEventListener('resize', onWindowResize, false);
    init();
    animate();

		onShapeToggle('Dy')
		onShapeToggle('Ti')
});


