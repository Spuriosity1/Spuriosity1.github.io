// Maths
//



// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean=0, stdev=1) {
    let u = 1 - Math.random(); //Converting [0,1) to (0,1)
    let v = Math.random();
    let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}




// Geometry

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

const axis_raw = [
    [[ 1, 1,-2], [-1, 1, 0], [ 1, 1, 1]],
    [[ 1,-1, 2], [-1,-1, 0], [ 1,-1,-1]],
    [[-1, 1, 2], [ 1, 1, 0], [-1, 1,-1]],
    [[-1,-1,-2], [ 1,-1, 0], [-1,-1, 1]]
]

direction.axis = []


function construct_direction () {
for (let ssl = 0; ssl < 4; ssl++){
	let r = axis_raw[ssl];
	for (let j=0; j<3; j++) {
		r[j] = new THREE.Vector3(...r[j]);
		r[j].normalize();
	}
	let m = new THREE.Matrix3();
	m.set(
		r[0].x, r[0].y, r[0].z,
		r[1].x, r[1].y, r[1].z,
		r[2].x, r[2].y, r[2].z
	);

	m.transpose();
	direction.axis[ssl] = m;
}
}


const fcc_coords = {'Dy': direction.fcc_Dy, 'Ti': direction.fcc_Ti};

// Global variables
let scene, camera, renderer, controls, clickMouse, moveMouse, raycaster;
let Nx=1;
let Ny=1;
let Nz=1;
// Parameters for the lattice

let unitcells = []

// the parent
const mum = document.getElementById('3D_TARGET'); 

// Assets

const materialsA = {
		'Dy':  {color: 0x9cc968, flatShading: false, transparent: true} ,
		'Ti':  {color: 0x9568c9, flatShading: false, transparent: true} 
}

const materialsB = {
		'Dy':  {color: 0x638003, flatShading: false, transparent: true} ,
		'Ti':  {color: 0x604350, flatShading: false, transparent: true} 
}

const materials_pyro = {
		'Dy':  {color: 0x040404, flatShading: false, transparent: true},
		'Ti':  {color: 0x888888, flatShading: false, transparent: true, side: THREE.DoubleSide} 
}

const posSpinonMaterial = new THREE.MeshPhongMaterial( { color: 0xab5640,  flatShading: false, transparent: true} );
const negSpinonMaterial = new THREE.MeshPhongMaterial( { color: 0x4095ab, flatShading: false, transparent: true } );
const posposSpinonMaterial = new THREE.MeshPhongMaterial( { color: 0xab2300, flatShading: false, transparent: true } );
const negnegSpinonMaterial = new THREE.MeshPhongMaterial( { color: 0x000bab, flatShading: false, transparent: true } );


const posVisonMaterial = new THREE.MeshPhongMaterial( { color: 0x9a3fc1, flatShading: false, transparent: true } );
const negVisonMaterial = new THREE.MeshPhongMaterial( { color: 0x3fc19a, flatShading: false, transparent: true } );
const piVisonMaterial = new THREE.MeshPhongMaterial( { color: 0xaaaaaa, flatShading: false, transparent: true } );


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

	// visons.forEach((v)=>{scene.add(v); v.visible=false;});

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

  

function plaq_at(pos){
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
		if (alldiv(v3_sub(pos, direction.fcc_Ti[i]), 8)){
			inc = i;
			break;
		}
	}
	if (inc < 0) throw "Invalid FCC reference";
	pos = v3_sub(pos, direction.fcc_Ti[inc]);

	let x = mod(pos[0]/8, Nx);
	let y = mod(pos[1]/8, Ny);
	let z = mod(pos[2]/8, Nz);
	let cell = (x*Ny+y)*Nz+z;

	return qsi.m_plaq[16*cell+4*inc+sl];
}
//////////////////////////// GEOMETRY

const flip = new THREE.Matrix4();
flip.makeRotationX(Math.PI/2);
const transl = new THREE.Matrix4();
transl.makeTranslation(0,0.4,0);


