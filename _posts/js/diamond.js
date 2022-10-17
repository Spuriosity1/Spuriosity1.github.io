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
let Nx=1;
let Ny=1;
let Nz=1;
// Parameters for the lattice

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
		'Ti':  {color: 0x888888, flatShading: false, transparent: true, side: THREE.DoubleSide} 
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
    //controls.target.set(4,4,4);
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

	visons.forEach((v)=>{scene.add(v); v.visible=false;});

};


// Build the arrays from qsi.cc
let qsi = {
		m_spin: [], // all spins
        m_plaq: [], // all plaquettes
		m_tetra: [], // all tetrahedra
		m_ptetra: [] // all dual tetrahedra
}

function mod(n, m) {
	return ((n % m) + m) % m;
}
  

function spin_at(pos){
	// make a copy so we don't do anything weird and nonlocal
	pos = pos.slice()

	let alldiv = (v, b) => (v[0]%b ===0 && v[1]%b === 0 && v[2]%b ===0);

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
		if (alldiv(v3_sub(pos, direction.fcc_Dy[i]), 8)){
			inc = i;
			break;
		}
	}
	if (inc < 0) throw "Invalid FCC reference";
	pos = v3_sub(pos, direction.fcc_Dy[inc]);

	let x = mod(pos[0]/8, Nx);
	let y = mod(pos[1]/8, Ny);
	let z = mod(pos[2]/8, Nz);
	let cell = (x*Ny+y)*Nz+z;

	return qsi.m_spin[16*cell+4*inc+sl];
}

//////////////////////////// GEOMETRY

const flip = new THREE.Matrix4();
flip.makeRotationX(Math.PI/2);
const sphere_shape = new THREE.SphereGeometry(0.2,32,32);
const tetraA_shape = new THREE.TetrahedronGeometry(Math.sqrt(3));
const tetraB_shape = new THREE.TetrahedronGeometry(Math.sqrt(3));

const bigsphere_shape = new THREE.SphereGeometry(0.8,32,32);
tetraB_shape.applyMatrix4(flip);

// Create the arow geometry
//
function construct_arrow_geometry(length, stem_radius=null, head_radius=null, head_len=null){
	// defualts
	if (stem_radius == null) {
		stem_radius = length/10;
	}
	if (head_radius ==null) {
		head_radius = 2*stem_radius;
	}
	if (head_len == null) {
		head_len = 2*stem_radius;
	}	
	const points = [];
	for (let xy of [[stem_radius, 0],[ stem_radius, length-head_len],[ head_radius, length-head_len],[0, length]]){
		points.push(new THREE.Vector2( xy[0], xy[1] ));
	}
	return new THREE.LatheGeometry( points , 13 );
}

const arrow3d_shape = construct_arrow_geometry(1, 0.1, 0.2, 0.2);

function construct_hexagon_shape(subl){
	// the hexagon
	let hex = new THREE.BufferGeometry();
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

function v3_mul(a, v){
	return [a*v[0], a*v[1], a*v[2]];
}

function construct_qsi(){

    controls.target.set(4*Nx,4*Ny,4*Nz);
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
						spin.fcc_parent = [...fcc_r];
						
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
						plaq.fcc_parent = [...fcc_r];
						
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
			}
		}
	}
	
	// REGISTRATION: spins and plaquettes (ignore the tetrahedra for now)
	for (let p of qsi.m_plaq) {
		p.spin_neighbour = []
		for (let j = 0; j < 6; ++j) {
			let r = [];
			r[0] = p.position.x + direction.plaqt[p.subl][j][0];
			r[1] = p.position.y + direction.plaqt[p.subl][j][1];
			r[2] = p.position.z + direction.plaqt[p.subl][j][2];
			r = r.map(xi => Math.round(xi));
			s = spin_at(r);
			s.plaqs.push(p);
			p.spins.push(s);
			p.spin_neighbour.push(new THREE.Vector3(...direction.plaqt[p.subl][j]))
		}
	}
			
}

function delete_qsi(){
	qsi.m_spin.forEach((s) => {
		s.material.dispose();
		s.geometry.dispose();
		scene.remove(s);
	} );
	qsi.m_tetra.forEach((t) => {
		t.geometry.dispose();
		t.material.dispose();
		scene.remove(t);
	} );
	qsi.m_ptetra.forEach((p) => {
		p.geometry.dispose();
		p.material.dispose();
		scene.remove(p);
	} );
	qsi.m_plaq.forEach((p) => {
		p.geometry.dispose();
		p.material.dispose();
		scene.remove(p);
	} );
	qsi.m_plaq = []
	qsi.m_ptetra = []
	qsi.m_tetra = []
	qsi.m_spin = []
}


