<script>
  import { fade } from "svelte/transition";
  import { resetFiltersToDefault } from "../stores";

  const faqItems = [
    {
      question: "Jesu li prikazani filmovi i termini isti kao na cinestaru?",
      answer: "Da, podaci se povlače sa Cinestar API-ja.",
    },
    {
      question: "Koliko su točne informacije na ovoj web stranici?",
      answer:
        "Osnovni podaci, uključujući popis filmova, raspored prikazivanja i informacije o sjedalima, preuzimaju se sa službene web stranice Cinestar-a. Dodatni detalji poput liste glumaca, redatelja i ocjena dolaze sa Letterboxd-a. Može se dogoditi da program pronađe krivu Letterboxd stranicu za film, ali to se lako primjeti jer naslov filma i slika neće odgovarati.",
    },
    {
      question: "Koliko se često ažuriraju podaci na ovoj web stranici?",
      answer: "Svi podaci (Cinestar i Letterboxd) se ažuriraju jednom dnevno, u 00:30",
    },
    {
      question: "Zašto nema filmova nakon srijede?",
      answer:
        "Cinestar objavljuje novi raspored filmova svake srijede. Ako ih nema na ovoj stranici, nema ni na cinestaru.",
    },
    {
      question: "Kako se određuje raspored i dostupnost sjedala?",
      answer:
        "Rasporedi sjedala i informacije o dostupnosti preuzimaju se sa službene web stranice Cinestar-a. Informacije se preuzimaju tek kada stisnete na neko prikazivanje, tako da nisu zastarjele.",
    },
    {
      question: "Postoje li planovi za dodavanje novih značajki?",
      answer:
        "Da, budući planovi uključuju dodavanje mogućnosti da korisnici recenziraju filmove i razlikovanje različitih vrsta sjedala, poput ljubavnih sjedala, VIP sjedala, itd. Ako vi imate neku ideju, pošaljite ju na email.",
    },
  ];

  let selectedCardDesign = localStorage.getItem("movieCardDesign") || "v2";

  function changeCardDesign(design) {
    localStorage.setItem("movieCardDesign", design);
    selectedCardDesign = design;
  }

  let menuOpen = false;

  function toggleMenu() {
    menuOpen = !menuOpen;

    // prevent scrolling when menu is open
    if (menuOpen) {
      document.getElementById("content").style.display = "none";
    } else {
      document.getElementById("content").style.display = "flex";
    }
  }

  function copyEmailToClipboard() {
    const email = "r0pzrgabp@mozmail.com";
    navigator.clipboard.writeText(email);
  }

  function toggleFaqAnswer(e) {
    const faqItem = e.target.closest(".faqItem");
    const answer = faqItem.querySelector(".answer");
    const arrow = faqItem.querySelector("img");
    answer.classList.toggle("open");
    arrow.classList.toggle("open");
  }

  const transitionDuration = 150;
  const transitionDelay = 75;
</script>

