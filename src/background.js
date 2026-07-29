const parallaxMouse = {x: 0, y: 0};
const parallaxTarget = {x: 0, y: 0};
let mouseInWindow = true;
document.addEventListener('mousemove', function(e) {
	parallaxTarget.x = (e.clientX / window.innerWidth) - 0.5;
	parallaxTarget.y = (e.clientY / window.innerHeight) - 0.5;
});
document.documentElement.addEventListener('mouseleave', () => mouseInWindow = false);
document.documentElement.addEventListener('mouseenter', () => mouseInWindow = true);

function tickParallax() {
	const ease = 0.12;
	const centered = hoveredIframes.size || !mouseInWindow;
	const targetX = centered ? 0 : parallaxTarget.x;
	const targetY = centered ? 0 : parallaxTarget.y;
	parallaxMouse.x += (targetX - parallaxMouse.x) * ease;
	parallaxMouse.y += (targetY - parallaxMouse.y) * ease;
	const layers = document.querySelectorAll('.parallax-layer');
	layers.forEach(layer => {
		const depth = layer.getAttribute('data-depth');
		const maxMove = 50;
		const moveX = parallaxMouse.x * maxMove * depth;
		const moveY = parallaxMouse.y * maxMove * depth;
		layer.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(1.1)`;
	});
	requestAnimationFrame(tickParallax);
}
requestAnimationFrame(tickParallax);

(function() {
	const canvas = document.getElementById('rain-canvas');
	const ctx = canvas.getContext('2d');
	let drops = [];

	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		const dropCount = Math.round((canvas.width * canvas.height) / 9000);
		drops = Array.from({length: dropCount}, createDrop);
	}

	function createDrop() {
		return {
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			length: 16 + Math.random() * 15,
			speed: 24 + Math.random() * 6,
			opacity: 0.15 + Math.random() * 0.25
		};
	}

	function respawnDrop(drop) {
		if (Math.random() < 0.9) {
			drop.x = Math.random() * canvas.width;
			drop.y = -drop.length;
		} else {
			drop.x = canvas.width + drop.length;
			drop.y = Math.random() * canvas.height;
		}
	}

	function stepDrop(drop) {
		drop.y += drop.speed;
		drop.x -= drop.speed * 0.25;
		if (drop.y > canvas.height || drop.x < -drop.length) {
			respawnDrop(drop);
		}
	}

	const depth = 1.2;
	const maxMove = 50;

	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		ctx.translate(parallaxMouse.x * maxMove * depth, parallaxMouse.y * maxMove * depth);
		ctx.strokeStyle = '#14191d';
		ctx.lineWidth = 4;
		drops.forEach(drop => {
			ctx.globalAlpha = drop.opacity;
			ctx.beginPath();
			ctx.moveTo(drop.x, drop.y);
			ctx.lineTo(drop.x + drop.length * 0.25, drop.y - drop.length);
			ctx.stroke();
			stepDrop(drop);
		});
		ctx.globalAlpha = 1;
		ctx.restore();
		requestAnimationFrame(render);
	}

	window.addEventListener('resize', resizeCanvas);
	resizeCanvas();
	requestAnimationFrame(render);
})();