const pyro_sphere_shape = new THREE.SphereGeometry(0.2,32,32);
pyro_sphere_shape.applyMatrix4(transl);
const vison_sphere_shape = new THREE.SphereGeometry(0.2,32,32);
const tetraA_shape = new THREE.TetrahedronGeometry(Math.sqrt(3));
const tetraB_shape = new THREE.TetrahedronGeometry(Math.sqrt(3));
tetraB_shape.applyMatrix4(flip);

const bigsphere_shape = new THREE.SphereGeometry(0.8,32,32);


// Create the arow geometry
//
function construct_arrow_geometry(length, stem_radius=null, head_radius=null, head_len=null, centred=false){
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

	let template = [[stem_radius, 0],[ stem_radius, length-head_len],[ head_radius, length-head_len],[0, length]];

	for (let xy of template){
		if (centred === true){
			points.push(new THREE.Vector2( xy[0], xy[1] - (length / 2) ));
		} else {
			points.push(new THREE.Vector2( xy[0], xy[1] ));
		}
	}
	return new THREE.LatheGeometry( points , 13 );
}

const arrow3d_shape = construct_arrow_geometry(1, 0.1, 0.3, 0.2);
const spin_arrow_shape = construct_arrow_geometry(1, 0.2, 0.4, 0.4, true);


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

const v0 = new THREE.Vector3(0,1,0);

function set_spin_direction(s){
// v should be Vector3	
	let u = s.heis_moment.clone()
	u.applyMatrix3(direction.axis[s.subl]);
	u.normalize();
	s.quaternion.setFromUnitVectors( v0,  u );
}




function construct_qsi(){

	// Centre camera on centre of cube
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
						spin = new THREE.Mesh(pyro_sphere_shape, new THREE.MeshPhongMaterial(materials_pyro['Dy']));
						spin.subl = ssl;
						spin.plaqs = [];
						spin.parent_tet = {};
						spin.position.set(...pos);
						spin.heis_moment = new THREE.Vector3(0,0,1);
						set_spin_direction(spin);
						
						spin.fcc_parent = [...fcc_r];
						
						scene.add(spin);
						qsi.m_spin.push(spin);
				    }

					//Tetrahedra and Spinons
					tetraA = new THREE.Mesh(tetraA_shape, new THREE.MeshPhongMaterial(materialsA['Dy']));
					tetraB = new THREE.Mesh(tetraB_shape, new THREE.MeshPhongMaterial(materialsB['Dy']));
					tetraA.subl = 0;
					tetraB.subl = 1;
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
						plaq.parent_tet = [];
						plaq.position.set(...pos);
						plaq.fcc_parent = [...fcc_r];
						
						scene.add(plaq);
						qsi.m_plaq.push(plaq);
				    }
					tetraA = new THREE.Mesh(tetraA_shape, new THREE.MeshPhongMaterial(materialsA['Ti']));
					tetraB = new THREE.Mesh(tetraB_shape, new THREE.MeshPhongMaterial(materialsB['Ti']));
					tetraA.subl = 0;
					tetraB.subl = 1;
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
		p.spin_neighbour = [];
		for (let j = 0; j < 6; ++j) {
			let r = [];
			r[0] = p.position.x + direction.plaqt[p.subl][j][0];
			r[1] = p.position.y + direction.plaqt[p.subl][j][1];
			r[2] = p.position.z + direction.plaqt[p.subl][j][2];
			r = r.map(xi => Math.round(xi));
			s = spin_at(r);
			s.plaqs[j] = p;
			p.spins[j] = s;
			p.spin_neighbour[j] = (new THREE.Vector3(...direction.plaqt[p.subl][j]))
		}
	}

	qsi.m_tetra.forEach( t=> {
		t.spin_t = [];

		let mult = 1 - 2*t.subl;
		for (let ssl=0; ssl<4; ssl++) {
			let r = [];
			r[0] = t.position.x + mult*direction.pyro[ssl][0];
			r[1] = t.position.y + mult*direction.pyro[ssl][1];
			r[2] = t.position.z + mult*direction.pyro[ssl][2];
			//r = v3_sub(r, direction.diamond[t.subl] );

			r = r.map(xi => Math.round(xi));
			s = spin_at(r);
			t.spin_t.push(s);
			if (s.parent_tet[t.subl] !== undefined ) {
				throw "Double-registered tetrahedron on spin"
			}
			s.parent_tet[t.subl] = t;
		}
	});


	qsi.m_ptetra.forEach( s=> {
		s.plaqs = [];

		let mult = 1 - 2*s.subl;
		for (let ssl=0; ssl<4; ssl++) {
			let r = [];
			r[0] = s.position.x + mult*direction.pyro[ssl][0];
			r[1] = s.position.y + mult*direction.pyro[ssl][1];
			r[2] = s.position.z + mult*direction.pyro[ssl][2];

			r = r.map(xi => Math.round(xi));
			p = plaq_at(r);
			s.plaqs.push(p);
			if (p.parent_tet[s.subl] !== undefined ) {
				throw "Double-registered tetrahedron on plaq"
			}
			p.parent_tet[s.subl] = s;
		}
	});

			
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



