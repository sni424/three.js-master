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
		/**width,height 3차원 영역을 표현할 가로와 세로 크기 */
		const width = this._divCotainer.clientWidth;
		const height = this._divCotainer.clientHeight;
		/**camera객체 생성 */
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
		camera.position.z = 2;
		/**또다른 메서드에서 사용가능하도록  this._camera필드 객체로 설정*/
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
		const shape = new THREE.Shape();
		/**좌표를 1,1에서 시작 */
		shape.moveTo(1, 1);
		/**line 으로 선을 그음 */
		shape.lineTo(1, -1);
		shape.lineTo(-1, -1);
		shape.lineTo(-1, 1);
		/**closePath로 도형을 닫음 */
		shape.closePath();

		const geometry = new THREE.BufferGeometry();
		const points = shape.getPoints();
		geometry.setFromPoints(points);

		const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
		const line = new THREE.Line(geometry, material);

		this._scene.add(line);
	}
	update(time) {
		/**받은 time값에 0.001을 곱한다 */
		time *= 0.001;
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
