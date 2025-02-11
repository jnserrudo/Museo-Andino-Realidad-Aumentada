document.addEventListener("DOMContentLoaded", function () {
  var camera = document.querySelector("#camera");
  var grupo = document.querySelector("#grupo");
  var cursor = document.querySelector("[cursor]");
  var isZoomedIn = false;
  var activePoint = null;
  
  // Crear los elementos de audio
  var audios = {
    1: new Audio('assets/audio/Dale-Don-Dale.mp3'),
    2: new Audio('assets/audio/El-Diablo-de-Humahuaca.mp3'),
    3: new Audio('assets/audio/audio-3.mp3')
  };
 // Establece el volumen al máximo
  // Datos de sincronización para cada audio (timestamps en segundos)
  const syncData = {
    1: [
      //{ word: "Esta", time: 1 },
      //{ word: "es", time: 1.5 },
      //{ word: "una", time: 2 },
      //{ word: "tarjeta", time: 2.5 },
      //{ word: "de", time: 3 },
      //{ word: "información", time: 3.5 },
      //{ word: "simple", time: 4 },
      //{ word: "Incluye", time: 5 },
      //{ word: "bordes", time: 5.5 },
      //{ word: "negros", time: 6 },
      //{ word: "y", time: 6.5 },
      //{ word: "un", time: 7 },
      //{ word: "diseño", time: 7.5 },
      //{ word: "minimalista", time: 8 }
    ],
    2: [
      
    ],
    3: [
      { word: "El", time: 0 },
      { word: "cuarzo", time: 0.2 },
      { word: "es", time: 0.5 },
      { word: "un", time: 0.9 },
      { word: "mineral", time: 1.3 },
      { word: "compuesto", time: 1.5 },
      { word: "de", time: 1.6 },
      { word: "sílice", time: 1.9 },
      { word: "(SiO2).", time: 2.3 },
      { word: "Tras", time: 4.2 },
      { word: "el", time: 4.6 },
      { word: "feldespato", time: 5.2 },
      { word: "es", time: 5.8 },
      { word: "el", time: 6.2 },
      { word: "mineral", time: 6.6 },
      { word: "más", time: 7 },
      { word: "común", time: 7.4 },
      { word: "de", time: 7.8 },
      { word: "la", time: 8 },
      { word: "corteza", time: 8.4 },
      { word: "terrestre", time: 8.8 },
      { word: "estando", time: 9.2 },
      { word: "presente", time: 9.6 },
      { word: "en", time: 10 },
      { word: "una", time: 10.4 },
      { word: "gran", time: 10.8 },
      { word: "cantidad", time: 11.2 },
      { word: "de", time: 11.6 },
      { word: "rocas", time: 12 },
      { word: "igneas", time: 12.4 },
      { word: "metamorficas", time: 12.8 },
      { word: "y", time: 13.2 },
      { word: "sedimentarias", time: 13.6 },
    ]
    //El cuarzo es un mineral compuesto de sílice (SiO2). 
    // Tras el feldespato, es el mineral más común de la 
    // corteza terrestre estando presente en una gran cantidad de 
    // rocas ígneas, metamórficas y sedimentarias. 
  };

  // Función para preparar el texto con palabras individuales
  function prepareText(cardNumber) {
    const container = document.getElementById(`lyrics-${cardNumber}`);
    if (!container) return;

    const paragraphs = container.getElementsByTagName('p');
    Array.from(paragraphs).forEach(p => {
      const words = p.textContent.split(' ');
      p.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');
    });
  }

  // Preparar todos los textos
  [1, 2, 3].forEach(prepareText);

  // Get all cards
  var cards = {
    'click-point-1': document.getElementById("info-card-1"),
    'click-point-2': document.getElementById("info-card-2"),
    'click-point-3': document.getElementById("info-card-3")
  };

  // Configurar controles de audio para cada tarjeta
  Object.keys(cards).forEach((pointId, index) => {
    const cardNumber = index + 1;
    const audio = audios[cardNumber];

    // Asegurarse de que el audio exista
    if (audio) {
      const playBtn = document.getElementById(`play-${cardNumber}`);
      const pauseBtn = document.getElementById(`pause-${cardNumber}`);
      const repeatBtn = document.getElementById(`repeat-${cardNumber}`);
      const backBtn = document.getElementById(`back-${cardNumber}`);

      // Función para actualizar las palabras resaltadas
      function updateHighlight() {
        const currentTime = audio.currentTime;
        const container = document.getElementById(`lyrics-${cardNumber}`);
        if (!container) return;
      
        const words = container.getElementsByClassName('word');
        const sync = syncData[cardNumber];
      
        if (!sync) return;
      
        // Limpiar resaltado de todas las palabras
        Array.from(words).forEach(wordSpan => wordSpan.classList.remove('active'));
      
        // Buscar la palabra correcta por su índice en lugar de solo su texto
        const currentWordIndex = sync.findIndex(entry => currentTime >= entry.time && 
          (sync[sync.indexOf(entry) + 1] ? currentTime < sync[sync.indexOf(entry) + 1].time : true)
        );
      
        if (currentWordIndex !== -1 && words[currentWordIndex]) {
          words[currentWordIndex].classList.add('active');
        }
      }
      

      // Actualizar el resaltado cada 100ms durante la reproducción
      let highlightInterval;

      // Play button
      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log(`Iniciando reproducción para tarjeta ${cardNumber}`);
          audio.play();
          clearInterval(highlightInterval); // Limpiar intervalo anterior si existe
          highlightInterval = setInterval(updateHighlight, 100);
        });
      }

      // Pause button
      if (pauseBtn) {
        pauseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          audio.pause();
          clearInterval(highlightInterval);
        });
      }

      // Repeat button
      if (repeatBtn) {
        repeatBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          audio.currentTime = 0;
          audio.play();
          clearInterval(highlightInterval);
          highlightInterval = setInterval(updateHighlight, 100);
        });
      }

      // Back button
      if (backBtn) {
        backBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          audio.pause();
          audio.currentTime = 0;
          clearInterval(highlightInterval);
          // Limpiar resaltado
          const container = document.getElementById(`lyrics-${cardNumber}`);
          if (container) {
            const words = container.getElementsByClassName('word');
            Array.from(words).forEach(wordSpan => {
              wordSpan.classList.remove('active');
            });
          }
          // Simular clic en el punto activo para volver
          if (activePoint) {
            activePoint.dispatchEvent(new Event('click'));
          }
        });
      }

      // Detener el resaltado cuando termina el audio
      audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        clearInterval(highlightInterval);
        const container = document.getElementById(`lyrics-${cardNumber}`);
        if (container) {
          const words = container.getElementsByClassName('word');
          Array.from(words).forEach(wordSpan => {
            wordSpan.classList.remove('active');
          });
        }
      });
    }
  });

  // Hide all cards initially
  Object.values(cards).forEach(card => {
    if (card) card.style.display = "none";
  });

  var points = document.querySelectorAll("[id^='click-point']");

  points.forEach((point) => {
    point.addEventListener("click", function () {
      var targetPosition = new THREE.Vector3();
      point.object3D.getWorldPosition(targetPosition);

      if (isZoomedIn && activePoint === point) {
        // Salir del zoom y ocultar la tarjeta
        anime({
          targets: camera.object3D.position,
          x: 0,
          y: 1.6,
          z: 4,
          duration: 1000,
          easing: "easeInOutQuad",
        });

        // Detener el audio y ocultar la tarjeta activa
        const cardNumber = point.id.split('-')[2];
        if (audios[cardNumber]) {
          audios[cardNumber].pause();
          audios[cardNumber].currentTime = 0;
        }

        const activeCard = cards[point.id];
        if (activeCard) {
          anime({
            targets: activeCard,
            opacity: [1, 0],
            scale: [1, 0.9],
            duration: 500,
            easing: "easeInOutQuad",
            complete: function() {
              activeCard.style.display = "none";
            }
          });
        }

        isZoomedIn = false;
        activePoint = null;
      } else {
        // Detener el audio anterior si existe
        if (activePoint) {
          const prevCardNumber = activePoint.id.split('-')[2];
          if (audios[prevCardNumber]) {
            audios[prevCardNumber].pause();
            audios[prevCardNumber].currentTime = 0;
          }
        }

        // Ocultar todas las tarjetas primero
        Object.values(cards).forEach(card => {
          if (card) card.style.display = "none";
        });

        // Zoom al punto seleccionado
        var zoomDistance = 1.2;
        var direction = new THREE.Vector3()
          .subVectors(targetPosition, camera.object3D.position)
          .normalize();

        anime({
          targets: camera.object3D.position,
          x: targetPosition.x - direction.x * zoomDistance,
          y: targetPosition.y - direction.y * zoomDistance,
          z: targetPosition.z - direction.z * zoomDistance,
          duration: 1000,
          easing: "easeInOutQuad",
        });

        // Mostrar la tarjeta correspondiente
        const card = cards[point.id];
        if (card) {
          card.style.display = "block";
          anime({
            targets: card,
            opacity: [0, 1],
            scale: [0.9, 1],
            duration: 500,
            easing: "easeOutQuad"
          });
        }

        isZoomedIn = true;
        activePoint = point;
      }
    });

    // Cambiar color del cursor
    point.addEventListener("mouseenter", function () {
      cursor.setAttribute("material", "color", "red");
    });

    point.addEventListener("mouseleave", function () {
      cursor.setAttribute("material", "color", "black");
    });
  });

  // Rotación del modelo con mouse
  var isDragging = false;
  var startMouseX = 0;
  var startMouseY = 0;
  var currentRotationX = 0;
  var currentRotationY = 0;

  document.addEventListener("mousedown", function (event) {
    if (!isZoomedIn) {
      isDragging = true;
      startMouseX = event.clientX;
      startMouseY = event.clientY;
    }
  });

  document.addEventListener("mousemove", function (event) {
    if (isDragging) {
      var deltaX = event.clientX - startMouseX;
      var deltaY = event.clientY - startMouseY;
      var rotationSpeed = 0.5;

      currentRotationY += deltaX * rotationSpeed * 0.01;
      currentRotationX -= deltaY * rotationSpeed * 0.01;

      grupo.object3D.rotation.y = currentRotationY;
      grupo.object3D.rotation.x = currentRotationX;

      startMouseX = event.clientX;
      startMouseY = event.clientY;
    }
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
  });

  // Soporte para dispositivos móviles
  document.addEventListener("touchstart", function (event) {
    if (!isZoomedIn) {
      isDragging = true;
      startMouseX = event.touches[0].clientX;
      startMouseY = event.touches[0].clientY;
    }
  });

  document.addEventListener("touchmove", function (event) {
    if (isDragging) {
      var deltaX = event.touches[0].clientX - startMouseX;
      var deltaY = event.touches[0].clientY - startMouseY;
      var rotationSpeed = 0.5;

      currentRotationY += deltaX * rotationSpeed * 0.01;
      currentRotationX -= deltaY * rotationSpeed * 0.01;

      grupo.object3D.rotation.y = currentRotationY;
      grupo.object3D.rotation.x = currentRotationX;

      startMouseX = event.touches[0].clientX;
      startMouseY = event.touches[0].clientY;
    }
  });

  document.addEventListener("touchend", function () {
    isDragging = false;
  });

  // Deshabilitar scroll mientras hace zoom
  document.addEventListener("wheel", function (event) {
    if (isZoomedIn) event.preventDefault();
  });
});