//////////////////////////////////////////////////////////////////////////
// Physics implementation

// energy of the six bonds linked to spin s
function csi_loc_field(s) {
	let mA = 0;
	let mB = 0;
	ssl = s.subl;

	let tA = s.parent_tet[0];
	let tB = s.parent_tet[1];

	mA += tA.spin_t[(ssl+1)%4].heis_moment.z;
	mA += tA.spin_t[(ssl+2)%4].heis_moment.z;
	mA += tA.spin_t[(ssl+3)%4].heis_moment.z;
	mB += tB.spin_t[(ssl+1)%4].heis_moment.z;
	mB += tB.spin_t[(ssl+2)%4].heis_moment.z;
	mB += tB.spin_t[(ssl+3)%4].heis_moment.z;

	return mA*QSI_PARAMS.JzzA + mB*QSI_PARAMS.JzzB;
}


const up = new THREE.Vector3(0,0,1);
const dn = new THREE.Vector3(0,0,-1);

function csi_mc_step(){

	for (let j=0; j < Nx*Ny*Nz*QSI_PARAMS.sweep_step; j++){
		let s = qsi.m_spin[Math.floor(Math.random()*qsi.m_spin.length)];
		// propose a flip
		
		let dE = -2*csi_loc_field(s)*s.heis_moment.z;
	
		if ( Math.random() < Math.exp( - dE/QSI_PARAMS.temperature) ) {
			s.heis_moment.z = (s.heis_moment.z == 1) ? -1 : 1;
			set_spin_direction(s);
		}
	}

	//
}


function tet_charge(t){
		let Q = 0
		t.spin_t.forEach( s => {
			Q += s.heis_moment.z;
		});
		Q *= ((t.subl == 0) ? 1 : -1);
		return Q;
}

const spinon_tol = 0.0001;

function colour_spinons(){
	qsi.m_tetra.forEach( t => {
		
		let op = t.material.opacity;
		
		let Q = tet_charge(t);	
		if (Q > 2+spinon_tol) {
			t.material = posposSpinonMaterial;
			t.visible = true;
		} else if (Q > spinon_tol ) {
			t.material = posSpinonMaterial;
			t.visible = true;
		} else if (Q < -2-spinon_tol) {
			t.material = negnegSpinonMaterial;
			t.visible = true;
		} else if (Q < -spinon_tol ) {
			t.material = negSpinonMaterial;
			t.visible = true;
		} else {
			t.visible = false;
		}
		t.material.opacity=op;

	});	
}



function plaq_arg(p) {

	let vp= cplx_mul(
				cplx_mul(
			cplx_mul_star(
				p.spins[0].heis_moment,
					p.spins[1].heis_moment
			),
			cplx_mul_star(
				p.spins[2].heis_moment,
					p.spins[3].heis_moment
			)),
					cplx_mul_star(
				p.spins[4].heis_moment,
					p.spins[5].heis_moment
					)
			);
			return Math.atan2( vp.y, vp.x);
}

