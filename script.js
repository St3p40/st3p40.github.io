let zTop = 10;
const openWindows = {};

function openWindow() {
	document.getElementById('myWindow').style.display = 'block';
	document.getElementById('myWindow').style.zIndex = ++zTop;
}
function closeWindow() {
	document.getElementById('myWindow').style.display = 'none';
}

function toggleStartMenu() {
	document.getElementById('startMenu').classList.toggle('open');
}
document.addEventListener('click', function(e) {
	const menu = document.getElementById('startMenu');
	const btn = document.querySelector('.start-btn');
	if (!menu.contains(e.target) && e.target !== btn) {
		menu.classList.remove('open');
	}
});

function makeDraggable(windowElement) {
	let pos3 = 0, pos4 = 0;
	let curTop = 0, curLeft = 0, maxTop = 0, maxLeft = 0;
	let rafId = null;
	const header = windowElement.querySelector('.window-header');
	header.onmousedown = dragMouseDown;
	function dragMouseDown(e) {
		e.preventDefault();
		windowElement.style.zIndex = ++zTop;
		pos3 = e.clientX;
		pos4 = e.clientY;
		curTop = windowElement.offsetTop;
		curLeft = windowElement.offsetLeft;
		const taskbarHeight = document.querySelector('.taskbar').offsetHeight;
		maxTop = Math.max(window.innerHeight - taskbarHeight - windowElement.offsetHeight, 0);
		maxLeft = Math.max(window.innerWidth - windowElement.offsetWidth, 0);
		document.querySelectorAll('iframe').forEach(f => f.style.pointerEvents = 'none');
		document.onmouseup = closeDragElement;
		document.onmousemove = elementDrag;
	}
	function elementDrag(e) {
		e.preventDefault();
		curLeft += e.clientX - pos3;
		curTop += e.clientY - pos4;
		pos3 = e.clientX;
		pos4 = e.clientY;
		if (rafId === null) {
			rafId = requestAnimationFrame(applyPosition);
		}
	}
	function applyPosition() {
		rafId = null;
		windowElement.style.top = Math.min(Math.max(curTop, 0), maxTop) + "px";
		windowElement.style.left = Math.min(Math.max(curLeft, 0), maxLeft) + "px";
	}
	function closeDragElement() {
		document.onmouseup = null;
		document.onmousemove = null;
		document.querySelectorAll('iframe').forEach(f => f.style.pointerEvents = '');
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	}
}
makeDraggable(document.getElementById('myWindow'));

function openIframeWindow(title, url) {
	if (openWindows[url]) {
		openWindows[url].style.display = 'block';
		openWindows[url].style.zIndex = ++zTop;
		return;
	}
	const offset = Object.keys(openWindows).length % 5;
	const win = document.createElement('div');
	win.className = 'window window-iframe';
	win.style.display = 'block';
	win.style.top = (15 + offset * 4) + '%';
	win.style.left = (15 + offset * 4) + '%';
	win.style.zIndex = ++zTop;
	win.innerHTML = `
		<div class="window-header">
			<span>${title}</span>
			<button class="close-btn" onclick="closeIframeWindow('${url}')">X</button>
		</div>
		<div class="window-body">
			<iframe src="${url}"></iframe>
		</div>
	`;
	document.querySelector('.desktop').appendChild(win);
	makeDraggable(win);
	openWindows[url] = win;
}

function closeIframeWindow(url) {
	const win = openWindows[url];
	if (win) {
		win.remove();
		delete openWindows[url];
	}
}

function updateClock() {
	const now = new Date();
	document.getElementById('taskbarClock').textContent = now.toLocaleTimeString('en-GB', {timeZone: 'America/St_Johns', hour: '2-digit', minute: '2-digit', second: '2-digit'});
}
updateClock();
setInterval(updateClock, 1000);

document.addEventListener('mousemove', function(e) {
	const mouseX = (e.clientX / window.innerWidth) - 0.5;
	const mouseY = (e.clientY / window.innerHeight) - 0.5;
	const layers = document.querySelectorAll('.parallax-layer');
	layers.forEach(layer => {
		const depth = layer.getAttribute('data-depth');
		const maxMove = 50;
		const moveX = mouseX * maxMove * depth;
		const moveY = mouseY * maxMove * depth;
		layer.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(1.1)`;
	});
});