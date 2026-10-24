# CASA - Respaldo del proyecto editable

Este directorio conserva los archivos necesarios encontrados para continuar el proyecto de cartón. El respaldo se preparó sin modificar los archivos de origen.

## Contenido

- Proyecto/Casa/: escenas Blender, casa.spp, FBX, mapas exportados y renders.
- Proyecto/casa texturas/: texturas originales, incluidos los mapas EXR de la tela.
- Proyecto/Carton_corrugado.spp: proyecto editable del cartón en Substance Painter.
- Proyecto/Casa.fbx y carton.fbx: mallas de origen disponibles.
- Proyecto/papel_*.png, corrugado.jpg y la textura de cartón: fuentes externas utilizadas.
- Dependencias/geometry_nodes_essentials.blend: biblioteca de nodos de Blender referenciada por las escenas.
- manifest.json: inventario, origen, tamaño y SHA-256 de cada archivo respaldado.

Se conservan las escenas Casa.blend, Casas_y_paisaje_reconstruido.blend y protafolio/Casa original.blend. protafolio/Wireframe.blend es una copia exacta de Wireframe.blend1, porque el archivo Wireframe.blend original ya no estaba en Descargas al preparar este respaldo. Se omitieron las otras copias automáticas .blend1 para evitar duplicados.

## Recuperar los archivos reales

Los binarios de esta carpeta se guardan con Git LFS. Instala Git y Git LFS y utiliza:

    git lfs install
    git clone https://github.com/bosco45/portafolio_Work.git
    cd portafolio_Work
    git lfs pull --include="Casa/**"

Verifica que los .blend y .spp tengan su tamaño real, indicado en manifest.json. Un archivo de texto que empieza con "version https://git-lfs.github.com/spec/v1" es un puntero, no el proyecto descargado.

Abre las escenas con Blender 5.1 o una versión compatible y los .spp con Substance 3D Painter. Mantén juntos los directorios de Proyecto. Algunas rutas guardadas en las escenas son rutas antiguas de Windows; si Blender pide una textura externa, busca dentro de Proyecto. Si pide la biblioteca geometry_nodes_essentials.blend, la copia está en Dependencias.

## Archivo que ya faltaba antes del respaldo

No se encontró Casa/Albol/DefaultMaterial_Normal.png (mapa normal del árbol). También falta en las escenas y copias anteriores revisadas. Se conserva el proyecto tal como estaba y no se sustituye ese mapa por una textura diferente. El resto de las texturas de ese material está incluido; numerosas imágenes también están empaquetadas dentro de las escenas Blender.

## Comprobación y conservación

Cada archivo copiado se verificó contra el original con SHA-256. El usuario solicitó eliminar las copias locales de este proyecto y sus cachés únicamente después de completar la subida y verificar una descarga independiente de todos los objetos desde GitHub. El respaldo remoto se conserva.

Documentación: [descargar archivos de Git LFS](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage), [cuotas de Git LFS](https://docs.github.com/en/billing/concepts/product-billing/git-lfs).