function ptet_charge(t){
		let Q = 0;
		t.plaqs.forEach( p => {
			Q += plaq_arg(p);
		});
		Q *= ((t.subl == 0) ? 1 : -1);
		return Q;
}

const vison_tol = 0.00001;

function colour_visons(){
	qsi.m_ptetra.forEach( t => {
		let op = t.material.opacity;
		let Q = ptet_charge(t);
		if (Math.abs(Q) > 2*Math.PI + vison_tol) {
			t.material = piVisonMaterial;
			t.visible = true;
		} else if (Q > vison_tol ) {
			t.material = posVisonMaterial;
			t.visible = true;
		} else if (Q < -vison_tol) {
			t.material = negVisonMaterial;
			t.visible = true;
		} else {
			t.visible = false;
		}
		t.material.opacity = op;
	});
}

QSI_PARAMS = {
	'tick_interval': 100,
	'temperature': 0.01,
	'sweep_step': 1,
	'JzzA': 1,
	'JzzB': 1,
	'g_cplx': {'x': 1, 'y': 0}
}


//////////////////////////////////////////////////////////////
// Quantum Spin Ice Semiclassics
//
//
//

// zw

function cplx_mul(z, w) {
	let t= {'x': z.x * w.x - z.y * w.y, 'y': z.x*w.y + z.y*w.x};
	// if (isNaN(t.x) || isNaN(t.y)) { throw "Bad Mult" }
	return t;
}

// z w*
function cplx_mul_star(z, w) {
	let t= {'x': z.x * w.x + z.y *w.y, 'y': -z.x*w.y + z.y*w.x}
	// if (isNaN(t.x) || isNaN(t.y)) { throw "Bad Mult" }
	return t;
}

function v2_add(u ,v) {
	u.x += v.x;
	u.y += v.y;
}

function qsi_loc_field(s){
	let h = {'x':0, 'y':0};
	for (let i=0; i<6; i++){
		let neighb_spins = s.plaqs[i].spins;
		let tmp = cplx_mul(
			cplx_mul_star(
				neighb_spins[(i+1)%6].heis_moment,
					neighb_spins[(i+2)%6].heis_moment
			),
			cplx_mul_star(
				neighb_spins[(i+3)%6].heis_moment,
					neighb_spins[(i+4)%6].heis_moment
			)
		)
		tmp = cplx_mul(tmp, neighb_spins[(i+5)%6].heis_moment);
		tmp = (i%2 == 1 ) ? cplx_mul(tmp, QSI_PARAMS.g_cplx) : cplx_mul_star(tmp, QSI_PARAMS.g_cplx);
		v2_add(h, tmp);
	}
	return h;
}


function propose_Ising(){
	let stdev = 0.25*Math.sqrt(QSI_PARAMS.temperature);
	if (stdev > 0.5) stdev = 0.5;
	return gaussianRandom(mean=0, stdev=stdev);
}


function plaq_energy(p){
	return -cplx_mul(
		cplx_mul(
		cplx_mul_star(
			p.spins[0].heis_moment,
			p.spins[1].heis_moment
		),
		cplx_mul_star(
			p.spins[2].heis_moment,
			p.spins[3].heis_moment
		)
		),
		cplx_mul(
		cplx_mul_star(
			p.spins[4].heis_moment,
			p.spins[5].heis_moment
		), QSI_PARAMS.g_cplx)
	).x;
}

function qsi_mc_step() {

	//qsi_mc_gauge()	
	let n_step = Nx*Ny*Nz*QSI_PARAMS.sweep_step;
	qsi_mc_XY(n_step);
	qsi_mc_ising(n_step);
}


function qsi_mc_gauge(){
	// gauge everyone
	//

	qsi.m_tetra.forEach( t => {
		let theta = Math.random()*2*Math.PI;
		t.spin_t.forEach( s => {
			s.heis_moment.applyAxisAngle(up,theta);
		});
	});

}

