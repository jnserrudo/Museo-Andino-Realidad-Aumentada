document.addEventListener("DOMContentLoaded", function () {
    let currentLang = "es"; // Idioma por defecto
    const button = document.getElementById("language-toggle");
    const translatableElements = document.querySelectorAll(".translatable");

    button.addEventListener("click", function () {
        currentLang = currentLang === "es" ? "en" : "es"; // Alternar idioma
        console.log('clickeado')
        // Cambiar el texto de cada elemento
        translatableElements.forEach(el => {
            el.textContent = el.getAttribute(`data-${currentLang}`);
        });

        // Cambiar el texto del botón
        button.textContent = currentLang === "es" ? "English" : "Español";
    });
});
