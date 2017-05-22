import CUBE_TEXTURE from '../assets/textures/building.jpg';
import ROAD_TEXTURE from '../assets/textures/road.jpg';
import BACKGROUND_MUSIC from '../assets/audio/bgm.ogg';
import TWEEN from 'tween.js';
const OrbitControls = require('three-orbit-controls')(THREE);
class Animate {
	constructor() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,1,10000);
		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
		this.renderer.setSize(window.innerWidth,window.innerHeight);
		this.renderer.setClearColor(0xeeeeee);
		this.renderer.shadowMapEnabled = true;
		document.body.appendChild(this.renderer.domElement);
		this.camera.position.set( 0, 80, 0 );
		this.start();
		// controls
		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		this.render();
	}
	render() {
		const render = () => {
			TWEEN.update();
			requestAnimationFrame(render);
			this.renderer.render(this.scene,this.camera);
		}
		render();
	}
	start() {
		this.scene.fog = new THREE.Fog( 0xffffff, 800, 1000 );
		this.createLight();
		this.createGround(1000,1000);
		const cubemap = new THREE.TextureLoader().load( CUBE_TEXTURE );
		this.cubematerial = new THREE.MeshPhongMaterial( { color: 0xdddddd,map:cubemap} );
		this.initAudio();
		this.animate();
		this.createCubes();
	}
	static loop(time,callback) {
		let start=false;
		let render = timestamp => {
			if (!start) start = timestamp;
			let progress = timestamp - start;
			if (progress > time) {
				start = timestamp;
				callback();
			}
			window.requestAnimationFrame(render);
		};
		window.requestAnimationFrame(render);
	}
	static delay(time) {
        return new Promise(resolve => {
            let start=false;
            let render = timestamp => {
                if (!start) start = timestamp;
                let progress = timestamp - start;
                if (progress < time) {
                    window.requestAnimationFrame(render);
                } else {
                    resolve();
                }
            };
            window.requestAnimationFrame(render);
        });
    }
	initAudio() {
		this.audio = document.createElement('audio');
		this.audio.setAttribute('src',BACKGROUND_MUSIC);
		this.audio.addEventListener('canplay',e => {
			this.createAnalyser();
		});
		document.body.appendChild(this.audio);
	}
	createAnalyser() {
		const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		this.analyser = audioCtx.createAnalyser();
		this.analyser.fftSize = 1024;
		const source = audioCtx.createMediaElementSource(this.audio);
		source.connect(this.analyser);
		source.connect(audioCtx.destination);
		this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
		this.audio.play();
	}
	createCubes() {
		// body...
		const geometry = new THREE.CubeGeometry(2,2,2);
		
		
		for(let i = 0;i < 256;i++){
			let z = 4*Math.floor(i/16) -20;
			let x = 4*(i%16) -20;console.log(`z=${z},x=${x}`);
			let cube = new THREE.Mesh( geometry, this.cubematerial );
			cube.position.set(x,0,z);
			cube.castShadow = true;
			cube.name = i + '';
			this.scene.add(cube)
		}
	}
	createLight() {
        this.scene.add(new THREE.AmbientLight(0xFFFFFF));
        const light = new THREE.DirectionalLight( 0xffffff, 0.3 );
		light.position.set( 200, 450, 500 );
		light.castShadow = true;
		light.shadow.mapSize.width = 2048;
		light.shadow.mapSize.height = 512;
		light.shadow.camera.near = 100;
		light.shadow.camera.far = 1200;
		light.shadow.camera.left = -1000;
		light.shadow.camera.right = 1000;
		light.shadow.camera.top = 350;
		light.shadow.camera.bottom = -350;
		this.scene.add( light );
	}
	createGround(width,height) {
		//  GROUND
		const textures = new THREE.TextureLoader().load( ROAD_TEXTURE );
		const geometry = new THREE.PlaneBufferGeometry( width, height );
		const material = new THREE.MeshPhongMaterial( { color: 0xffffff, map: textures } );
		const ground = new THREE.Mesh( geometry, material );
		ground.rotation.x = - Math.PI / 2;
		ground.material.map.repeat.set( 10, 10 );
		ground.material.map.wrapS = THREE.RepeatWrapping;
		ground.material.map.wrapT = THREE.RepeatWrapping;
		// note that because the ground does not cast a shadow, .castShadow is left false
		ground.receiveShadow = true;
		this.scene.add( ground );
	}
	animate() {
		Animate.loop(200,() => {
			if(!!this.analyser) {
				let s = -1;
				const len = 256;
				this.analyser.getByteFrequencyData(this.frequencyData);
				let l = [], r = [], arr = Array.from(this.frequencyData);
				for (var j = 0; j < len; j+=2) {
					l.unshift(arr[j]);
					r.push(arr[j+1])
				}
				arr = l.concat(r);
				// debugger;
				// console.log(arr);
				for(var i = 0 ; i < len; i++) {
					s = s * -1;
					let f = 1;
					if (arr[i] > 4) f = (arr[i] / 4);
					const cube = this.scene.getObjectByName( i + '');
					console.log(cube.scale.y);
					const tween = new TWEEN.Tween(cube.scale)
						.to({y:f},200)
						.start();
				}
			}
		});
	}
}
new Animate();