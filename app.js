const pokedexGrid = document.getElementById('pokedex-grid');
const searchInput = document.getElementById('search-input');

let listaPokemon = [];

async function cargarPokedex() {
  try {
    // 1. Busca el archivo local de base de datos
    const respuesta = await fetch('./data.json');
    listaPokemon = await respuesta.json();
    
    // 2. Renderiza todos los Pokémon al inicio
    mostrarPokemon(listaPokemon);
  } catch (error) {
    console.error('Error al cargar la Pokédex:', error);
    pokedexGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; color:#e63946; padding:40px;">
        <i class="fas fa-exclamation-triangle" style="font-size:2rem; margin-bottom:10px;"></i>
        <p>No se pudo cargar la Pokédex. Revisa data.json o las rutas.</p>
      </div>
    `;
  }
}

function mostrarPokemon(pokemonFiltrados) {
  pokedexGrid.innerHTML = ''; // Limpiar

  pokemonFiltrados.forEach(poke => {
    // Generar ruta de imagen relativa
    const rutaImagen = `./images/${poke.id}.png`;

    // Crear la tarjeta premium
    const tarjeta = document.createElement('div');
    tarjeta.className = 'pokemon-card';

    // Generar badges de tipo (con iconos genéricos para este ejemplo)
    const badgesTipos = poke.types.map(tipo => 
      `<span class="type-badge ${tipo.toLowerCase()}">
        <i class="fas fa-magic"></i> <!-- Icono genérico (como el de Psychic) -->
        ${tipo}
      </span>`
    ).join('');

    // --- Mapeo de Colores de Stats (Mismo estilo que image_0.png) ---
    const configStats = {
      hp:    { name: 'HP',       icon: 'fas fa-heart',    color: 'var(--stat-pink)',   max: 150 },
      atk:   { name: 'Atk',      icon: 'fas fa-shield',   color: 'var(--stat-yellow)', max: 150 }, // Amarillo Production
      def:   { name: 'Def',      icon: 'fas fa-shield-alt',color: 'var(--stat-pink)',   max: 150 },
      spAtk: { name: 'S.Atk',    icon: 'fas fa-bolt',     color: 'var(--stat-purple)', max: 180 }, // Morado SpAtk
      spDef: { name: 'S.Def',    icon: 'fas fa-magic',    color: 'var(--stat-teal)',   max: 180 }, // Teal SpDef
      spd:   { name: 'Speed',    icon: 'fas fa-running',  color: 'var(--stat-red)',    max: 150 }  // Rojo Speed
    };

    // Generar HTML detallado de estadísticas
    const htmlStats = Object.keys(configStats).map(key => {
      const stat = configStats[key];
      const valorValido = poke.stats[key] || 0;
      const porcentaje = Math.min((valorValido / stat.max) * 100, 100);
      
      return `
        <div class="stat-row">
          <div class="stat-icon" style="color: ${stat.color}">
            <i class="${stat.icon}"></i>
          </div>
          <div class="stat-bar-group">
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

    // Inyectar el HTML de la tarjeta premium (image_0.png)
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
      
      <!-- Botones de Acción (como en la referencia) -->
      <div class="action-buttons">
        <button class="main-btn">
          <i class="fas fa-home"></i> Ver más detalles
        </button>
        <button class="delete-btn">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;

    pokedexGrid.appendChild(tarjeta);
  });
}

// Buscador en tiempo real
searchInput.addEventListener('input', (e) => {
  const busqueda = e.target.value.toLowerCase();
  
  const filtrados = listaPokemon.filter(poke => {
    const coincideNombre = poke.name.toLowerCase().includes(busqueda);
    const coincideTipo = poke.types.some(tipo => tipo.toLowerCase().includes(busqueda));
    return coincideNombre || coincideTipo;
  });

  mostrarPokemon(filtrados);
});

cargarPokedex();