function qsi_mc_ising(n_step){
	

	// Ising step
	for (let j=0; j < n_step; j++){
		let p = qsi.m_plaq[Math.floor(Math.random()*qsi.m_plaq.length)];
		let delta_z = propose_Ising();
		let reject = false;
		let old_heis = [];
		let old_E = plaq_energy(p);

		for (let j=0; j<6; j++) {
			let s = p.spins[j];
			old_heis.push(s.heis_moment.clone());

			let z_new = s.heis_moment.z + delta_z;
			if ( Math.abs(z_new) > 1.0 ) {
				reject = true;
				break;
			}
			let rho2 = (s.heis_moment.x*s.heis_moment.x + s.heis_moment.y*s.heis_moment.y);
			
			let d = Math.sqrt( (1-z_new*z_new) );
			let theta = Math.atan2(s.heis_moment.y,s.heis_moment.x);
			s.heis_moment.x = d * Math.cos(theta);
			s.heis_moment.y = d * Math.sin(theta);
			s.heis_moment.z = z_new;

			delta_z = -delta_z; // Alternate tilt around a plaquette
		}

		// Check new energy
		if (!reject) {
			let dE = plaq_energy(p) - old_E;
			if ( dE > 0 && Math.exp( - dE/QSI_PARAMS.temperature) < Math.random()) {
				reject=true;
			}
		}

		if (reject) {
			// Fix all the heisenberg moments
			//
			for (let i=0; i<old_heis.length; i++) {
				p.spins[i].heis_moment = old_heis[i];
			}
		} 

			
		
	}
}

function qsi_mc_XY(n_step){

	// XY Step
	for (let j=0; j < n_step; j++){
		// choose a random spin
		let s = qsi.m_spin[Math.floor(Math.random()*qsi.m_spin.length)];


		let theta = gaussianRandom(mean=0, stdev=Math.sqrt(QSI_PARAMS.temperature)*0.5);
		rot = { "x": Math.cos(theta), "y": Math.sin(theta) }
		rot.x -= 1;
		
		let dE = -cplx_mul(
			cplx_mul_star(qsi_loc_field(s), s.heis_moment),
			rot ).x;

	
		if ( dE < 0 || Math.random() < Math.exp( - dE/QSI_PARAMS.temperature) ) {
			s.heis_moment.applyAxisAngle( up, -theta );
		}
	}


}


qsi.energy_qsi = () => {
	let E = 0;
	qsi.m_plaq.forEach( p =>{
		E += plaq_energy(p);
	});
	return E/(qsi.m_plaq.length);
}

qsi.energy_csi = () => {
	let E = 0;
	const J = [QSI_PARAMS.JzzA, QSI_PARAMS.JzzB];
	qsi.m_tetra.forEach( (t, i) =>{
		for (let j=0; j<4; j++){
			let sz = t.spin_t[j].heis_moment.z;
			for (let i=j+1; i<4; i++){
				E +=  J[i%2]*sz*t.spin_t[i].heis_moment.z;
			}
		}
	});
	return E/(qsi.m_spin.length);
}

/*
//// [unused] vison octupole business
let visons = [];
for (let i=0; i<8; i++){
	let material = new THREE.MeshPhongMaterial({color:(i%2==0?0xc0c0ff:0x0000ff)});
	visons.push(new THREE.Mesh(vison_sphere_shape,material));
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


*/











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


