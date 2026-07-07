// Contenedores del HTML
const pokedexGrid = document.getElementById('pokedex-grid');
const searchInput = document.getElementById('search-input');

let listaPokemon = []; // Guardará los datos cargados del JSON

// Función principal para leer el archivo JSON automáticamente
async function cargarPokedex() {
  try {
    // Busca el archivo de datos local
    const respuesta = await fetch('data.json');
    listaPokemon = await respuesta.json();
    
    // Renderiza todos los Pokémon al iniciar
    mostrarPokemon(listaPokemon);
  } catch (error) {
    console.error('Error cargando la base de datos de la Pokédex:', error);
    pokedexGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:red;">No se pudo cargar la Pokédex. Asegúrate de usar un servidor local.</p>`;
  }
}

// Función para renderizar las tarjetas en la página
function mostrarPokemon(pokemonFiltrados) {
  pokedexGrid.innerHTML = ''; // Limpiar la rejilla antes de dibujar

  pokemonFiltrados.forEach(poke => {
    // Generar la ruta de la imagen usando de forma automática su ID específico
    const rutaImagen = `images/${poke.id}.png`;

    // Crear el contenedor de la tarjeta
    const tarjeta = document.createElement('div');
    tarjeta.className = 'pokemon-card';

    // Crear los badges de los tipos
    const badgesTipos = poke.types.map(tipo => 
      `<span class="type-badge ${tipo.toLowerCase()}">${tipo}</span>`
    ).join('');

    // Calcular porcentajes para las barras de stats (asumiendo un máx estándar de 150 para diseño básico)
    const calcularAnchoBarra = (val) => Math.min((val / 150) * 100, 100);

    // Inyectar el HTML interno de la tarjeta con los datos del JSON
    tarjeta.innerHTML = `
      <div class="sprite-container">
        <img class="pokemon-img" src="${rutaImagen}" alt="${poke.name}" onerror="this.src='https://via.placeholder.com/150?text=Sin+Foto'">
      </div>
      <h2 class="pokemon-name">${poke.name}</h2>
      <div class="types-container">
        ${badgesTipos}
      </div>
      <p class="pokemon-desc">${poke.description}</p>
      
      <div class="stats-container">
        <div class="stat-row"><span class="stat-name">HP</span><span class="stat-value">${poke.stats.hp}</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${calcularAnchoBarra(poke.stats.hp)}%"></div></div></div>
        <div class="stat-row"><span class="stat-name">ATK</span><span class="stat-value">${poke.stats.atk}</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${calcularAnchoBarra(poke.stats.atk)}%"></div></div></div>
        <div class="stat-row"><span class="stat-name">DEF</span><span class="stat-value">${poke.stats.def}</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${calcularAnchoBarra(poke.stats.def)}%"></div></div></div>
        <div class="stat-row"><span class="stat-name">S.ATK</span><span class="stat-value">${poke.stats.spAtk}</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${calcularAnchoBarra(poke.stats.spAtk)}%; background-color:#ff6b6b;"></div></div></div>
        <div class="stat-row"><span class="stat-name">S.DEF</span><span class="stat-value">${poke.stats.spDef}</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${calcularAnchoBarra(poke.stats.spDef)}%; background-color:#ff6b6b;"></div></div></div>
        <div class="stat-row"><span class="stat-name">SPD</span><span class="stat-value">${poke.stats.spd}</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${calcularAnchoBarra(poke.stats.spd)}%; background-color:#cc5de8;"></div></div></div>
      </div>
    `;

    pokedexGrid.appendChild(tarjeta);
  });
}

// Lógica del Buscador en tiempo real
searchInput.addEventListener('input', (e) => {
  const busqueda = e.target.value.toLowerCase();
  
  const filtrados = listaPokemon.filter(poke => {
    const coincideNombre = poke.name.toLowerCase().includes(busqueda);
    const coincideTipo = poke.types.some(tipo => tipo.toLowerCase().includes(busqueda));
    return coincideNombre || coincideTipo;
  });

  mostrarPokemon(filtrados);
});

// Iniciar la aplicación al cargar la página
cargarPokedex();
