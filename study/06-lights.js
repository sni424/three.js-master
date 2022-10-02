import * as THREE from "../build/three.module.js";

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
		this._renderer = renderer;

		/**scene객체 생성 */
		const scene = new THREE.Scene();
		/**필드화 시킴 */
		this._scene = scene;

		/**카메라 light, 3차원 모델을 설정하는 _setupModel을 설정  */
		this._setupCamera();
		this._setupLight();
		this._setupModel();

		/**창크기가 변경될때 발생 bind을 사용한 이유는 this가 app클래스 객체가 되기위함 */
		window.onresize = this.resize.bind(this);
		this.resize();

		/**render메서드는 3차원 그래픽장면을 만들어주는 메서드 */
		requestAnimationFrame(this.render.bind(this));
	}

	_setupCamera() {
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			100
		);
		camera.position.set(7, 7, 0);
		camera.lookAt(0, 0, 0);

		this._camera = camera;
	}
	_setupModel() {
		/**바닥 */
		const groundGeometry = new THREE.PlaneGeometry(10, 10);
		const groundMaterial = new THREE.MeshStandardMaterial({
			color: "#2c3e50",
			roughness: 0.5,
			metalness: 0.5,
			side: THREE.DoubleSide,
		});
		const ground = new THREE.Mesh(groundGeometry, groundMaterial);
		ground.rotation.x = THREE.MathUtils.degToRad(-90);
		this._scene.add(ground);

		/**가운대 구 */
		const bigSphereGeometry = new THREE.SphereGeometry(1.5, 64, 64, 0, Math.PI);
		const bigSphereMaterial = new THREE.MeshStandardMaterial({
			color: "#ffffff",
			roughness: 0.1,
			metalness: 0.2,
		});
		const bigSphere = new THREE.Mesh(bigSphereGeometry, bigSphereMaterial);
		ground.rotation.x = THREE.MathUtils.degToRad(-90);
		this._scene.add(bigSphere);

		/**8개원 */
		const torusGeometry = new THREE.TorusGeometry(0.4, 0.1, 32, 32);
		const torusMaterial = new THREE.MeshStandardMaterial({
			color: "#9b59b6",
			roughness: 0.5,
			metalness: 0.9,
		});
		for (let i = 0; i < 8; i++) {
			const torusPivot = new THREE.Object3D();
			const torus = new THREE.Mesh(torusGeometry, torusMaterial);
			torusPivot.rotation.y = THREE.MathUtils.degToRad(45 * i);
			torus.position.set(3, 0.5, 0);
			torusPivot.add(torus);
			this._scene.add(torusPivot);
		}

		/**움직이는 원 */
		const smallSphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
		const smallSphereMaterial = new THREE.MeshStandardMaterial({
			color: "#e74c3c",
			roughness: 0.2,
			metalness: 0.5,
		});
		const smallSpherePivot = new THREE.Object3D();
		const smallSphere = new THREE.Mesh(
			smallSphereGeometry,
			smallSphereMaterial
		);

		smallSpherePivot.add(smallSphere);
		smallSpherePivot.name = "smallSpherePivot";
		smallSpherePivot.position.set(3, 0.5, 0);
		this._scene.add(smallSpherePivot);
	}
	_setupLight() {
		const light = new THREE.AmbientLight(0xffffff, 5);

		this._scene.add(light);
		this._light = light;
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
	}
}

window.onload = function () {
	new App();
};
