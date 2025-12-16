function kitöltés(n, d = 2) { 
    return n.toString().padStart(d, '0'); 
}

// Shared AudioContext to avoid autoplay policy blocking.
let audioCtx = null;
function initAudioContextOnce() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            audioCtx = null;
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
}
// Attempt to create/resume AudioContext on first user interaction
document.addEventListener('click', initAudioContextOnce, { once: true, passive: true });

let visszaszámláló_Intervallum = null;
function hangEffektusMegjelenik() {
    // ensure we have an active/resumed AudioContext
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            return; // cannot create audio
        }
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
    const now = audioCtx.currentTime;

    // --- Noise burst for metallic attack ---
    const bufferSize = audioCtx.sampleRate * 1; // 1s buffer
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        // decaying white noise
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }

    const noiseSrc = audioCtx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    const noiseGain = audioCtx.createGain();
    noiseSrc.connect(noiseGain);

    const band = audioCtx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 1200;
    band.Q.value = 6;
    noiseGain.connect(band);

    // --- Metallic resonance oscillator (ring) ---
    const ringOsc = audioCtx.createOscillator();
    ringOsc.type = 'sine';
    // start a bit higher and drop to create 'pipe drop' feeling
    ringOsc.frequency.setValueAtTime(740, now);
    ringOsc.frequency.exponentialRampToValueAtTime(480, now + 1.2);

    const ringGain = audioCtx.createGain();
    ringGain.gain.setValueAtTime(0.0001, now);
    ringGain.gain.exponentialRampToValueAtTime(0.6, now + 0.02);
    ringGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
    ringOsc.connect(ringGain);
    ringGain.connect(band);

    // --- Low thud for body ---
    const thudOsc = audioCtx.createOscillator();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(120, now);
    thudOsc.frequency.exponentialRampToValueAtTime(60, now + 0.6);
    const thudGain = audioCtx.createGain();
    thudGain.gain.setValueAtTime(0.0001, now);
    thudGain.gain.exponentialRampToValueAtTime(0.7, now + 0.01);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    thudOsc.connect(thudGain);
    thudGain.connect(audioCtx.destination);

    // --- Master output ---
    const master = audioCtx.createGain();
    master.gain.value = 0.8;
    band.connect(master);
    master.connect(audioCtx.destination);

    // Envelopes for noise
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(1.0, now + 0.001);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    // start sources
    noiseSrc.start(now);
    noiseSrc.stop(now + 0.9);
    ringOsc.start(now);
    ringOsc.stop(now + 2.2);
    thudOsc.start(now);
    thudOsc.stop(now + 1.0);

    // keep AudioContext alive (resuming on user gesture) to avoid repeated creation
}

let visszaszámláló_Másodpercek = 0;
const visszaszámláló_Kijelző = document.getElementById('visszaszamlalo_display').querySelector('p');

function formátumVissszaszámlálás(s) {
    if (s < 0) s = 0;
    const p = Math.floor(s / 60);
    const mp = s % 60;
    return kitöltés(p) + ':' + kitöltés(mp);
}

function indításVissszaszámlálás() {
    const perc = parseInt(document.getElementById('perc').value, 10) || 0;
    const mp = parseInt(document.getElementById('mp').value, 10) || 0;
    visszaszámláló_Másodpercek = perc * 60 + mp;
    if (visszaszámláló_Másodpercek <= 0) return;
    
    clearInterval(visszaszámláló_Intervallum);
    visszaszámláló_Kijelző.textContent = formátumVissszaszámlálás(visszaszámláló_Másodpercek);
    
    visszaszámláló_Intervallum = setInterval(() => {
        visszaszámláló_Másodpercek--;
        visszaszámláló_Kijelző.textContent = formátumVissszaszámlálás(visszaszámláló_Másodpercek);
        if (visszaszámláló_Másodpercek <= 0) clearInterval(visszaszámláló_Intervallum);
    }, 1000);
}

