/*        _   _   _                 
____  ___| |_| |_(_)_ __   __ _ ___ 
/ __|/ _ \ __| __| | '_ \ / _` / __|
\__ \  __/ |_| |_| | | | | (_| \__ \
|___/\___|\__|\__|_|_| |_|\__, |___/
_                          |___/  
*/
cameraPosition = {ax: 0, ay: 0, radius: 2} // kindof in polar form with ax and ay being angle in radians
settings = {
    view: 'SUN',
    pLock: false,
    dayTime: 60,
    deltaTime: 1/30, // ~30 fps
    radiusEarth: 0.0182985,
    radiusSun: 2,
    distance: 430.996,
    daysInYear: 365.25,
    solarRotT: 27, // sun completes 1 rotation in 27 days
    noStars: 1000
}
var rotationalCoeff, rotationalCoeffSun, revolutionalCoeff, revAngle=Math.PI/2, sunRotAng=0, earthRotAng=0;

function calculateRotationalCoeffs() {
    rotationalCoeff = 2*Math.PI / settings.dayTime * settings.deltaTime;
    rotationalCoeffSun = rotationalCoeff / settings.solarRotT;
    revolutionalCoeff = rotationalCoeff / settings.daysInYear;
}
calculateRotationalCoeffs()

// scene
const scene = new THREE.Scene();

// renderer and canvas setup
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementsByClassName('sim')[0].appendChild( renderer.domElement );

// textures
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('./textures/earth_texture.jpg')
const sunTexture = textureLoader.load('./textures/sun_texture.jpg')


/*
____ __ _ _ __ ___   ___ _ __ __ _ 
/ __/ _` | '_ ` _ \ / _ \ '__/ _` |
 (_| (_| | | | | | |  __/ | | (_| |
\___\__,_|_| |_| |_|\___|_|  \__,_|
*/
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.00001, 3000 );
function setCameraPosition(camera, position) {
    if (settings.pLock) {
        position.ax += settings.view=='SUN'?rotationalCoeffSun:rotationalCoeff;
    }
    let x = position.radius*Math.sin(position.ax)
    let z = position.radius*Math.cos(position.ax)
    let y = 0

    if (settings.view!='SUN') {
        camera.position.x = x+EARTH.position.x
        camera.position.y = y+EARTH.position.y
        camera.position.z = z+EARTH.position.z
        camera.lookAt(new THREE.Vector3(EARTH.position.x, EARTH.position.y, EARTH.position.z))
    }
    else {
        camera.position.x = x+SUN.position.x
        camera.position.y = y+SUN.position.y
        camera.position.z = z+SUN.position.z
        camera.lookAt(new THREE.Vector3(SUN.position.x, SUN.position.y, SUN.position.z))
    }
}
function changeView() {
    if (settings.view=='SUN') {
        settings.view = 'EARTH';
        cameraPosition.radius = EARTH.geometry.parameters.radius*2
        document.querySelector('#view').innerHTML = 'EARTH';
    }
    else {
        settings.view = 'SUN';
        cameraPosition.radius = SUN.geometry.parameters.radius*2
        document.querySelector('#view').innerHTML = 'SUN';
    }
}
function switchPlock() {
    if (settings.pLock) {
        settings.pLock = false;
        document.querySelector('#locker').innerHTML = 'LOCK';
    }
    else {
        settings.pLock = true;
        document.querySelector('#locker').innerHTML = 'UNLOCK';
    }
}

