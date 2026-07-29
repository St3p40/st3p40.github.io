let zTop = 10;
const openWindows = {};

function openWindow() {
	document.getElementById('myWindow').style.display = 'flex';
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

function eventPoint(e) {
	const t = e.touches && e.touches[0] || e.changedTouches && e.changedTouches[0];
	return t ? {x: t.clientX, y: t.clientY} : {x: e.clientX, y: e.clientY};
}

function makeDraggable(windowElement) {
	let pos3 = 0, pos4 = 0;
	let curTop = 0, curLeft = 0, maxTop = 0, maxLeft = 0;
	let rafId = null;
	const header = windowElement.querySelector('.window-header');
	header.addEventListener('mousedown', dragStart);
	header.addEventListener('touchstart', dragStart, {passive: false});
	function dragStart(e) {
		e.preventDefault();
		windowElement.style.zIndex = ++zTop;
		const p = eventPoint(e);
		pos3 = p.x;
		pos4 = p.y;
		curTop = windowElement.offsetTop;
		curLeft = windowElement.offsetLeft;
		const taskbarHeight = document.querySelector('.taskbar').offsetHeight;
		maxTop = Math.max(window.innerHeight - taskbarHeight - windowElement.offsetHeight, 0);
		maxLeft = Math.max(window.innerWidth - windowElement.offsetWidth, 0);
		document.querySelectorAll('iframe').forEach(f => f.style.pointerEvents = 'none');
		document.addEventListener('mousemove', elementDrag);
		document.addEventListener('touchmove', elementDrag, {passive: false});
		document.addEventListener('mouseup', closeDragElement);
		document.addEventListener('touchend', closeDragElement);
		document.addEventListener('touchcancel', closeDragElement);
	}
	function elementDrag(e) {
		e.preventDefault();
		const p = eventPoint(e);
		curLeft += p.x - pos3;
		curTop += p.y - pos4;
		pos3 = p.x;
		pos4 = p.y;
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
		document.removeEventListener('mousemove', elementDrag);
		document.removeEventListener('touchmove', elementDrag);
		document.removeEventListener('mouseup', closeDragElement);
		document.removeEventListener('touchend', closeDragElement);
		document.removeEventListener('touchcancel', closeDragElement);
		document.querySelectorAll('iframe').forEach(f => f.style.pointerEvents = '');
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	}
}
function makeResizable(windowElement) {
	let startX = 0, startY = 0, startWidth = 0, startHeight = 0, maxWidth = 0, maxHeight = 0;
	let rafId = null;
	const handle = document.createElement('div');
	handle.className = 'resize-handle';
	windowElement.appendChild(handle);
	handle.addEventListener('mousedown', resizeStart);
	handle.addEventListener('touchstart', resizeStart, {passive: false});
	function resizeStart(e) {
		e.preventDefault();
		e.stopPropagation();
		windowElement.style.zIndex = ++zTop;
		const p = eventPoint(e);
		startX = p.x;
		startY = p.y;
		const rect = windowElement.getBoundingClientRect();
		startWidth = rect.width;
		startHeight = rect.height;
		const taskbarHeight = document.querySelector('.taskbar').offsetHeight;
		maxWidth = window.innerWidth - rect.left;
		maxHeight = window.innerHeight - taskbarHeight - rect.top;
		document.querySelectorAll('iframe').forEach(f => f.style.pointerEvents = 'none');
		document.addEventListener('mousemove', elementResize);
		document.addEventListener('touchmove', elementResize, {passive: false});
		document.addEventListener('mouseup', closeResizeElement);
		document.addEventListener('touchend', closeResizeElement);
		document.addEventListener('touchcancel', closeResizeElement);
	}
	function elementResize(e) {
		e.preventDefault();
		const p = eventPoint(e);
		startWidth += p.x - startX;
		startHeight += p.y - startY;
		startX = p.x;
		startY = p.y;
		if (rafId === null) {
			rafId = requestAnimationFrame(applySize);
		}
	}
	function applySize() {
		rafId = null;
		const minWidth = parseFloat(getComputedStyle(windowElement).minWidth) || 0;
		const minHeight = parseFloat(getComputedStyle(windowElement).minHeight) || 0;
		windowElement.style.width = Math.min(Math.max(startWidth, minWidth), maxWidth) + "px";
		windowElement.style.height = Math.min(Math.max(startHeight, minHeight), maxHeight) + "px";
	}
	function closeResizeElement() {
		document.removeEventListener('mousemove', elementResize);
		document.removeEventListener('touchmove', elementResize);
		document.removeEventListener('mouseup', closeResizeElement);
		document.removeEventListener('touchend', closeResizeElement);
		document.removeEventListener('touchcancel', closeResizeElement);
		document.querySelectorAll('iframe').forEach(f => f.style.pointerEvents = '');
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	}
}
makeDraggable(document.getElementById('myWindow'));
makeResizable(document.getElementById('myWindow'));

function openIframeWindow(title, url) {
	if (openWindows[url]) {
		openWindows[url].style.display = 'flex';
		openWindows[url].style.zIndex = ++zTop;
		return;
	}
	const offset = Object.keys(openWindows).length % 5;
	const win = document.createElement('div');
	win.className = 'window window-iframe';
	win.style.display = 'flex';
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
	makeResizable(win);
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