function szünetVissszaszámlálás() {
    if (visszaszámláló_Intervallum) {
        clearInterval(visszaszámláló_Intervallum);
        visszaszámláló_Intervallum = null;
    } else if (visszaszámláló_Másodpercek > 0) {
        clearInterval(visszaszámláló_Intervallum);
        visszaszámláló_Kijelző.textContent = formátumVissszaszámlálás(visszaszámláló_Másodpercek);
        
        visszaszámláló_Intervallum = setInterval(() => {
            visszaszámláló_Másodpercek--;
            visszaszámláló_Kijelző.textContent = formátumVissszaszámlálás(visszaszámláló_Másodpercek);
            if (visszaszámláló_Másodpercek <= 0) {
                clearInterval(visszaszámláló_Intervallum);
                hangEffektusMegjelenik();
            }
        }, 1000);
    }
}

function alaphelyzetVissszaszámlálás() {
    clearInterval(visszaszámláló_Intervallum);
    visszaszámláló_Intervallum = null;
    visszaszámláló_Másodpercek = 0;
    visszaszámláló_Kijelző.textContent = '0:00';
}

let edzés_Intervallum = null;
let edzés_Másodpercek = 30;
const edzés_Kijelző = document.getElementById('idozito_display').querySelector('p');
const edzés_ÁllapotKijelző = document.getElementById('edzes_display');

const edzésPlánok = [
    [
        { név: 'Fekvőtámasz', idő: 30 },
        { név: 'Guggolás', idő: 30 },
        { név: 'Plank', idő: 30 },
        { név: 'Ugrálás', idő: 30 },
        { név: 'Felülés', idő: 30 },
        { név: 'Kitörés', idő: 30 }
    ],
    [
        { név: 'Fekvőtámasz', idő: 30 },
        { név: 'Fekvőtámasz széles', idő: 30 },
        { név: 'Plank', idő: 30 },
        { név: 'Plank fordított', idő: 30 },
        { név: 'Csípőemeléses plank', idő: 30 },
        { név: 'Oldalsó plank', idő: 30 }
    ],
    [
        { név: 'Burpee', idő: 30 },
        { név: 'Ugrálás lábkar behúzással', idő: 30 },
        { név: 'Mountain climber', idő: 30 },
        { név: 'Fekvőtámasz ugrálással', idő: 30 },
        { név: 'Fekvőtámasz forgó érintéssel', idő: 30 },
        { név: 'Teljes test edzés', idő: 30 }
    ]
];

let edzés_AktuálisPraktlat = 0;
let edzés_Szünetben = false;
let edzés_Futva = false;
let edzés_AktuálisTerv = 0;

function formátumEdzés(s) {
    if (s < 0) s = 0;
    const p = Math.floor(s / 60);
    const mp = s % 60;
    return kitöltés(p) + ':' + kitöltés(mp);
}

function edzésTervMegjelenítés() {
    const terv = edzésPlánok[edzés_AktuálisTerv];
    if (edzés_Szünetben) {
        const következő = terv[(edzés_AktuálisPraktlat + 1) % terv.length];
        edzés_ÁllapotKijelző.innerHTML = `<p><strong>Pihenő</strong></p><p style="font-size: 0.9em; color: #4fa3e8;">Következő: ${következő.név}</p>`;
    } else {
        const jelenlegi = terv[edzés_AktuálisPraktlat % terv.length];
        const következő = terv[(edzés_AktuálisPraktlat + 1) % terv.length];
        
        edzés_ÁllapotKijelző.innerHTML = `<p><strong>${jelenlegi.név}</strong></p><p style="font-size: 0.9em; color: #4fa3e8;">Következő: ${következő.név}</p>`;
    }
}

