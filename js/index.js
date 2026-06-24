// transforma colores HSL a Hex
function hslToHex(h, s, l) {
    l = l / 100;

    const a = (s * Math.min(l, 1 - l)) / 100;

    const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

        return Math.round(255 * color)
            .toString(16)
            .padStart(2, "0");
    };

    return "#" + f(0) + f(8) + f(4);
}

// Genera los colores aleatorios y devuelve los codigos en HSL y HEX
function generarColor() {
    const h = Math.round(Math.random() * 360);
    const s = Math.round(Math.random() * 100);
    const l = Math.round(Math.random() * 100);

    const hsl = `hsl(${h}, ${s}%, ${l}%)`;
    const hex = hslToHex(h, s, l);

    return { colorHSL: hsl, colorHex: hex };
}

// Estado global: guarda cada color y si está bloqueado o no
let paletaActual = [];

function crearSwatch(item, index) {
    const swatch = document.createElement("article");
    swatch.className = "swatch";

// Bloque superior: el rectángulo pintado de color
    const Color = document.createElement("div");
    Color.className = "swatch__color";
    Color.style.background = item.colorHSL;


// Contenedor de botonera 
const acciones = document.createElement("div");
acciones.className = "swatch__acciones";


// Botón de bloqueo
    const botonLock = document.createElement("button");
    botonLock.className = "swatch__lock";
    botonLock.textContent = item.locked ? "🔒" : "🔓";
    botonLock.setAttribute("aria-label", "Bloquear color");

    botonLock.addEventListener("click", function () {
    item.locked = !item.locked;
    botonLock.textContent = item.locked ? "🔒" : "🔓";
    swatch.classList.toggle("swatch--bloqueado", item.locked);
    });


// Botón de copiar
    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "📋";

    copyBtn.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(item.colorHex);
            copyBtn.textContent = "¡Copiado!";
            setTimeout(() => {
                copyBtn.textContent = "📋";
            }, 1500);
        } catch (err) {
            console.error("Error al copiar:", err);
        }
    });

    acciones.appendChild(botonLock);
    acciones.appendChild(copyBtn);

    Color.appendChild(acciones);

   
// Zona inferior: nombre + código
    const info = document.createElement("div");
    info.className = "swatch__info";

    const elNombre = document.createElement("p");
    elNombre.className = "swatch__nombre";
    elNombre.textContent = "Color " + (index + 1);

    const elCodigo = document.createElement("p");
    elCodigo.className = "swatch__codigo";
    elCodigo.textContent = item.colorHex + " - " + item.colorHSL;

    info.appendChild(elNombre);
    info.appendChild(elCodigo);

    swatch.appendChild(Color);
    swatch.appendChild(info);

    if (item.locked) {
        swatch.classList.add("swatch--bloqueado");
    }

    return swatch;

}
// Trae la galería
const galeria = document.getElementById("galeria");

// Al apretar el botón "Generar": los bloqueados se mantienen,
function generarPaleta(cantidad) {
    const nuevaPaleta = [];

    for (let i = 0; i < cantidad; i++) {
        const existente = paletaActual[i];

        if (existente && existente.locked) {
            nuevaPaleta.push(existente);
        } else {
            const color = generarColor();
            nuevaPaleta.push({ ...color, locked: false });
        }
    }

    paletaActual = nuevaPaleta;
    pintarPaleta();
}

// Agrega o quita swatches para llegar al nuevo tamaño.
   function ajustarCantidad(cantidad) {
    const bloqueados = paletaActual.filter((item) => item.locked);
    const noBloqueados = paletaActual.filter((item) => !item.locked);

    const nuevaPaleta = [];

 // Los bloqueados siempre se mantienen primero
    nuevaPaleta.push(...bloqueados);

 // Si hay espacio, reusamos los colores no bloqueados que ya existían
    let i = 0;
    while (nuevaPaleta.length < cantidad && i < noBloqueados.length) {
        nuevaPaleta.push(noBloqueados[i]);
        i++;
    }

// Si todavía falta para llegar a "cantidad", generamos colores nuevos
    while (nuevaPaleta.length < cantidad) {
        const color = generarColor();
        nuevaPaleta.push({ ...color, locked: false });
    }

// Si la cantidad de bloqueados supera la nueva cantidad, recortamos
    paletaActual = nuevaPaleta.slice(0, cantidad);
    pintarPaleta();
}

function pintarPaleta() {
    galeria.innerHTML = "";
    paletaActual.forEach((item, index) => {
    const swatch = crearSwatch(item, index);
    
    galeria.appendChild(swatch);
    });
}

const boton = document.getElementById("generar");
const selector = document.getElementById("cantidad");

if (boton) {
    boton.addEventListener("click", function () {
        const cantidad = Number(selector.value);
        generarPaleta(cantidad);
    });
} else {
    console.log("No se encontró el botón con id 'generar'");
}

selector.addEventListener("change", function () {
    ajustarCantidad(Number(selector.value));
});


generarPaleta(6);


//galeria de favoritas (#guardadas) !!!!!

// Busca las 3 cajas por su id
const cajas = ["caja1", "caja2", "caja3"];

function inicializarCaja(idCaja) {
    const caja = document.getElementById(idCaja);
    const input = caja.querySelector(".inputPegado");
    const botonMostrar = caja.querySelector(".botonMostrar");
    const botonQuitar = caja.querySelector(".botonQuitar");
    const colorDiv = caja.querySelector(".swatch__colorFav");

    // Conserva el color guardado
    const colorGuardado = localStorage.getItem(idCaja);
    if (colorGuardado) {
        input.value = colorGuardado;
        colorDiv.style.background = colorGuardado;
    }

    // Botón "Mostrar": pinta el color y lo guarda en localStorage
    botonMostrar.addEventListener("click", function () {
    const valor = input.value.trim();
        if (valor === "") {
        return;
        }

        colorDiv.style.background = valor;
        localStorage.setItem(idCaja, valor);
    });

    // Botón "Quitar"
    botonQuitar.addEventListener("click", function () {
        input.value = "";
        colorDiv.style.background = "transparent";
        localStorage.removeItem(idCaja);
    });
}

cajas.forEach(inicializarCaja);
