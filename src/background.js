const parallaxMouse = {x: 0, y: 0};
const parallaxTarget = {x: 0, y: 0};
let mouseInWindow = true;
document.addEventListener('mousemove', function(e) {
	parallaxTarget.x = (e.clientX / window.innerWidth) - 0.5;
	parallaxTarget.y = (e.clientY / window.innerHeight) - 0.5;
});
document.documentElement.addEventListener('mouseleave', () => mouseInWindow = false);
document.documentElement.addEventListener('mouseenter', () => mouseInWindow = true);

const parallaxLayers = Array.from(document.querySelectorAll('.parallax-layer')).map(layer => ({
	el: layer,
	depth: parseFloat(layer.getAttribute('data-depth'))
}));

function tickParallax() {
	const ease = 0.12;
	const centered = hoveredIframes.size || !mouseInWindow;
	const targetX = centered ? 0 : parallaxTarget.x;
	const targetY = centered ? 0 : parallaxTarget.y;
	parallaxMouse.x += (targetX - parallaxMouse.x) * ease;
	parallaxMouse.y += (targetY - parallaxMouse.y) * ease;
	const maxMove = 50;
	parallaxLayers.forEach(({el, depth}) => {
		const moveX = parallaxMouse.x * maxMove * depth;
		const moveY = parallaxMouse.y * maxMove * depth;
		el.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(1.1)`;
	});
	requestAnimationFrame(tickParallax);
}
requestAnimationFrame(tickParallax);

(function() {
	const canvas = document.getElementById('rain-canvas');
	const ctx = canvas.getContext('2d');
	let drops = [];
	let width = 0, height = 0;

	function resizeCanvas() {
		const dpr = window.devicePixelRatio || 1;
		width = window.innerWidth;
		height = window.innerHeight;
		canvas.width = width * dpr;
		canvas.height = height * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const dropCount = Math.round((width * height) / 9000);
		drops = Array.from({length: dropCount}, createDrop);
	}

	const tierAlphas = [0.18, 0.26, 0.34, 0.4];

	function createDrop() {
		return {
			x: Math.random() * width,
			y: Math.random() * height,
			length: 32 + Math.random() * 15,
			speed: 48 + Math.random() * 6,
			tier: Math.floor(Math.random() * tierAlphas.length)
		};
	}

	function respawnDrop(drop) {
		if (Math.random() < 0.9) {
			drop.x = Math.random() * width;
			drop.y = -drop.length;
		} else {
			drop.x = width + drop.length;
			drop.y = Math.random() * height;
		}
	}

	function stepDrop(drop) {
		drop.y += drop.speed;
		drop.x -= drop.speed * 0.25;
		if (drop.y > height || drop.x < -drop.length) {
			respawnDrop(drop);
		}
	}

	const depth = 1.2;
	const maxMove = 50;

	function render() {
		ctx.clearRect(0, 0, width, height);
		ctx.save();
		ctx.translate(parallaxMouse.x * maxMove * depth, parallaxMouse.y * maxMove * depth);
		ctx.strokeStyle = '#14191d';
		ctx.lineWidth = 4;
		const tierPaths = tierAlphas.map(() => new Path2D());
		drops.forEach(drop => {
			const path = tierPaths[drop.tier];
			path.moveTo(drop.x, drop.y);
			path.lineTo(drop.x + drop.length * 0.25, drop.y - drop.length);
			stepDrop(drop);
		});
		tierPaths.forEach((path, i) => {
			ctx.globalAlpha = tierAlphas[i];
			ctx.stroke(path);
		});
		ctx.globalAlpha = 1;
		ctx.restore();
		requestAnimationFrame(render);
	}

	window.addEventListener('resize', resizeCanvas);
	resizeCanvas();
	requestAnimationFrame(render);
})();