function indításEdzés() {
    edzés_AktuálisTerv = parseInt(document.getElementById('edzes_valasztas').value, 10) || 0;
    edzés_AktuálisPraktlat = 0;
    edzés_Szünetben = false;
    edzés_Futva = true;
    edzés_Másodpercek = 30;
    clearInterval(edzés_Intervallum);
    edzés_Kijelző.textContent = formátumEdzés(edzés_Másodpercek);
    edzésTervMegjelenítés();
    
    edzés_Intervallum = setInterval(() => {
        edzés_Másodpercek--;
        edzés_Kijelző.textContent = formátumEdzés(edzés_Másodpercek);
        
        const terv = edzésPlánok[edzés_AktuálisTerv];
        if (!edzés_Szünetben && edzés_Másodpercek <= 0) {
            edzés_Szünetben = true;
            edzés_Másodpercek = 10;
            edzésTervMegjelenítés();
        } else if (edzés_Szünetben && edzés_Másodpercek <= 0) {
            edzés_AktuálisPraktlat++;
            if (edzés_AktuálisPraktlat >= terv.length) {
                clearInterval(edzés_Intervallum);
                edzés_Futva = false;
                edzés_ÁllapotKijelző.innerHTML = '<p>Edzés kész!</p>';
                return;
            }
            edzés_Szünetben = false;
            edzés_Másodpercek = 30;
            edzésTervMegjelenítés();
        }
    }, 1000);
}

function szünetEdzés() {
    if (edzés_Intervallum) {
        clearInterval(edzés_Intervallum);
        edzés_Intervallum = null;
        edzés_ÁllapotKijelző.innerHTML = '<p>Felkészülés...</p>';
    } else if (edzés_Futva) {
        clearInterval(edzés_Intervallum);
        edzés_Kijelző.textContent = formátumEdzés(edzés_Másodpercek);
        edzésTervMegjelenítés();
        
        edzés_Intervallum = setInterval(() => {
            edzés_Másodpercek--;
            edzés_Kijelző.textContent = formátumEdzés(edzés_Másodpercek);
            
            const terv = edzésPlánok[edzés_AktuálisTerv];
            if (!edzés_Szünetben && edzés_Másodpercek <= 0) {
                edzés_Szünetben = true;
                edzés_Másodpercek = 10;
                edzésTervMegjelenítés();
            } else if (edzés_Szünetben && edzés_Másodpercek <= 0) {
                edzés_AktuálisPraktlat++;
                if (edzés_AktuálisPraktlat >= terv.length) {
                    clearInterval(edzés_Intervallum);
                    edzés_Futva = false;
                    edzés_ÁllapotKijelző.innerHTML = '<p>Edzés kész!</p>';
                    return;
                }
                edzés_Szünetben = false;
                edzés_Másodpercek = 30;
                edzésTervMegjelenítés();
            }
        }, 1000);
    }
}

function alaphelyzetEdzés() {
    clearInterval(edzés_Intervallum);
    edzés_Intervallum = null;
    edzés_Másodpercek = 30;
    edzés_AktuálisPraktlat = 0;
    edzés_Szünetben = false;
    edzés_Futva = false;
    edzés_Kijelző.textContent = '00:30';
    edzés_ÁllapotKijelző.innerHTML = '<p>Felkészülés...</p>';
}

function edzésKövetzőPraktlat() {
    if (!edzés_Futva) return;
    
    const terv = edzésPlánok[edzés_AktuálisTerv];
    if (edzés_Szünetben) {
        edzés_AktuálisPraktlat++;
        if (edzés_AktuálisPraktlat >= terv.length) {
            edzés_AktuálisPraktlat = 0;
        }
        edzés_Szünetben = false;
        edzés_Másodpercek = 30;
    } else {
        edzés_Szünetben = true;
        edzés_Másodpercek = 10;
    }
    
    edzésTervMegjelenítés();
}


let szín_Intervallum = null;
const szín_Körök = document.querySelectorAll('.color-dot');
let szín_AktuálisIndex = 0;

function háttérSzínMódosítás(szín) {
    document.body.style.background = szín;
}

function indításSzínVáltás() {
    const intervallum = parseInt(document.getElementById('idozito_ido').value, 10) || 1000;
    
    clearInterval(szín_Intervallum);
    szín_AktuálisIndex = 0;
    
    szín_Intervallum = setInterval(() => {
        const kör = szín_Körök[szín_AktuálisIndex % szín_Körök.length];
        const szín = kör.getAttribute('data-color') || window.getComputedStyle(kör).backgroundColor;
        háttérSzínMódosítás(szín);
        szín_AktuálisIndex++;
    }, intervallum);
}

