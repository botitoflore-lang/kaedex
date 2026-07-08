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
 */
async function cargarPokedex() {
  try {
    const respuesta = await fetch('./data.json');
    const datosSucios = await respuesta.json();
    
    // MEJORA: Ordena automáticamente la lista por número de menor a mayor antes de guardarla
    listaPokemon = datosSucios.sort((a, b) => {
      return parseInt(a.number) - parseInt(b.number);
    });
    
    // Renderiza la lista ya ordenada
    mostrarPokemon(listaPokemon);
  } catch (error) {
    console.error('Error al cargar la Pokédex:', error);
    pokedexGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; color:#e63946; padding:40px;">
        <i class="fas fa-exclamation-triangle" style="font-size:2rem; margin-bottom:10px;"></i>
        <p>No se pudo cargar la Pokédex. Revisa que tu archivo data.json esté bien estructurado.</p>
      </div>
    `;
  }
}

/**
 * Se encarga de dibujar las tarjetas de los Pokémon en la rejilla principal.
 */
function mostrarPokemon(pokemonFiltrados) {
  pokedexGrid.innerHTML = ''; 

  pokemonFiltrados.forEach(poke => {
    const rutaImagen = `./images/${poke.id}.png`;
    const tarjeta = document.createElement('div');
    tarjeta.className = 'pokemon-card';

    const badgesTipos = poke.types.map(tipo => 
      `<span class="type-badge ${tipo.toLowerCase()}">
        <i class="fas fa-magic"></i> 
        ${tipo}
      </span>`
    ).join('');

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

  configurarBotonesDetalles();
}

/**
 * Asigna el evento Click a los botones de detalles.
 */
function configurarBotonesDetalles() {
  const botones = document.querySelectorAll('.btn-detalles');
  botones.forEach(boton => {
    boton.addEventListener('click', () => {
      const pokemonId = boton.getAttribute('data-id');
      const pokemonSeleccionado = listaPokemon.find(p => p.id === pokemonId);
      
      if (pokemonSeleccionado) {
        abrirModalDetalles(pokemonSeleccionado);
      }
    });
  });
}

/**
 * Abre el Modal con la info completa.
 */
function abrirModalDetalles(poke) {
  const rutaImagen = `./images/${poke.id}.png`;
  
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

  // NUEVA ESTRUCTURA: Separa la cabecera en una fila (imagen + textos a la derecha)
  modalBody.innerHTML = `
    <div class="modal-detailed-body">
      <div class="modal-header-row">
        <img class="pokemon-img" src="${rutaImagen}" alt="${poke.name}" onerror="this.src='https://via.placeholder.com/200?text=Sin+Foto'">
        <div class="modal-info-meta">
          <span class="pokemon-number">#${poke.number}</span>
          <h2 class="pokemon-name">${poke.name}</h2>
          <p class="pokemon-title">${poke.title}</p>
        </div>
      </div>
      
      <!-- Caja gris contenedora para la descripción del Pokémon -->
      <p class="pokemon-desc">${poke.description}</p>
      
      <div class="stats-container">
        <h3>Estadísticas Base</h3>
        ${htmlStats}
      </div>
    </div>
  `;

  pokedexModal.classList.add('active');
}

// --- Listeners para cerrar el modal ---
modalClose.addEventListener('click', () => pokedexModal.classList.remove('active'));
pokedexModal.addEventListener('click', (e) => { if (e.target === pokedexModal) pokedexModal.classList.remove('active'); });

// --- MEJORA: Buscador Multicriterio (Nombre, Tipo y Número) ---
searchInput.addEventListener('input', (e) => {
  const busqueda = e.target.value.toLowerCase().trim();
  
  const filtrados = listaPokemon.filter(poke => {
    const coincideNombre = poke.name.toLowerCase().includes(busqueda);
    const coincideTipo   = poke.types.some(tipo => tipo.toLowerCase().includes(busqueda));
    const coincideNumero = poke.number.toString().includes(busqueda); // Busca por número (ej: "0471" o "471")
    
    return coincideNombre || coincideTipo || coincideNumero;
  });

  mostrarPokemon(filtrados);
});

// Arranca la app
cargarPokedex();
