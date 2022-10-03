import * as THREE from "../build/three.module.js";
import { OrbitControls } from "../examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "../examples/jsm/loaders/GLTFLoader.js";
import Stats from "../examples/jsm/libs/stats.module.js";

/** ._ 밑줄이 있는 것은 app클래스 내부에서만 쓰이는 프라이빗 메서드  */
class App {
	constructor() {
		const divContainer = document.querySelector("#webgl-container");
		this._divCotainer = divContainer;

		/**랜더러 생성 */
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		/**랜더러 객체 setPixelRatio값 정의 */
		renderer.setPixelRatio(window.devicePixelRatio);
		divContainer.appendChild(renderer.domElement);
		//**그림자 랜더러 */
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.VSMShadowMap;

		this._renderer = renderer;

		/**scene객체 생성 */
		const scene = new THREE.Scene();
		/**필드화 시킴 */
		this._scene = scene;

		/**카메라 light, 3차원 모델을 설정하는 _setupModel을 설정  */
		this._setupCamera();
		this._setupLight();
		this._setupModel();
		this._setupControls();

		/**창크기가 변경될때 발생 bind을 사용한 이유는 this가 app클래스 객체가 되기위함 */
		window.onresize = this.resize.bind(this);
		this.resize();

		/**render메서드는 3차원 그래픽장면을 만들어주는 메서드 */
		requestAnimationFrame(this.render.bind(this));
	}
	_setupControls() {
		this._controls = new OrbitControls(this._camera, this._divCotainer);
		this._controls.target.set(0, 100, 0);

		const stats = new Stats();
		this._divCotainer.appendChild(stats.dom);
		this._fps = stats;

		this._pressedKeys = {};

		document.addEventListener("keydown", (event) => {
			this._pressedKeys[event.key.toLowerCase()] = true;
			this._processAnimation();
		});

		document.addEventListener("keyup", (event) => {
			this._pressedKeys[event.key.toLowerCase()] = false;
			this._processAnimation();
		});
	}
	_processAnimation() {
		/**현재 애니메이션 객체 _currentAnimationAction */
		const previousAnimationAction = this._currentAnimationAction;

		if (
			this._pressedKeys["w"] ||
			this._pressedKeys["a"] ||
			this._pressedKeys["s"] ||
			this._pressedKeys["d"]
		) {
			if (this._pressedKeys["shift"]) {
				this._currentAnimationAction = this._animationMap["Run"];
			} else {
				this._currentAnimationAction = this._animationMap["Walk"];
			}
		} else {
			/**키가 안눌러졌을때 */
			this._currentAnimationAction = this._animationMap["Idle"];
		}
		/**previousAnimationAction이전 애니메이션 _currentAnimationAction 현재 애니메이션 */
		if (previousAnimationAction !== this._currentAnimationAction) {
			previousAnimationAction.fadeOut(0.5);
			this._currentAnimationAction.reset().fadeIn(0.5).play();
		}
	}

	_setupCamera() {
		const camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			1,
			5000
		);

