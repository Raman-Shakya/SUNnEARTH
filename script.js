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
    dayTime: 15,
    deltaTime: 1/30, // ~30 fps
    radiusEarth: 0.0182985,
    radiusSun: 2,
    distance: 430.996,
    daysInYear: 365.25,
    solarRotT: 27, // sun completes 1 rotation in 27 days
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
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 3000 );
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
    }
    else {
        settings.view = 'SUN';
        cameraPosition.radius = SUN.geometry.parameters.radius*2

    }
}
function switchPlock() {
    settings.pLock = 1-settings.pLock;
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
        cameraPosition.ax -= xoff/50
    }
}
);
window.addEventListener('wheel', (wheel) => {
    cameraPosition.radius += wheel.deltaY*0.001
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
// const otherStars = [];
// for (let i=0; i<100; i++) {
//     let temp = ( new THREE.Mesh(
//         new THREE.SphereGeometry(settings.radiusSun, 16, 16),
//         new THREE.MeshBasicMaterial({
//             color: 0xffffff,
//         })
//     ));
//     let temp_x = 1000*Math.random() - 500, temp_y = 100*Math.random() - 50, temp_z = 1000*Math.random() - 500;
//     if (temp_x < 0) temp.position.x = -1000+temp_x;
//     if (temp_x >= 0) temp.position.x = 1000+temp_x;
//     if (temp_y < 0) temp.position.y = -100+temp_y;
//     if (temp_y >= 0) temp.position.y = 100+temp_y;
//     if (temp_z < 0) temp.position.z = -1000+temp_z;
//     if (temp_z >= 0) temp.position.z = 1000+temp_z;
    
//     scene.add( temp );
// }
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