var style = document.createElement('style');
style.innerHTML = `
#cursor{
    position: fixed;
    width: 6px;
    height: 6px;
    background-color: white;
    border-radius: 100%;
    pointer-events: none;
    mix-blend-mode:difference;
    z-index: 100;
}

#cursorFollower{
    position: fixed;
    width: 50px;
    height: 50px;
    background-size: contain;
    background-repeat: no-repeat;
    pointer-events: none;
    transition: .2s;
    top: 50%;
    left: 50%;
    z-index: 99;
}

*{
    cursor: none !important;
}

@media (hover: none) {    
	#cursor, #cursorFollower{
        display: none;
    }
}
`;
document.head.appendChild(style);

const cursor = document.createElement('div');
cursor.setAttribute('id', 'cursor');
const cursorFollower = document.createElement('div');
cursorFollower.setAttribute('id', 'cursorFollower');

const faviconImg = document.querySelector('link[rel="shortcut icon"]').getAttribute('href');
cursorFollower.setAttribute('style', `background-image: url(${faviconImg})`);

document.body.append(cursor, cursorFollower);

const mouseCoords = {x: 0, y: 0};
// const cursor = document.getElementById('cursor');
// const cursorFollower = document.getElementById('cursorFollower');

cursorFollower.x = 0;
cursorFollower.y = 0;

cursor.style.opacity = '0';
cursorFollower.style.opacity = '0';

window.addEventListener('mousemove', function (e) {
    cursor.style.opacity = '1';
    cursorFollower.style.opacity = '1';

mouseCoords.x = e.clientX;
mouseCoords.y = e.clientY;

cursor.style.left = e.clientX - 3 + 'px';
cursor.style.top = e.clientY - 3 + 'px';

cursorFollower.animate({
    left: e.clientX - 10 + 'px',
    top: e.clientY + 10 + 'px',
    transform: `rotate(${(e.clientY + e.clientX) / 2}deg)`,
    filter: 'hue-rotate(0deg)',
}, {duration: 1000, fill: 'forwards'});
})

window.addEventListener('click', function (e) {
cursorFollower.animate({
    transform: `rotate(720deg)`,
    filter: 'hue-rotate(270deg)'
}, {duration: 500, fill: "forwards"});
})