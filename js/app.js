function rättaLucktext() {

    const svar = document
        .getElementById("svar1")
        .value
        .trim()
        .toLowerCase();

    const resultat =
        document.getElementById("resultat");

    if (svar === "gick") {

        resultat.innerHTML =
            "<span class='rätt'>✅ Rätt svar!</span>";

    } else {

        resultat.innerHTML =
            "<span class='fel'>❌ Försök igen.</span>";

    }
}