///////////////////////////////////////////////////

// Interactivity Implementation

let INTERSECTED;
const pointer = new THREE.Vector2();


function highlight_obj() {
	if (INTERSECTED['material'] == undefined || INTERSECTED['material']['emissive'] == undefined){
		return;
	}
	INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
	INTERSECTED.material.emissive.setHex( 0xff0000 );
	INTERSECTED.material.transparent=false;
}

function unhighlight_obj() {
	if (INTERSECTED.material == undefined 
	|| INTERSECTED.material.emissive == undefined
	|| INTERSECTED.currentHex == undefined
	|| INTERSECTED['stay_highlighted'] === true){
		return;
	}
	INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
	INTERSECTED.material.transparent=true;
}

// Light up the three plaquette surfaces
//
function highlight_planes(){
	reset_plaqs()
	qsi.m_plaq.forEach( p => {
		let em = p.material.emissive;
		if(Math.abs(p.position.x+1) < 1){
    		em.setHex(0xff0000);
  		}
		if(Math.abs(p.position.y+1) < 1){
    		em.setHex(em.getHex() | 0x00ff00);
  		}
		if(Math.abs(p.position.z+1) < 1){
    		em.setHex(em.getHex() | 0x0000ff);
  		}
	});
}


function reset_plaqs(){
	qsi.m_plaq.forEach( p => {
    	p.material.emissive.setHex(0x000000);
	});
}