function reset_tetra() {
	qsi.m_tetra.forEach( t =>{
		let op = t.material.opacity;
		t.material = new THREE.MeshPhongMaterial(t.subl === 0 ? materialsA['Dy'] : materialsB['Dy']);
		t.material.opacity=op;
		t.visible=true;
	});

	qsi.m_ptetra.forEach( t =>{
		let op = t.material.opacity;
		t.material = new THREE.MeshPhongMaterial(t.subl === 0 ? materialsA['Ti'] : materialsB['Ti']);
		t.material.opacity=op;
		t.visible=true;
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

	//update spins to point the right way
	qsi.m_spin.forEach( s => {
		set_spin_direction(s)
	});


	// colour the spinons and visons
	if (QSI_PARAMS.render !== undefined) {
		QSI_PARAMS.render();
	}
	const espan = document.getElementById('energy_span');

	if (QSI_PARAMS.qsi_timeoutID !== undefined) {
		espan.innerHTML = Math.round(qsi.energy_qsi()*10000)*1.0/10000 + "<span style=\"float:right;\" >|g+ig'|</span>";
	} else if (QSI_PARAMS.timeoutID !== undefined) {
		espan.innerHTML = Math.round(qsi.energy_csi()*10000)*1.0/10000 +"<span style=\"float:right;\" >(J<sub>A</sub>+J_<sub>B</sub>)/2</span>";	
	}


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

function update_opacity(which, op) {
	qsi[which].forEach((t)=>{
		t.material.opacity=op;
	});
}



function update_scaling(scale) {

	let s = scale;

	qsi['m_tetra'].forEach((t)=>{
		if (t.subl == 0) {
			t.scale.set(1+s,1+s,1+s);
		}
		else if (t.subl == 1) 
		{
			t.scale.set(1-s, 1-s, 1-s);
		}
	});
	qsi['m_spin'].forEach((spin)=>{
		spin.position.set(...v3_add(spin.fcc_parent, v3_mul(1+s,direction.pyro[spin.subl]))); 
	});
	
	s = -scale/3;
	qsi['m_ptetra'].forEach((t)=>{
		if (t.subl == 0) {
			t.scale.set(1+s,1+s,1+s);
		}
		else if (t.subl == 1) 
		{
			t.scale.set(1-s,1-s,1-s);
		}
	});


	qsi['m_plaq'].forEach((spin)=>{
		spin.position.set(...v3_add(spin.fcc_parent, v3_mul(1+s,direction.pyro[spin.subl]))); 
		let ss = Math.min(1-s, 1+s);
		spin.scale.set(ss,ss,ss);
	});

	QSI_PARAMS.JzzA = 1 - scale/2;
	QSI_PARAMS.JzzB = 1 + scale/2;

	QSI_PARAMS.g_cplx = {'x':Math.cos(scale*Math.PI/2) , 'y':Math.sin(scale*Math.PI/2)};


	const g_units = document.getElementById("g_span");

	if (QSI_PARAMS.timeoutID !== undefined){
		// CSI
		g_units.innerHTML = "CSI, J<sub>A</sub>-J<sub>B</sub>="+ scale
	} else if (QSI_PARAMS.qsi_timeoutID !== undefined){
		// QSI
		g_units.innerHTML = "QSI, g= "+ Math.round(1000*QSI_PARAMS.g_cplx.x)/1000+", g'= " + Math.round(1000*QSI_PARAMS.g_cplx.y)/1000;
	} else {
		g_units.innerHTML = '';
	}


}


function handleClick(e) {
	if (!INTERSECTED) return;
	let obj = INTERSECTED; // in case the user moves the mouse

	if (document.getElementById('plaq_checkbox').checked && e.which === 3) {
		
		if (obj['spins'] != undefined && obj['spin_neighbour'] != undefined){
			// Plaquette annotations
			obj.spins.forEach( (xi,i) => {
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


// constants






////////////////////////////////////////////////////////////////////////////////////////////////////////
// Interactivity Attachments




colors = [0xff0000, 0xFFDF00, 0x04ff00, 0x00ffff,0x0004ff, 0xF702FD];

const lineMaterials = [];
colors.forEach( 
	(c)=>{lineMaterials.push(new THREE.MeshPhongMaterial( { color: c} ))
});

// Start the program
document.addEventListener("DOMContentLoaded",function () {

	construct_direction();
	
    window.addEventListener('resize', onWindowResize, false);
    init();
    animate();

	const Dy_slider = document.getElementById('Dy_slider');
	const Ti_slider = document.getElementById('Ti_slider');
	document.getElementById('pyro_Dy_slider').oninput = function(){update_opacity("m_spin", this.valueAsNumber/100)} ;
	document.getElementById('pyro_Ti_slider').oninput = function(){update_opacity("m_plaq", this.valueAsNumber/100)} ;
	document.getElementById('breathing_slider').oninput = function(){update_scaling(this.valueAsNumber/100)} ;


	Dy_slider.oninput = function() {update_opacity("m_tetra", this.valueAsNumber/100)} ;
	Ti_slider.oninput = function() {update_opacity("m_ptetra", this.valueAsNumber/100)} ;

	document.getElementById('system-size').onchange = function(){
		if (this.valueAsNumber < 0 || this.valueAsNumber > 6) return;
		Nx = this.valueAsNumber;
		Ny = this.valueAsNumber;
		Nz = this.valueAsNumber;
		delete_qsi();
		construct_qsi();
		document.getElementById('order_set').onclick(); // set the order

		for (slider of document.querySelectorAll('.live')){
			slider.oninput();
		}
	} ;

	// Non-contractible surfaces	
	document.getElementById('surface_checkbox').oninput = function() { 
		if (this.checked) { 
			highlight_planes();

			// Make the surfaces 50% opaque if they are invisible
			const tisl = document.getElementById('pyro_Ti_slider');
			if (tisl.value == 0){
				tisl.value=50;
				tisl.oninput();
			}
		} else {reset_plaqs()}
	};


	// Representation of lattice
	document.getElementById('geom_dropdown').oninput = function() { 
		if (this.value == "SpinIce") {
			qsi.m_tetra.forEach( t => {
				t.geometry = (t.subl==0)?tetraA_shape:tetraB_shape;
			});
			qsi.m_ptetra.forEach( t => {
				t.geometry = (t.subl==0)?tetraA_shape:tetraB_shape;
			});
			qsi.m_spin.forEach( s => {
				s.geometry = spin_arrow_shape;
			});
		} else {	
			qsi.m_tetra.forEach( t => {
				t.geometry = bigsphere_shape;
			});
			qsi.m_ptetra.forEach( t => {
				t.geometry = bigsphere_shape;
			});
			qsi.m_spin.forEach( s => {
				s.geometry = pyro_sphere_shape;
			});
		}
	};


	// Representation of pyrochlore sublattice
	const orderset_dropdown =  document.getElementById('order_dropdown');
	const orderset_button = document.getElementById('order_set');
	orderset_button.onclick = function() { 
		if (orderset_dropdown.value == "AIAO") {
			qsi.m_spin.forEach( s =>{
				s.heis_moment = new THREE.Vector3(0,0,1);
			});
		} else if (orderset_dropdown.value == "2I2O") {
			qsi.m_spin.forEach( s => {
				s.heis_moment.x = 0;
				s.heis_moment.y = 0;
				s.heis_moment.z = (s.subl % 2 == 0) ? 1 : -1;
			});
		} else if (orderset_dropdown.value == "3I1O/1I3O") { // 3I 1O order
			qsi.m_spin.forEach( s => {
				s.heis_moment.x = 0;
				s.heis_moment.y = 0;
				s.heis_moment.z = (s.subl == 0) ? -1 : 1;
			});
		} else if (orderset_dropdown.value == "Random") {
			qsi.m_spin.forEach( s => {
				s.heis_moment.x = 0;
				s.heis_moment.y = 0;
				s.heis_moment.z = Math.random() < 0.5 ? -1 : 1 ;
			});
		} else {
			qsi.m_spin.forEach( s => {
				s.heis_moment.x = 1;
				s.heis_moment.y = 0;
				s.heis_moment.z = 0;
			});
		}

		qsi.m_spin.forEach( s => {	
			set_spin_direction(s);
		});
	};


	const quasi_dropdown = document.getElementById("quasi_dropdown");
	quasi_dropdown.oninput = function() {
		reset_tetra();
		if (this.value === "spinons") {
			QSI_PARAMS.render = colour_spinons;
			qsi.m_ptetra.forEach( s => {s.visible=false;});
			// make them visible if they aren't already
			if (Dy_slider.value == "0"){
				Dy_slider.value = 100;
				Dy_slider.oninput();
			}


		} else if (this.value === "visons") {
			QSI_PARAMS.render = colour_visons;
			qsi.m_tetra.forEach( s => {s.visible=false;});

			if (Ti_slider.value == "0"){
				Ti_slider.value = 100;
				Ti_slider.oninput();
			}
		} else /* assume value is 'all' or similar */ {	
			QSI_PARAMS.render = undefined;
		}
	}

	// CSI simulator
	//
	//
	const csi_button = document.getElementById("simulate_button");
	const qsi_button = document.getElementById("qsi_simulate_button"); 
	const t_units = document.getElementById("temp_unit_span");

	csi_button.onclick = function() {
		if (this.innerHTML == "Simulate"){
			qsi_button.disabled=true;
			this.innerHTML = "Stop Simulation";

			// Make sure that we can see what is happening!
			quasi_dropdown.value="spinons";
			quasi_dropdown.oninput();
			// Set the units
			t_units.innerHTML= "J";
			QSI_PARAMS.timeoutID = setInterval(csi_mc_step, QSI_PARAMS.tick_interval);

			document.getElementById('breathing_slider').oninput();

		} else {
			this.innerHTML = "Simulate";	
			clearInterval(QSI_PARAMS.timeoutID);
			QSI_PARAMS.timeoutID = undefined;

			t_units.innerHTML= '(units)';
			qsi_button.disabled=false;
		}
	}


	// QSI simulator
	qsi_button.onclick = function() {
		if (this.innerHTML == "Simulate"){

			csi_button.disabled=true;
			// Set default values
			if (orderset_dropdown.value != "XY"){
				orderset_dropdown.value = "XY";
				orderset_button.onclick();
			}
			orderset_dropdown.disabled=true;	
			orderset_button.disabled=true;
			// Make sure that we can see what is happening!
			quasi_dropdown.value="visons";
			quasi_dropdown.oninput();
			// set the units
			t_units.innerHTML="|g+ig'|";

			this.innerHTML = "Stop Simulation";
			QSI_PARAMS.qsi_timeoutID = setInterval(qsi_mc_step, QSI_PARAMS.tick_interval);


			document.getElementById('breathing_slider').oninput();
			
		} else {
			this.innerHTML = "Simulate";	
			clearInterval(QSI_PARAMS.qsi_timeoutID);
			QSI_PARAMS.qsi_timeoutID = undefined;

			t_units.innerHTML= '(units)';
			csi_button.disabled=false;
			orderset_dropdown.disabled=false;	
			orderset_button.disabled=false;
		}
	}


	const t_min = 0.0000001;
	const temp_box = document.getElementById("temp_box");
	const temp_slider = document.getElementById("temp_slider");


	temp_box.oninput = function() {
		QSI_PARAMS.temperature = (this.valueAsNumber > t_min) ? this.valueAsNumber : t_min;
		temp_slider.value=Math.log10(this.value);
	}
	temp_slider.oninput = function() {
		temp_box.value=Math.round(100000*Math.pow(10,this.value))/100000;
		temp_box.oninput();
	}



	function update_trate(rate_Hz) {
		QSI_PARAMS.tick_interval = 1000/rate_Hz;
		if (QSI_PARAMS.timeoutID != undefined){
			clearInterval(QSI_PARAMS.timeoutID);
			QSI_PARAMS.timeoutID = setInterval(csi_mc_step, QSI_PARAMS.tick_interval);
		}

		if (QSI_PARAMS.qsi_timeoutID != undefined){
			clearInterval(QSI_PARAMS.qsi_timeoutID);
			QSI_PARAMS.qsi_timeoutID = setInterval(qsi_mc_step, QSI_PARAMS.tick_interval);
		}
	}

	

	document.getElementById("trate_slider").oninput = function() {
		document.getElementById("tickrate_display").value = this.valueAsNumber;
		update_trate(this.valueAsNumber);
	}

	document.getElementById("tickrate_display").oninput = function() {
		let sl = document.getElementById("trate_slider");
		sl.value = this.value;	
		update_trate(this.valueAsNumber);
	}



	// run the listeners once to handle cached values
		for (slider of document.querySelectorAll('.live')){
			slider.oninput();
		}
	

	canvas= mum.children[0];
	canvas.addEventListener('mousemove', onPointerMove);
	canvas.addEventListener('mousedown', handleClick);

});