function szünetSzínVáltás() {
    if (szín_Intervallum) {
        clearInterval(szín_Intervallum);
        szín_Intervallum = null;
    } else {
        const intervallum = parseInt(document.getElementById('idozito_ido').value, 10) || 1000;
        
        szín_Intervallum = setInterval(() => {
            const kör = szín_Körök[szín_AktuálisIndex % szín_Körök.length];
            const szín = kör.getAttribute('data-color') || window.getComputedStyle(kör).backgroundColor;
            háttérSzínMódosítás(szín);
            szín_AktuálisIndex++;
        }, intervallum);
    }
}

function alaphelyzetSzínVáltás() {
    clearInterval(szín_Intervallum);
    szín_Intervallum = null;
    szín_AktuálisIndex = 0;
    document.body.style.background = 'linear-gradient(135deg, #0a0f1f 0%, #0d1428 100%)';
}



document.getElementById('start').addEventListener('click', indításVissszaszámlálás);
document.getElementById('stop').addEventListener('click', szünetVissszaszámlálás);
document.getElementById('reset').addEventListener('click', alaphelyzetVissszaszámlálás);

document.getElementById('edzes_start').addEventListener('click', indításEdzés);
document.getElementById('edzes_stop').addEventListener('click', szünetEdzés);
document.getElementById('edzes_skip').addEventListener('click', edzésKövetzőPraktlat);
document.getElementById('edzes_reset').addEventListener('click', alaphelyzetEdzés);



const témáK = {
    kek: {
        bg: 'linear-gradient(135deg, #0a0f1f 0%, #0d1428 100%)',
        primaryColor: '#4fa3e8',
        secondaryColor: '#1e5a9e',
        textColor: '#b8c9d9',
        accentColor: '#3d7fb8'
    },
    lila: {
        bg: 'linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 100%)',
        primaryColor: '#9d4edd',
        secondaryColor: '#5a189a',
        textColor: '#dab4ff',
        accentColor: '#7209b7'
    },
    zold: {
        bg: 'linear-gradient(135deg, #0f2e1a 0%, #1b4e2d 100%)',
        primaryColor: '#52b788',
        secondaryColor: '#1b4332',
        textColor: '#b7e4c7',
        accentColor: '#2d6a4f'
    },
    piros: {
        bg: 'linear-gradient(135deg, #2e0f0f 0%, #4e1b1b 100%)',
        primaryColor: '#e63946',
        secondaryColor: '#8b1f1f',
        textColor: '#f5baba',
        accentColor: '#d62828'
    },
    narancs: {
        bg: 'linear-gradient(135deg, #2e1a0f 0%, #4e2d1b 100%)',
        primaryColor: '#ff9f1c',
        secondaryColor: '#cc6b00',
        textColor: '#ffe5b4',
        accentColor: '#eb8c00'
    },
    roza: {
        bg: 'linear-gradient(135deg, #2e0f2a 0%, #4e1b47 100%)',
        primaryColor: '#e91e8c',
        secondaryColor: '#a01450',
        textColor: '#f5b4d4',
        accentColor: '#d61c7f'
    }
};

function témáAtVált(témaNév) {
    const téma = témáK[témaNév];
    if (!téma) return;
    
    document.body.style.background = téma.bg;
    
    const style = document.createElement('style');
    style.textContent = `
        h1, h3 { color: ${téma.primaryColor} !important; }
        #cim { border-color: ${téma.secondaryColor} !important; }
        #visszaszamlalo, #idozito, #szinvaltas { border-color: ${téma.secondaryColor} !important; }
        #visszaszamlalo_display, #idozito_display, #edzes_display { border-color: ${téma.accentColor} !important; }
        #visszaszamlalo_display p, #idozito_display p, #edzes_display p { color: ${téma.accentColor} !important; }
        input[type="number"], select { border-color: ${téma.secondaryColor} !important; color: ${téma.primaryColor} !important; }
        #start, #edzes_start, #stop, #edzes_stop, #edzes_skip { background: linear-gradient(135deg, ${téma.primaryColor} 0%, ${téma.secondaryColor} 100%) !important; }
        #reset, #edzes_reset { background: linear-gradient(135deg, ${téma.secondaryColor} 0%, ${téma.primaryColor} 100%) !important; }
        .color-dot { border-color: ${téma.primaryColor} !important; }
        .tema-gomb { border-color: ${téma.primaryColor} !important; color: ${téma.primaryColor} !important; }
    `;
    document.head.appendChild(style);
}

