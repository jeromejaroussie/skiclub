document.addEventListener('DOMContentLoaded',()=>{const b=document.querySelector('.menu-btn'),n=document.querySelector('.nav');
if(b&&n)b.onclick=()=>{const o=n.classList.toggle('open');
b.setAttribute('aria-expanded',o)};
const p=location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('.nav a').forEach(a=>{if(a.getAttribute('href')===p)a.classList.add('active')});
document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear())});