function render() {
	
	raycaster.setFromCamera( pointer, camera );

	const intersects = raycaster.intersectObjects( scene.children, false );
	let interactive = document.getElementById('plaq_checkbox').checked 
	|| document.getElementById('delete_checkbox').checked
	|| document.getElementById('log_checkbox').checked;
	if  (document.getElementById('lightsaber_checkbox').checked) {
		for (let i=0; i<intersects.length; i++) {
			scene.remove(intersects[i].object);
		}
	} else if ( intersects.length > 0 && interactive ) {
		for (let i=0; i<intersects.length; i++) {
			if (INTERSECTED == intersects[i]) break;
			if ( intersects[ i ].object.visible) {
				if ( INTERSECTED ) unhighlight_obj();

				INTERSECTED = intersects[ i ].object;
				highlight_obj();
				break;
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
	render();
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

let canvas;

// raycasting
function onPointerMove( event ) {
	rect = canvas.getBoundingClientRect();
	pointer.x = ( (event.clientX - rect.left) / rect.width ) * 2 - 1;
	pointer.y = - ( (event.clientY-rect.top) / rect.height ) * 2 + 1;
}

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

function update_scaling(scale) {

	let s = scale;

	qsi['m_tetra'].forEach((t)=>{
		if (t.subl == 'A') {
			t.scale.set(1+s,1+s,1+s);
		}
		else if (t.subl == 'B') 
		{
			t.scale.set(1-s,1-s,1-s);
		}
	});
	qsi['m_spin'].forEach((spin)=>{
		spin.position.set(...v3_add(spin.fcc_parent, v3_mul(1+s,direction.pyro[spin.subl]))); 
	});
	
	s = -scale/3;
	qsi['m_ptetra'].forEach((t)=>{
		if (t.subl == 'A') {
			t.scale.set(1+s,1+s,1+s);
		}
		else if (t.subl == 'B') 
		{
			t.scale.set(1-s,1-s,1-s);
		}
	});


	qsi['m_plaq'].forEach((spin)=>{
		spin.position.set(...v3_add(spin.fcc_parent, v3_mul(1+s,direction.pyro[spin.subl]))); 
		let ss = Math.min(1-s, 1+s);
		spin.scale.set(ss,ss,ss);
	});

}


function handleClick(e) {
	if (!INTERSECTED) return;
	let obj = INTERSECTED; // in case the user moves the mouse

	if (document.getElementById('plaq_checkbox').checked && e.which === 3) {
		
		if (obj['spins'] != undefined && obj['spin_neighbour'] != undefined){
			// Plaquette annotations
			obj.spins.forEach( (xi,i) =>{
				/*let linegeo = new THREE.BufferGeometry().setFromPoints([
					new THREE.Vector3(...obj.position),
					new THREE.Vector3(...xi.position)]);
				let line = new THREE.Line(linegeo, lineMaterials[i]);
				scene.add(line);
				*/
				let arrow = new THREE.Mesh(arrow3d_shape, lineMaterials[i]);
				arrow.position.set(...obj.position);
				//let next = xi.position.clone().addScaledVector(arrow.position.clone(),-1).normalize();
				//
				let next = obj.spin_neighbour[i].normalize();
				arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), next);
				scene.add(arrow);
			});
		}
	}

	if (document.getElementById('delete_checkbox').checked && e.which === 1){
		scene.remove(obj);
	}

	if (document.getElementById('log_checkbox').checked && e.which === 3){	
		if ( obj['stay_highlighted'] === true ) {
			obj['stay_highlighted'] = false;
			//console.log("unhighlight");
			//
			// This is broken, but it's good enough
			obj.material.emissive.setHex( obj.currentHex );
			obj.material.transparent=true;
		} else {
			obj['stay_highlighted'] = true;
			console.log(obj.position);
		}
			
		
	}
	// console.log(INTERSECTED);

}


let visons = [];
for (let i=0; i<8; i++){
	let material = new THREE.MeshPhongMaterial({color:(i%2==0?0xc0c0ff:0x0000ff)});
	visons.push(new THREE.Mesh(sphere_shape,material));
}



function addVisonOctupole(N){
	let sys_size = 4*N+1
	visons[0].position.set(...v3_add(direction.fcc_Ti[0], [8*(2*N), 8*(2*N), 8*(2*N)]));
	visons[2].position.set(...v3_add(direction.fcc_Ti[1], [8*(2*N), 0, 0 ]));
	visons[4].position.set(...v3_add(direction.fcc_Ti[2], [0, 8*(2*N), 0 ]));
	visons[6].position.set(...v3_add(direction.fcc_Ti[3], [0, 0, 8*(2*N)]));

	visons[1].position.set(...v3_add(v3_add(direction.fcc_Ti[0],direction.diamond[1]), [8*(3*N), 8*(3*N), 8*(3*N)]));
	visons[3].position.set(...v3_add(v3_add(direction.fcc_Ti[1],direction.diamond[1]), [8*(3*N), 8*N, 8*N ]));
	visons[5].position.set(...v3_add(v3_add(direction.fcc_Ti[2],direction.diamond[1]), [8*N, 8*(3*N), 8*N ]));
	visons[7].position.set(...v3_add(v3_add(direction.fcc_Ti[3],direction.diamond[1]), [8*N, 8*N, 8*(3*N)]));

	visons.forEach((v)=>{v.visible = true;});
}

	


////////////////////////////////////////////////////////////////////////////////////////////////////////
// Interactivity Attachments




colors = [0xff0000, 0xFFDF00, 0x04ff00, 0x00ffff,0x0004ff, 0xF702FD];

const lineMaterials = [];
colors.forEach( 
	(c)=>{lineMaterials.push(new THREE.MeshPhongMaterial( { color: c} ))
});

// Start the program
document.addEventListener("DOMContentLoaded",function () {
	
    window.addEventListener('resize', onWindowResize, false);
    init();
    animate();

	document.getElementById('Dy_slider').oninput = function() {update_materials("m_tetra", this.valueAsNumber/100)} ;
	document.getElementById('Ti_slider').oninput = function(){update_materials("m_ptetra", this.valueAsNumber/100)} ;
	document.getElementById('pyro_Dy_slider').oninput = function(){update_materials("m_spin", this.valueAsNumber/100)} ;
	document.getElementById('pyro_Ti_slider').oninput = function(){update_materials("m_plaq", this.valueAsNumber/100)} ;
	document.getElementById('breathing_slider').oninput = function(){update_scaling(this.valueAsNumber/100)} ;
	document.getElementById('system-size').onchange = function(){
		if (this.valueAsNumber < 0 || this.valueAsNumber > 6) return;
		Nx = this.valueAsNumber;
		Ny = this.valueAsNumber;
		Nz = this.valueAsNumber;
		delete_qsi();
		construct_qsi();
		for (slider of document.querySelectorAll('.live')){
			slider.oninput();
		}
	} ;

	
	document.getElementById('surface_checkbox').oninput = function() { if (this.checked) { highlight_planes() } else {reset_plaqs()} };



	document.getElementById('tetra_dropdown').oninput = function() { 
		if (this.value == "Tetrahedra") {
			qsi.m_tetra.forEach( t => {
				t.geometry = (t.subl === "A") ? tetraA_shape : tetraB_shape;
			});
			qsi.m_ptetra.forEach( t => {
				t.geometry = (t.subl === "A") ? tetraA_shape : tetraB_shape;
			});
		} else {	
			qsi.m_tetra.forEach( t => {
				t.geometry = bigsphere_shape
			});
			qsi.m_ptetra.forEach( t => {
				t.geometry = bigsphere_shape
			});
		}
	};


	// run the listeners once to handle cached values
		for (slider of document.querySelectorAll('.live')){
			slider.oninput();
		}
	

	canvas= mum.children[0];
	canvas.addEventListener('mousemove', onPointerMove);
	canvas.addEventListener('mousedown', handleClick);

});


