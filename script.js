function kitöltés(n, d = 2) { 
    return n.toString().padStart(d, '0'); 
}

let visszaszámláló_Intervallum = null;

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
    document.getElementById('perc').value = '0';
    document.getElementById('mp').value = '0';
}

let edzés_Intervallum = null;
let edzés_Másodpercek = 30;
const edzés_Kijelző = document.getElementById('idozito_display').querySelector('p');
const edzés_ÁllapotKijelző = document.getElementById('edzes_display');

const edzések = [
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
    const terv = edzések[edzés_AktuálisTerv];
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
        
        const terv = edzések[edzés_AktuálisTerv];
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
            
            const terv = edzések[edzés_AktuálisTerv];
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
    
    const terv = edzések[edzés_AktuálisTerv];
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

const témáGombok = document.querySelectorAll('.tema-gomb');
témáGombok.forEach(gomb => {
    gomb.addEventListener('click', () => {
        const témaNév = gomb.getAttribute('data-tema');
        témáAtVált(témaNév);
    });
});