// Make color dots selectable (toggle) instead of immediate background change.
function updateSzinStartState() {
    const any = document.querySelectorAll('.color-dot.selected').length > 0;
    const startBtn = document.getElementById('szin_inditas_btn');
    if (startBtn) startBtn.disabled = !any;
    const kovBtn = document.getElementById('szin_kovetkezo_btn');
    if (kovBtn) kovBtn.disabled = !any;
}

szín_Körök.forEach(kör => {
    kör.addEventListener('click', () => {
        if (kör.classList.contains('disabled')) return;
        kör.classList.toggle('selected');
        updateSzinStartState();
    });
});

const szinInput = document.getElementById('szin_intervallum_input');
const szinStartBtn = document.getElementById('szin_inditas_btn');
const szinStopBtn = document.getElementById('szin_stop_btn');
const szinKovBtn = document.getElementById('szin_kovetkezo_btn');
let szinManualIndex = 0;

if (szinInput) {
    szinInput.addEventListener('input', () => {
        let v = parseInt(szinInput.value, 10) || 1;
        if (v < 1) v = 1;
        if (v > 5) v = 5;
        szinInput.value = v;
    });
}

if (szinStartBtn) {
    szinStartBtn.addEventListener('click', () => {
        const selected = Array.from(document.querySelectorAll('.color-dot.selected'));
        if (selected.length === 0) return;
        let seconds = parseInt(szinInput.value, 10) || 1;
        if (seconds < 1) seconds = 1;
        if (seconds > 5) seconds = 5;
        const intervalMs = seconds * 1000;

        // disable selection while running
        szín_Körök.forEach(k => k.classList.add('disabled'));
        szinStartBtn.disabled = true;
        szinStopBtn.disabled = false;

        // start rotating through selected
        let idx = 0;
        const firstColor = selected[idx].getAttribute('data-color') || window.getComputedStyle(selected[idx]).backgroundColor;
        háttérSzínMódosítás(firstColor);
        idx = (idx + 1) % selected.length;

        clearInterval(szín_Intervallum);
        szín_Intervallum = setInterval(() => {
            const current = selected[idx];
            const sz = current.getAttribute('data-color') || window.getComputedStyle(current).backgroundColor;
            háttérSzínMódosítás(sz);
            idx = (idx + 1) % selected.length;
        }, intervalMs);
    });
}

if (szinStopBtn) {
    szinStopBtn.addEventListener('click', () => {
        if (szín_Intervallum) {
            clearInterval(szín_Intervallum);
            szín_Intervallum = null;
        }
        szinStopBtn.disabled = true;
        szinStartBtn.disabled = document.querySelectorAll('.color-dot.selected').length === 0;
        szín_Körök.forEach(k => k.classList.remove('disabled'));
    });
}

// Manual step button: change to next selected color only when pressed
if (szinKovBtn) {
    szinKovBtn.addEventListener('click', () => {
        const selected = Array.from(document.querySelectorAll('.color-dot.selected'));
        if (selected.length === 0) return;
        // ensure index wraps and is within current selection
        szinManualIndex = szinManualIndex % selected.length;
        const el = selected[szinManualIndex];
        const sz = el.getAttribute('data-color') || window.getComputedStyle(el).backgroundColor;
        háttérSzínMódosítás(sz);
        szinManualIndex = (szinManualIndex + 1) % selected.length;
    });
}

// Reset manual index when selection changes
szín_Körök.forEach(kör => {
    kör.addEventListener('click', () => {
        szinManualIndex = 0;
    });
});

const témáGombok = document.querySelectorAll('.tema-gomb');
témáGombok.forEach(gomb => {
    gomb.addEventListener('click', () => {
        const témaNév = gomb.getAttribute('data-tema');
        témáAtVált(témaNév);
    });
});