<nav>
  <div>
    <img
      src="/images/logo.png"
      alt="Better CineStar logo"
      on:click={resetFiltersToDefault}
    />

    <div class="hamburger" class:open={menuOpen} on:click={toggleMenu}>
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
    </div>

    {#if menuOpen}
      <div class="menu">
        <section
          transition:fade={{ delay: transitionDelay * 1, duration: transitionDuration }}
        >
          <p class="title">Dizajn kartice filma</p>

          <div class="segmentedButton">
            <div
              class="option"
              class:selected={selectedCardDesign === "v1"}
              on:click={() => {
                changeCardDesign("v1");
              }}
            >
              <img src="/images/whiteCheckForMenu.svg" alt="checkmark" />
              <p>Stari</p>
            </div>
            <div
              class="option"
              class:selected={selectedCardDesign === "v2"}
              on:click={() => {
                changeCardDesign("v2");
              }}
            >
              <img src="/images/whiteCheckForMenu.svg" alt="checkmark" />
              <p>Novi</p>
            </div>
          </div>
        </section>

        <section
          transition:fade={{ delay: transitionDelay * 2, duration: transitionDuration }}
        >
          <p class="title">FAQ</p>

          {#each faqItems as faqItem}
            <div class="faqItem" on:click={toggleFaqAnswer}>
              <div class="question">
                <p class="text">{faqItem.question}</p>
                <button>
                  <img
                    src="/images/downArrowFramedD9.svg"
                    alt="Show answer"
                    class:open={false}
                  />
                </button>
              </div>
              <p class="text answer" class:open={false}>{faqItem.answer}</p>
            </div>
          {/each}
        </section>

        <section
          transition:fade={{ delay: transitionDelay * 3, duration: transitionDuration }}
        >
          <p class="title">Kontakt</p>
          <div class="emailAndCopyButton">
            <p class="text">r0pzrgabp@mozmail.com</p>
            <button on:click={copyEmailToClipboard}>
              <img src="/images/copyToClipboard.svg" alt="" />
            </button>
          </div>
        </section>

        <section
          transition:fade={{ delay: transitionDelay * 4, duration: transitionDuration }}
        >
          <p class="title">Privacy policy</p>
          <p class="text">Korisnički podaci se ne sakupljaju.</p>
        </section>
      </div>
    {/if}
  </div>
</nav>

<style>
  nav {
    padding: 1.5rem 1rem;
    background: #273454;
    box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.25);
    margin-bottom: 3rem;
  }
  nav > div {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;

    max-width: 100rem;
    margin: 0 auto;
  }

  img {
    width: 7rem;
  }
  .hamburger {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 2.5rem;
    height: 2rem;
    cursor: pointer;
  }
  .line {
    width: 100%;
    height: 0.25rem;
    background: #d9d9d9;
    border-radius: 0.25rem;
    transition: transform 100ms ease-out;
  }

  .hamburger.open .line:nth-child(1) {
    transform: translate(0px, 14px) rotate(45deg);
  }
  .hamburger.open .line:nth-child(2) {
    opacity: 0;
  }
  .hamburger.open .line:nth-child(3) {
    transform: translate(0px, -14px) rotate(-45deg);
  }

  /* menu takes the whole screen */
  .menu {
    z-index: 2;
    background-color: #273454;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;

    /* max-width: 30rem; */
    /* height: 100vh; */
    display: flex;
    flex-direction: column;
    row-gap: 2.5rem;
    padding: 4rem 2rem;
  }
  .menu section {
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
  }
  .menu .title {
    font-size: 1rem;
    color: #ffffff;
    font-weight: 500;
  }
  .menu .text {
    font-size: 1rem;
    color: #d9d9d9;
    font-weight: 400;
    line-height: 150%;
  }

  .menu .segmentedButton {
    display: flex;
  }
  .menu .segmentedButton .option {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    column-gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0;
    border: 1px solid #d9d9d9;
    cursor: pointer;
  }
  /* first and last options have border-radius on outer sides */
  .menu .segmentedButton .option:first-child {
    border-top-left-radius: 10rem;
    border-bottom-left-radius: 10rem;
  }
  .menu .segmentedButton .option:last-child {
    border-top-right-radius: 10rem;
    border-bottom-right-radius: 10rem;
  }
  .menu .segmentedButton .option:hover {
    background-color: rgba(255, 255, 255, 0.125);
  }

  .menu .segmentedButton .option.selected {
    background-color: rgba(255, 255, 255, 0.125);
  }
  .menu .segmentedButton .option img {
    width: 1.5rem;
    height: 1.5rem;
    display: none;
  }
  .menu .segmentedButton .option.selected img {
    display: block;
  }
  .menu .segmentedButton .option p {
    font-size: 1rem;
    color: #ffffff;
    font-weight: 400;
  }

  .menu .faqItem {
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
    cursor: pointer;
    border-radius: 0.25rem;
  }
  .menu .faqItem:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  .menu .faqItem .question {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .menu .faqItem .question button {
    flex-shrink: 0;
  }

  .menu .faqItem .answer {
    display: none;
    margin-left: 1rem;
    margin-right: 2.5rem;
    color: #ffffff;
    margin-bottom: 1rem;
  }
  .menu .faqItem .answer.open {
    display: block;
  }

  .menu .emailAndCopyButton {
    display: flex;
    align-items: center;
    column-gap: 1rem;
    height: 1.25rem;
  }
  .menu button {
    width: 2.5rem;
    height: 2.5rem;
    padding: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  .menu button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .menu img {
    width: 100%;
    height: 100%;
  }
  .menu .question img {
    transform: rotate(0);
    transition: transform 200ms ease-out;
  }
  .menu .question img.open {
    transform: rotate(-180deg);
  }
</style>
