// --- Selectores del DOM (Contenedores HTML) ---
const pokedexGrid = document.getElementById('pokedex-grid');
const searchInput = document.getElementById('search-input');
const pokedexModal = document.getElementById('pokedex-modal');
const modalClose = document.getElementById('modal-close');
const modalBody = document.getElementById('modal-body');

// Lista global que almacenará los Pokémon cargados desde el JSON
let listaPokemon = [];

/**
 * Función principal que carga los datos de la Pokédex desde el archivo local JSON.
 * Se ejecuta automáticamente al abrir la página.
 */
async function cargarPokedex() {
  try {
    // Busca de forma relativa el archivo de datos (importante usar ./ para Vercel)
    const respuesta = await fetch('./data.json');
    listaPokemon = await respuesta.json();
    
    // Renderiza la lista completa de Pokémon en la pantalla al iniciar
    mostrarPokemon(listaPokemon);
  } catch (error) {
    console.error('Error al cargar la Pokédex:', error);
    pokedexGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; color:#e63946; padding:40px;">
        <i class="fas fa-exclamation-triangle" style="font-size:2rem; margin-bottom:10px;"></i>
        <p>No se pudo cargar la Pokédex. Revisa que tu archivo data.json esté en la raíz y todo en minúsculas.</p>
      </div>
    `;
  }
}

/**
 * Se encarga de dibujar las tarjetas de los Pokémon en la rejilla principal.
 * @param {Array} pokemonFiltrados - Lista de objetos Pokémon a mostrar
 */
function mostrarPokemon(pokemonFiltrados) {
  // Limpiar la rejilla antes de volver a dibujar (evita duplicados al buscar)
  pokedexGrid.innerHTML = ''; 

  pokemonFiltrados.forEach(poke => {
    // Generar de forma automática la ruta de la imagen usando su ID único
    const rutaImagen = `./images/${poke.id}.png`;

    // Crear el elemento contenedor de la tarjeta
    const tarjeta = document.createElement('div');
    tarjeta.className = 'pokemon-card';

    // Generar las etiquetas de tipos (badges) con un icono dinámico
    const badgesTipos = poke.types.map(tipo => 
      `<span class="type-badge ${tipo.toLowerCase()}">
        <i class="fas fa-magic"></i> 
        ${tipo}
      </span>`
    ).join('');

    // Configuración visual de las estadísticas base (Estilos e Iconos idénticos a tu referencia)
    const configStats = {
      hp:    { name: 'HP',       icon: 'fas fa-heart',    color: 'var(--stat-pink)',   max: 150 },
      atk:   { name: 'Atk',      icon: 'fas fa-shield',   color: 'var(--stat-yellow)', max: 150 }, // Amarillo Production
      def:   { name: 'Def',      icon: 'fas fa-shield-alt',color: 'var(--stat-pink)',   max: 150 },
      spAtk: { name: 'S.Atk',    icon: 'fas fa-bolt',     color: 'var(--stat-purple)', max: 180 }, // Morado SpAtk
      spDef: { name: 'S.Def',    icon: 'fas fa-magic',    color: 'var(--stat-teal)',   max: 180 }, // Teal SpDef
      spd:   { name: 'Speed',    icon: 'fas fa-running',  color: 'var(--stat-red)',    max: 150 }  // Rojo Speed
    };

    // Construir el bloque HTML de las barras de estadísticas mapeando los valores del JSON
    const htmlStats = Object.keys(configStats).map(key => {
      const stat = configStats[key];
      const valorValido = poke.stats[key] || 0;
      // Calcular porcentaje para el ancho de la barra gráfica
      const porcentaje = Math.min((valorValido / stat.max) * 100, 100);
      
      return `
        <div class="stat-row">
          <div class="stat-icon" style="color: ${stat.color}">
            <i class="${stat.icon}"></i>
          </div>
          <div class="stat-bar-group" style="width:100%">
            <div class="stat-value-pair">
              <span class="stat-name">${stat.name}</span>
              <span class="stat-value" style="color: ${stat.color}">${valorValido}</span>
            </div>
            <div class="stat-bar-wrapper">
              <div class="stat-bar-bg">
                <div class="stat-bar-fill" style="width: ${porcentaje}%; background-color: ${stat.color};"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Inyectar toda la estructura HTML estructurada dentro de la tarjeta
    // Nota: El botón guarda el id en 'data-id' para saber cuál Pokémon debe abrir en el modal
    tarjeta.innerHTML = `
      <div class="sprite-container">
        <img class="pokemon-img" src="${rutaImagen}" alt="${poke.name}" onerror="this.src='https://via.placeholder.com/200?text=Sin+Foto'">
      </div>
      
      <div class="details-section">
        <div class="poke-num-name">
          <span class="pokemon-number">#${poke.number}</span>
          <h2 class="pokemon-name">${poke.name}</h2>
          <span class="edit-icon" style="color: var(--text-muted); cursor:pointer;"><i class="fas fa-pencil-alt"></i></span>
        </div>
        
        <p class="pokemon-title">${poke.title}</p>
        
        <div class="types-container">
          ${badgesTipos}
        </div>
        
        <p class="pokemon-desc">${poke.description}</p>
        
        <div class="stats-container">
          ${htmlStats}
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="main-btn btn-detalles" data-id="${poke.id}">
          <i class="fas fa-home"></i> Ver más detalles
        </button>
        <button class="delete-btn">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;

    pokedexGrid.appendChild(tarjeta);
  });

  // Una vez creadas las tarjetas en el DOM, activamos los listeners en sus respectivos botones
  configurarBotonesDetalles();
}

/**
 * Busca todos los botones de "Ver más detalles" renderizados y les asigna el evento Click.
 */
function configurarBotonesDetalles() {
  const botones = document.querySelectorAll('.btn-detalles');
  botones.forEach(boton => {
    boton.addEventListener('click', () => {
      const pokemonId = boton.getAttribute('data-id');
      // Busca el objeto Pokémon completo que coincida con el data-id del botón pulsado
      const pokemonSeleccionado = listaPokemon.find(p => p.id === pokemonId);
      
      if (pokemonSeleccionado) {
        abrirModalDetalles(pokemonSeleccionado);
      }
    });
  });
}

/**
 * Genera el contenido interno ampliado del Pokémon seleccionado y despliega el Modal.
 * @param {Object} poke - Objeto con los datos del Pokémon a detallar
 */
function abrirModalDetalles(poke) {
  const rutaImagen = `./images/${poke.id}.png`;
  
  // Reutilizamos la misma estructura de estadísticas para mantener la coherencia de diseño
  const configStats = {
    hp:    { name: 'HP',       icon: 'fas fa-heart',    color: 'var(--stat-pink)',   max: 150 },
    atk:   { name: 'Atk',      icon: 'fas fa-shield',   color: 'var(--stat-yellow)', max: 150 },
    def:   { name: 'Def',      icon: 'fas fa-shield-alt',color: 'var(--stat-pink)',   max: 150 },
    spAtk: { name: 'S.Atk',    icon: 'fas fa-bolt',     color: 'var(--stat-purple)', max: 180 },
    spDef: { name: 'S.Def',    icon: 'fas fa-magic',    color: 'var(--stat-teal)',   max: 180 },
    spd:   { name: 'Speed',    icon: 'fas fa-running',  color: 'var(--stat-red)',    max: 150 }
  };

  const htmlStats = Object.keys(configStats).map(key => {
    const stat = configStats[key];
    const valorValido = poke.stats[key] || 0;
    const porcentaje = Math.min((valorValido / stat.max) * 100, 100);
    return `
      <div class="stat-row">
        <div class="stat-icon" style="color: ${stat.color}"><i class="${stat.icon}"></i></div>
        <div class="stat-bar-group" style="width:100%">
          <div class="stat-value-pair"><span class="stat-name">${stat.name}</span><span class="stat-value" style="color: ${stat.color}">${valorValido}</span></div>
          <div class="stat-bar-wrapper"><div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${porcentaje}%; background-color: ${stat.color};"></div></div></div>
        </div>
      </div>
    `;
  }).join('');

  // Modificamos el contenido dinámico del modal inyectando toda la info (aquí la descripción se muestra completa)
  modalBody.innerHTML = `
    <div class="modal-detailed-body">
      <img class="pokemon-img" src="${rutaImagen}" alt="${poke.name}" onerror="this.src='https://via.placeholder.com/200?text=Sin+Foto'">
      <div class="poke-num-name">
        <span class="pokemon-number">#${poke.number}</span>
        <h2 class="pokemon-name" style="font-size:1.8rem;">${poke.name}</h2>
      </div>
      <p class="pokemon-title" style="margin-top:-10px;">${poke.title}</p>
      
      <p class="pokemon-desc">${poke.description}</p>
      
      <div class="stats-container" style="width: 100%;">
        <h3 style="font-size:1rem; margin-bottom:15px; color: var(--text-main); text-transform:uppercase; letter-spacing:1px;">Estadísticas Base</h3>
        ${htmlStats}
      </div>
    </div>
  `;

  // Añade la clase active para activar las transiciones CSS y mostrar el modal flotante
  pokedexModal.classList.add('active');
}

// --- Listeners de Eventos para Controlar el Cierre del Modal ---

// Cierra el modal al pulsar el botón de la "X"
modalClose.addEventListener('click', () => {
  pokedexModal.classList.remove('active');
});

// Cierra el modal de forma sutil si el usuario hace clic en el fondo oscuro difuminado fuera de la caja
pokedexModal.addEventListener('click', (e) => {
  if (e.target === pokedexModal) {
    pokedexModal.classList.remove('active');
  }
});

// --- Controlador del Buscador en tiempo real ---
searchInput.addEventListener('input', (e) => {
  const busqueda = e.target.value.toLowerCase();
  
  // Filtra si la cadena ingresada coincide con el nombre o con alguno de los tipos del Pokémon
  const filtrados = listaPokemon.filter(poke => {
    const coincideNombre = poke.name.toLowerCase().includes(busqueda);
    const coincideTipo = poke.types.some(tipo => tipo.toLowerCase().includes(busqueda));
    return coincideNombre || coincideTipo;
  });

  // Vuelve a renderizar la cuadrícula únicamente con los Pokémon filtrados
  mostrarPokemon(filtrados);
});

// Inicializa la carga de datos automáticos en cuanto el archivo JS se lee
cargarPokedex();