		camera.position.set(0, 100, 500);
		this._camera = camera;
	}
	/**_addPointLight 메서드 */
	_addPointLight(x, y, z, helperColor) {
		const color = 0xffffff;
		const intensity = 1.5;

		const pointLight = new THREE.PointLight(color, intensity, 2000);
		pointLight.position.set(x, y, z);

		this._scene.add(pointLight);

		const pointLightHelper = new THREE.PointLightHelper(
			pointLight,
			10,
			helperColor
		);
		this._scene.add(pointLightHelper);
	}

	_setupLight() {
		/**메인광 */
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		this._scene.add(ambientLight);

		/**4개의 주변광 */
		this._addPointLight(500, 150, 500, 0xff0000);
		this._addPointLight(-500, 150, 500, 0xffff00);
		this._addPointLight(-500, 150, -500, 0x00ff00);
		this._addPointLight(500, 150, -500, 0x0000ff);

		/**그림자를 위한 광원 */
		const shadowLight = new THREE.DirectionalLight(0xffffff, 0.2);
		shadowLight.position.set(200, 500, 200);
		shadowLight.target.position.set(0, 0, 0);
		const directionalLightHelper = new THREE.DirectionalLightHelper(
			shadowLight,
			10
		);
		this._scene.add(directionalLightHelper);

		this._scene.add(shadowLight);
		this._scene.add(shadowLight.target);

		shadowLight.castShadow = true;
		shadowLight.shadow.mapSize.width = 1024;
		shadowLight.shadow.mapSize.height = 1024;
		shadowLight.shadow.camera.top = shadowLight.shadow.camera.right = 700;
		shadowLight.shadow.camera.bottom = shadowLight.shadow.camera.left = -700;
		shadowLight.shadow.camera.near = 100;
		shadowLight.shadow.camera.far = 900;
		shadowLight.shadow.radius = 5;
		const shadowCameraHelper = new THREE.CameraHelper(
			shadowLight.shadow.camera
		);
		this._scene.add(shadowCameraHelper);
	}
	/**파랑색 개열의 정육면제를 생성하는 코드 */
	_setupModel() {
		/**바닥 mesh추가 */
		/** PlaneGeometry 평면 기하학을 생성하기 위한 클래스입니다. */
		const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
		const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x878787 });
		const plane = new THREE.Mesh(planeGeometry, planeMaterial);
		plane.rotation.x = -Math.PI / 2;
		this._scene.add(plane);
		/**평면은 그림자를 받음 */
		plane.receiveShadow = true;

		/**glf 캐릭터 파일 불러옴 */
		new GLTFLoader().load("./data/character.glb", (gitf) => {
			const model = gitf.scene;
			this._scene.add(model);

			/**그림자 생성 */
			model.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					child.castShadow = true;
				}
			});
			/**캐릭터 애니메이션 */
			const animationClips = gitf.animations;
			const mixer = new THREE.AnimationMixer(model); //AnimationMixer 클릭마다 업데이트
			const animationsMap = {};
			animationClips.forEach((clip) => {
				const name = clip.name;
				console.log(name);
				animationsMap[name] = mixer.clipAction(clip); // THREE.AnimationAction
			});

			this._mixer = mixer;
			this._animationMap = animationsMap;
			this._currentAnimationAction = this._animationMap["Idle"];
			this._currentAnimationAction.play();

			/**캐릭터 바운딩 박스 */
			const box = new THREE.Box3().setFromObject(model);
			model.position.y = (box.max.y - box.min.y) / 2;

			/**월드 좌표축 생성 */
			const axisHelper = new THREE.AxesHelper(1000);
			this._scene.add(axisHelper);

			/**모델의 바운딩 박스 */
			const boxHelper = new THREE.BoxHelper(model);
			this._scene.add(boxHelper);
			this._boxHelper = boxHelper;
			this._model = model;
		});
	}
	resize() {
		/** divCotainer의 width과height를 가져옴  */
		const width = this._divCotainer.clientWidth;
		const height = this._divCotainer.clientHeight;

		/**카메라 속성값 설정 */
		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		/**설정한 값으로 renderer 크기 설정 */
		this._renderer.setSize(width, height);
	}
	render(time) {
		/**render가 _scene을 _camera시점을 이용해서 렌더링해라   */
		this._renderer.render(this._scene, this._camera);
		/**update 메서드에서 속성값 변경되는데 그걸로 애니메이션 효과 발생 */
		this.update(time);
		/** 브라우저에게 수행하기를 원하는 애니메이션을 알리고 다음 리페인트가 진행되기 전에 해당 애니메이션을 업데이트하는 함수를 호출하게 합니다. 이 메소드는 리페인트 이전에 실행할 콜백을 인자로 받습니다. */
		requestAnimationFrame(this.render.bind(this));
	}

	update(time) {
		/**받은 time값에 0.001을 곱한다 */
		time *= 0.001;
		this._controls.update();

		/**모델의 바운딩 박스 캐릭터가 움직일때마다 변경 */
		if (this._boxHelper) {
			this._boxHelper.update();
		}

		this._fps.update();

		/**_mixer의 업데이트 deltaTime는 이전 프레임과 현재 프레임 차이  */
		if (this._mixer) {
			const deltaTime = time - this._previousTime;
			this._mixer.update(deltaTime);
		}
		this._previousTime = time;
	}
}

window.onload = function () {
	new App();
};
