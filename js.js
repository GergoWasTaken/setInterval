const perc = document.getElementById("perc");
const masodperc = document.getElementById("mp");
const idozito = document.getElementById("idozito");
const szamlalo = perc.innerText + ":" + masodperc.innerText;
szamlalo = parseInt(perc.innerText) * 60 + parseInt(masodperc.innerText);
setInterval(() => {
    szamlalo--;
    idozito.innerText += szamlalo;
}, 1000);