
// Ejemplo conceptual de cómo JavaScript busca los archivos usando el nombre específico
async function cargarPokemon(nombreEspecifico) {
  try {
    // 1. Busca el archivo de estadísticas automáticamente
    const respuesta = await fetch(`./data/${nombreEspecifico}.json`);
    const datos = await respuesta.json();
    
    // 2. La ruta de la foto se genera sola usando el mismo nombre
    const rutaImagen = `./images/${nombreEspecifico}.png`;
    
    // 3. Aquí el código clona una tarjeta HTML y la inyecta en la pantalla
    crearTarjetaPokemon(datos, rutaImagen);
  } catch (error) {
    console.error("No se pudo cargar el Pokémon:", error);
  }
}
