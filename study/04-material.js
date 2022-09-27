import * as THREE from "../build/three.module.js";
import { OrbitControls } from "../examples/jsm/controls/OrbitControls.js";

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
		this._setupControls();

		/**창크기가 변경될때 발생 bind을 사용한 이유는 this가 app클래스 객체가 되기위함 */
		window.onresize = this.resize.bind(this);
		this.resize();

		/**render메서드는 3차원 그래픽장면을 만들어주는 메서드 */
		requestAnimationFrame(this.render.bind(this));
	}
	_setupControls() {
		new OrbitControls(this._camera, this._divCotainer);
	}

	_setupCamera() {
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			100
		);
		camera.position.z = 25;

		this._camera = camera;
	}

	_setupLight() {
		/**광원 색상 */
		const color = 0xffffff;
		/**광원 세기값 */
		const intensity = 1;
		/** 광원생성 */
		const light = new THREE.DirectionalLight(color, intensity);
		/** 광원 위치 */
		light.position.set(-1, 2, 4);
		/**광원을 scene 객체에 추가 */
		this._scene.add(light);
	}
	/**파랑색 개열의 정육면제를 생성하는 코드 */
	_setupModel() {
		const matarial = new THREE.MeshPhysicalMaterial({
			color: 0xff0000,
			emissive: 0x00000,
			roughness: 0,
			metalness: 0,
			flatShading: false,
			wireframe: false,
			/**메쉬 코팅정도 */
			clearcoat: 0,
			/**코딩에 관한 거칠기값 */
			clearcoatRoughness: 0,
		});
		// const matarial = new THREE.MeshStandardMaterial({
		// 	color: 0xff0000,
		// 	emissive: 0x00000,
		// 	/**거칠기 광원에 대해 저항 */
		// 	roughness: 0,
		// 	/**금속성 쇠처럼 광원이 비춤 반사도됨 */
		// 	metalness: 0,
		// 	flatShading: false,
		// 	wireframe: false,
		// });
		// /**MeshPhongMaterial 메쉬가 랜더링되는 픽셀단위로 광원을 계산 */
		// const matarial = new THREE.MeshPhongMaterial({
		// 	color: 0xff0000,
		// 	emissive: 0x00000,
		// 	/**광원에의해 반사되는 색상 광언을 비췄을때 */
		// 	specular: 0x00000,
		// 	/**위의 색상에대한 농도 0~10 */
		// 	shiniess: 0,
		// 	/**매쉬를 면으로 표시 */
		// 	flatShading: false,
		// 	wireframe: false,
		// });
		// /**MeshLambertMaterial메쉬를 구성하는 정점에서 광원을 계산 */
		// const matarial = new THREE.MeshLambertMaterial({
		// 	transparent: false,
		// 	opacity: 1,
		// 	side: THREE.FontSide,
		// 	color: 0xff0000,
		// 	/**광원에서 방출하는 값 기본 검은색은 어떤색도 방출 x */
		// 	emissive: 0x00000,
		// 	wireframe: false,
		// });
		// const matarial = new THREE.MeshBasicMaterial({
		// 	/**랜더링시 메쉬가 보일지 안보일지 */
		// 	visible: true,
		// 	/**불투명도 opacity를 사용할지 말지 */
		// 	transparent: false,
		// 	opacity: 1,
		// 	/**z-buffer 공부필요 */
		// 	depthTest: true,
		// 	depthWrite: true,
		// 	/**mesh를 구성하는 면에서 앞면만 랜더링할지 뒤만 할지 모두 할지 */
		// 	side: THREE.FontSide,
		// 	color: 0xffff00,
		// 	/**메쉬를 선형태로 랜더링할지 */
		// 	wireframe: false,
		// });

		const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), matarial);
		box.position.set(-1, 0, 0);
		this._scene.add(box);

		const sphere = new THREE.Mesh(
			new THREE.SphereGeometry(0.7, 32, 32),
			matarial
		);
		sphere.position.set(1, 0, 0);
		this._scene.add(sphere);
	}

	update(time) {
		/**받은 time값에 0.001을 곱한다 */
		time *= 0.001;
		/**태양 자전추가 태양이 자전하면 지구는 공전한다 */
		this._solarSystem.rotation.y = time / 2;
		/**지구 자전 */
		this._earthOrbit.rotation.y = time * 2;
		/**달 자전 */
		this._moonOrbit.rotation.y = time * 5;
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
}

window.onload = function () {
	new App();
};
