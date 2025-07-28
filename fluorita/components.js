document.addEventListener("DOMContentLoaded", function () {
  // Datos de sincronización de marcador de posición. Reemplazar con datos reales.
  const syncData = {
    1: [{ word: "Audio", time: 0.5 }, { word: "no", time: 1.0 }, { word: "sincronizado", time: 1.5 }],
    2: [{ word: "Audio", time: 0.5 }, { word: "no", time: 1.0 }, { word: "sincronizado", time: 1.5 }],
    3: [{ word: "Audio", time: 0.5 }, { word: "no", time: 1.0 }, { word: "sincronizado", time: 1.5 }]
  };

  var camera = document.querySelector("#camera");
  var grupo = document.querySelector("#grupo");
  var isZoomedIn = false;
  var activePoint = null;

  // Crear los elementos de audio para fluorita
  var audios = {
    1: new Audio('assets/audio/audio-3.mp3'), // Asignación de ejemplo
    2: new Audio('assets/audio/audio2.m4a'),   // Asignación de ejemplo
    3: new Audio('assets/audio/audio3.mp3')    // Asignación de ejemplo
  };

  // Función para preparar el texto con palabras individuales
  function prepareText(cardNumber) {
    const container = document.getElementById(`lyrics-${cardNumber}`);
    if (!container) return;
    const p = container.querySelector('.translatable');
    if (p) {
      const text = p.textContent.trim();
      p.innerHTML = text.split(/\s+/).map(word => `<span class="word">${word}</span>`).join(' ');
    }
  }

  [1, 2, 3].forEach(prepareText);

  var cards = {
    'click-point-1': document.getElementById("info-card-1"),
    'click-point-2': document.getElementById("info-card-2"),
    'click-point-3': document.getElementById("info-card-3")
  };

  Object.keys(cards).forEach((pointId, index) => {
    const cardNumber = index + 1;
    const audio = audios[cardNumber];
    if (!audio) return;

    const playBtn = document.getElementById(`play-${cardNumber}`);
    const pauseBtn = document.getElementById(`pause-${cardNumber}`);
    const repeatBtn = document.getElementById(`repeat-${cardNumber}`);
    const backBtn = document.getElementById(`back-${cardNumber}`);
    let highlightInterval;

    function updateHighlight() {
      const currentTime = audio.currentTime;
      const container = document.getElementById(`lyrics-${cardNumber}`);
      if (!container) return;
      const words = container.getElementsByClassName('word');
      const sync = syncData[cardNumber];
      if (!sync) return;

      Array.from(words).forEach(wordSpan => wordSpan.classList.remove('active'));

      const currentWordIndex = sync.findIndex((entry, i) => 
          currentTime >= entry.time && (sync[i + 1] ? currentTime < sync[i + 1].time : true)
      );

      if (currentWordIndex !== -1 && words[currentWordIndex]) {
        words[currentWordIndex].classList.add('active');
      }
    }

    const stopAudio = () => {
      audio.pause();
      audio.currentTime = 0;
      clearInterval(highlightInterval);
      const container = document.getElementById(`lyrics-${cardNumber}`);
      if (container) {
          Array.from(container.getElementsByClassName('word')).forEach(w => w.classList.remove('active'));
      }
    };

    if (playBtn) playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.play();
      highlightInterval = setInterval(updateHighlight, 100);
    });
    if (pauseBtn) pauseBtn.addEventListener('click', (e) => { e.stopPropagation(); audio.pause(); clearInterval(highlightInterval); });
    if (repeatBtn) repeatBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.currentTime = 0;
      audio.play();
      highlightInterval = setInterval(updateHighlight, 100);
    });
    if (backBtn) backBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      stopAudio();
      if (activePoint) activePoint.dispatchEvent(new Event('click'));
    });

    audio.addEventListener('ended', stopAudio);
  });

  Object.values(cards).forEach(card => {
    if (card) card.style.display = "none";
  });

  document.querySelectorAll("[id^='click-point']").forEach((point) => {
    point.addEventListener("click", function () {
      var targetPosition = new THREE.Vector3();
      point.object3D.getWorldPosition(targetPosition);

      if (isZoomedIn && activePoint === point) {
        anime({ targets: camera.object3D.position, x: 0, y: 1.5, z: 4, duration: 1000, easing: "easeInOutQuad" });
        const cardNumber = point.id.split('-')[2];
        if (audios[cardNumber]) audios[cardNumber].pause();
        const activeCard = cards[point.id];
        if (activeCard) {
          anime({ targets: activeCard, opacity: [1, 0], scale: [1, 0.9], duration: 500, easing: "easeInOutQuad", complete: () => { activeCard.style.display = "none"; } });
        }
        isZoomedIn = false;
        activePoint = null;
      } else {
        if (activePoint) {
          const prevCardNumber = activePoint.id.split('-')[2];
          if (audios[prevCardNumber]) audios[prevCardNumber].pause();
        }

        Object.values(cards).forEach(c => { if(c) c.style.display = "none"; });

        var zoomDistance = 1.2;
        var direction = new THREE.Vector3().subVectors(targetPosition, camera.object3D.position).normalize();
        anime({ targets: camera.object3D.position, x: targetPosition.x - direction.x * zoomDistance, y: targetPosition.y - direction.y * zoomDistance, z: targetPosition.z - direction.z * zoomDistance, duration: 1000, easing: "easeInOutQuad" });

        const card = cards[point.id];
        if (card) {
          card.style.display = "block";
          anime({ targets: card, opacity: [0, 1], scale: [0.9, 1], duration: 500, easing: "easeOutQuad" });
        }
        isZoomedIn = true;
        activePoint = point;
      }
    });
  });

  let isDragging = false, startMouseX = 0, startMouseY = 0, currentRotationX = 0, currentRotationY = 0;

  function startDrag(x, y) {
      if (isZoomedIn) return;
      isDragging = true;
      startMouseX = x;
      startMouseY = y;
  }

  function drag(x, y) {
      if (!isDragging) return;
      const deltaX = x - startMouseX;
      const deltaY = y - startMouseY;
      currentRotationY += deltaX * 0.01;
      currentRotationX -= deltaY * 0.01;
      grupo.object3D.rotation.y = currentRotationY;
      grupo.object3D.rotation.x = currentRotationX;
      startMouseX = x;
      startMouseY = y;
  }

  function endDrag() {
      isDragging = false;
  }

  document.addEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY));
  document.addEventListener("mousemove", (e) => drag(e.clientX, e.clientY));
  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchstart", (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY));
  document.addEventListener("touchmove", (e) => drag(e.touches[0].clientX, e.touches[0].clientY));
  document.addEventListener("touchend", endDrag);

  document.addEventListener("wheel", (e) => { if (isZoomedIn) e.preventDefault(); }, { passive: false });
});