/*
_                     _     _                     _ _               
  _____   _____ _ __ | |_  | |__   __ _ _ __   __| | | ___ _ __ ___ 
 / _ \ \ / / _ \ '_ \| __| | '_ \ / _` | '_ \ / _` | |/ _ \ '__/ __|
|  __/\ V /  __/ | | | |_  | | | | (_| | | | | (_| | |  __/ |  \__ \
 \___| \_/ \___|_| |_|\__| |_| |_|\__,_|_| |_|\__,_|_|\___|_|  |___/
*/
window.addEventListener('mousemove', (mouse) => {
    xoff = mouse.movementX;
    if (mouse.buttons) {
        cameraPosition.ax -= xoff/250
    }
}
);
window.addEventListener('wheel', (wheel) => {
    minRadius = settings.view=='SUN'?settings.radiusSun:settings.radiusEarth
    cameraPosition.radius += wheel.deltaY*minRadius*0.001;
    if (cameraPosition.radius < minRadius) {
        cameraPosition.radius = minRadius+0.001;
    }
})
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    
    camera.updateProjectionMatrix();
})
window.addEventListener('keydown', (key)=>{
    if (key.key=='l' || key.key=='L') switchPlock();
    if (key.key=='v' || key.key=='V') changeView();
})



/*
 _ _       _     _   
| (_) __ _| |__ | |_ 
| | |/ _` | '_ \| __|
| | | (_| | | | | |_ 
|_|_|\__, |_| |_|\__|
_    |___/  
*/
// for easier light placement
function putPointLight( x, y, z, color, intensity, far=1000 ) {
    let temp = new THREE.PointLight ( color, intensity, far);
    temp.position.x = x;
    temp.position.y = y;
    temp.position.z = z;
    scene.add(temp);
}
putPointLight(0,0,0, 0xffddaa, 1); // light from sun
const spaceLight = new THREE.AmbientLight( 0x101010 ); // ambient light
scene.add( spaceLight );

/*
_     _                           _       
  ___| | ___ _ __ ___   ___ _ __ | |_ ___ 
 / _ \ |/ _ \ '_ ` _ \ / _ \ '_ \| __/ __|
|  __/ |  __/ | | | | |  __/ | | | |_\__ \
 \___|_|\___|_| |_| |_|\___|_| |_|\__|___/
*/
// sun
const SUN = new THREE.Mesh(
    new THREE.SphereGeometry(settings.radiusSun, 32, 32),
    new THREE.MeshToonMaterial( {
        map: sunTexture,
    })
);
// earth
const EARTH = new THREE.Mesh(
    new THREE.SphereGeometry(settings.radiusEarth, 64, 64),
    new THREE.MeshLambertMaterial({
        map: earthTexture,
    })
)
// background scene
const stars = new THREE.Geometry();
for (let i=0; i<settings.noStars; i++) {
    radius = 1500 + 1000*Math.random();
    angle = 2*Math.PI*Math.random();
    yoff = Math.random()*3000-1500;

    star = new THREE.Vector3(
        radius * Math.sin(angle),
        yoff,
        radius * Math.cos(angle),
    )
    stars.vertices.push(star);
}
scene.add( new THREE.Points(
    stars,
    new THREE.PointsMaterial( {color: 0xfff0f0, size: 1.5+3*Math.random() })
))

scene.add( EARTH );
scene.add( SUN );


/*               _         _                   
 _ __ ___   __ _(_)_ __   | | ___   ___  _ __  
| '_ ` _ \ / _` | | '_ \  | |/ _ \ / _ \| '_ \ 
| | | | | | (_| | | | | | | | (_) | (_) | |_) |
|_| |_| |_|\__,_|_|_| |_| |_|\___/ \___/| .__/ 
_                                       |_|  
*/
const animate = function () {
    
    setTimeout( function() {
        requestAnimationFrame( animate );
    }, settings.deltaTime*1000 );

    EARTH.position.x = settings.distance*Math.sin(revAngle);
    EARTH.position.z = settings.distance*Math.cos(revAngle);
    
    SUN.rotation.y   = sunRotAng;
    EARTH.rotation.y = earthRotAng;

    sunRotAng   += rotationalCoeffSun;
    revAngle    += revolutionalCoeff;
    earthRotAng += rotationalCoeff;
    
    setCameraPosition(camera, cameraPosition);
    
    renderer.render( scene, camera);
};
    
changeView();changeView();
animate();