<script lang="ts">
  interface FaqItem {
    question: string;
    answer: string;
    isOpen?: boolean;
  }

  let faqItems: FaqItem[] = $state([
    {
      question: 'Jesu li prikazani filmovi i termini isti kao na cinestaru?',
      answer:
        'Da, informacije o filmovima i terminima prikazivanja preuzimaju se direktno iz Cinestar-ovog API-ja, osiguravajući točnost i usklađenost s ponudom u kinima.'
    },
    {
      question: 'Koliko su točne informacije na ovoj web stranici?',
      answer:
        'Osnovni podaci, uključujući popis filmova, raspored prikazivanja i informacije o sjedalima, preuzimaju se sa službene web stranice Cinestar-a. Dodatni detalji poput liste glumaca, redatelja i ocjena dolaze sa Letterboxd-a. Može se dogoditi da program pronađe krivu Letterboxd stranicu za film, ali to se lako primjeti jer naslov filma i slika neće odgovarati.'
    },
    {
      question: 'Koliko često se ažuriraju podaci na ovoj web stranici?',
      answer: 'Svi podaci (Cinestar i Letterboxd) se ažuriraju jednom dnevno, u 00:30'
    },
    {
      question: 'Zašto nema filmova nakon srijede?',
      answer:
        'Cinestar objavljuje novi raspored filmova svake srijede. Ako ih nema na ovoj stranici, nema ni na cinestaru.'
    },
    {
      question: 'Kako se određuje raspored i dostupnost sjedala?',
      answer:
        'Raspored sjedala i informacije o njihovoj dostupnosti automatski se preuzimaju s Cinestarove službene web stranice u trenutku kada odaberete prikazivanje, osiguravajući da su informacije uvijek aktualne i precizne.'
    },
    {
      question: 'Postoje li planovi za dodavanje novih značajki?',
      answer:
        'Nemam više ideja, ako imate prijedloge za poboljšanja ili nove funkcije, slobodno mi pošaljite e-mail.'
    },
    {
      question: 'Mogu li kontribuirati ovom projektu?',
      answer:
        'Da, s obzirom da nemam puno vremena za ovaj projekt, svaka pomoć je dobrodošla. GitHub link je dolje.'
    }
  ]);
</script>

{#each faqItems as faqItem, index (faqItem.question)}
  <button
    type="button"
    class="faqItem"
    aria-expanded={faqItem.isOpen}
    aria-controls={`faq-answer-${index}`}
    onclick={() => (faqItem.isOpen = !faqItem.isOpen)}
  >
    <div class="question">
      <p class="text">{faqItem.question}</p>
      <img
        src="/images/downArrowFramedD9.svg"
        alt="Show answer"
        class:open={faqItem.isOpen}
      />
    </div>
    {#if faqItem.isOpen}
      <p
        class="text answer"
        id={`faq-answer-${index}`}
        aria-hidden={!faqItem.isOpen}
        class:open={faqItem.isOpen}
      >
        {faqItem.answer}
      </p>
    {/if}
  </button>
{/each}

<style>
  /* From parent component, must match */
  .text {
    font-size: 1rem;
    color: #d9d9d9;
    font-weight: 400;
    line-height: 150%;
  }

  button.faqItem {
    text-align: left;
  }

  .faqItem {
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
    cursor: pointer;
    border-radius: 0.25rem;
  }
  .faqItem:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  .faqItem .question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    column-gap: 1rem;
  }
  .faqItem .question img {
    flex-shrink: 0;
  }

  .faqItem .answer {
    display: block;
    margin-left: 1rem;
    margin-right: 2.5rem;
    color: #ffffff;
    margin-bottom: 1rem;
  }

  .question img {
    transform: rotate(0);
    transition: transform 200ms ease-out;
  }
  .question img.open {
    transform: rotate(-180deg);
  }
</style>
