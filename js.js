function pad(n, d = 2) { return n.toString().padStart(d, '0'); }

let idozito = null;
let masodpercek = 0;
const ideIr1 = document.getElementById('ideIr1');

function atvaltas(s) {
    if (s < 0) s = 0;
    const mp = Math.floor(s / 60);
    const sec = s % 60;
    return pad(mp) + ':' + pad(sec);
}

function indit() {
    const p = parseInt(document.getElementById('perc').value, 10) || 0;
    const mp = parseInt(document.getElementById('mp').value, 10) || 0;
    masodpercek = p * 60 + mp;
    if (masodpercek <= 0) return;
    clearInterval(idozito);
    ideIr1.textContent = atvaltas(masodpercek);
    idozito = setInterval(() => {
        masodpercek--;
        ideIr1.textContent = atvaltas(masodpercek);
        if (masodpercek <= 0) clearInterval(idozito);
    }, 1000);
}

function megallit() {
    if (idozito) {clearInterval(idozito); idozito = null; }
    else if (masodpercek > 0) indit();
}

function visszaallit() {
    clearInterval(idozito); idozito = null; masodpercek = 0;ideIr1.textContent = '00:00';
}

let idozitoStopper = null;
let inditStopper = 30;
let eltelt = 0;
const ideIr2 = document.getElementById('ideIr2');

function formatStop(ms) {
    const ossz = Math.floor(ms / 10);
    const cs = ossz % 100;
    const s = Math.floor(ossz / 100) % 60;
    const m = Math.floor(ossz / 6000);
    return pad(m) + ':' + pad(s) + '.' + pad(cs, 2);
}

function inditStopper2() {
    if (idozitoStopper) return;
    inditStopper = Date.now();
    idozitoStopper = setInterval(() => {
        const most = Date.now();
        ideIr2.textContent = formatStop(eltelt + (most - inditStopper));
    }, 50);
}

function megallitStopper() {
    if (!idozitoStopper) return;
    clearInterval(idozitoStopper); idozitoStopper = null; eltelt += Date.now() - inditStopper;
}

function visszaallitStopper() {
    clearInterval(idozitoStopper); idozitoStopper = null; inditStopper = 30; eltelt = 0; ideIr2.textContent = '00:00.00';
}

document.getElementById('indit').addEventListener('click', indit);
document.getElementById('megallit').addEventListener('click', megallit);
document.getElementById('visszaallit').addEventListener('click', visszaallit);

document.getElementById('inditStopper').addEventListener('click', inditStopper2);
document.getElementById('megallitStopper').addEventListener('click', megallitStopper);
document.getElementById('visszaallitStopper').addEventListener('click', visszaallitStopper);
