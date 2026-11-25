<script lang="ts">
  interface FaqItem {
    question: string;
    answer: string;
    isOpen?: boolean;
  }

  let faqItems: FaqItem[] = $state([
    {
      question: 'Je li ovo službena Cinestar stranica?',
      answer:
        'Ne, neovisan projekt. Gumb "Kupi kartu" vodi na odabrani termin na Cinestaru.'
    },
    {
      question: 'Odakle su podaci?',
      answer: 'Raspored i sjedala s Cinestara, ocjene i opisi s TMDB-a.'
    },
    {
      question: 'Koliko su svježi?',
      answer: 'Raspored se osvježava svaki dan oko 4 ujutro, sjedala uživo.'
    },
    {
      question: 'Zašto nema filmova nakon srijede?',
      answer: 'Cinestar objavljuje novi raspored srijedom.'
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
