<script lang="ts">
  import { fade } from 'svelte/transition';
  import { resetFiltersToDefault } from '$lib/stores/userSelection.svelte';
  import Hamburger from './navigation/Hamburger.svelte';
  import Faq from './navigation/Faq.svelte';
  import SegmentedButton from './navigation/SegmentedButton.svelte';

  const contactEmail = 'lovretic2002@gmail.com';
  const privacyPolicyContent = 'Korisnički podaci se ne sakupljaju.';

  const transitionDuration: number = 150;
  const transitionDelay: number = 75;

  const defaultCardDesign: CardDesign = 'v2';

  let selectedCardDesign: CardDesign = $state(
    (localStorage.getItem('movieCardDesign') as CardDesign) || defaultCardDesign
  );

  function changeCardDesign(design: CardDesign) {
    localStorage.setItem('movieCardDesign', design);
    selectedCardDesign = design;
  }

  let menuOpen = $state(false);

  function toggleMenu() {
    menuOpen = !menuOpen;
    // TODO: imati neki globalni utility za lockanje scrollanja

    const contentElement = document.getElementById('content');
    if (!contentElement) {
      console.warn('Content element not found when toggling menu');
      return;
    }

    // prevent scrolling when menu is open
    if (menuOpen) {
      contentElement.style.display = 'none';
    } else {
      contentElement.style.display = 'flex';
    }
  }

  function copyEmailToClipboard(email: string) {
    navigator.clipboard.writeText(email).catch((err) => {
      console.error('Failed to copy email: ', err);
    });
  }
</script>

<nav>
  <div>
    <button type="button" onclick={resetFiltersToDefault}>
      <img id="logo" src="/images/logo.png" alt="Better CineStar logo" />
    </button>

    <Hamburger
      isOpen={menuOpen}
      onClick={toggleMenu}
      ariaLabel="Toggle menu"
      ariaControlsId="navigation-menu"
    />

    {#if menuOpen}
      <div class="menu" id="navigation-menu">
        <section
          transition:fade={{ delay: transitionDelay * 1, duration: transitionDuration }}
        >
          <p class="title">Dizajn kartice filma</p>

          <SegmentedButton
            options={[
              { label: 'Stari', value: 'v1' },
              { label: 'Novi', value: 'v2' }
            ]}
            selectedOption={selectedCardDesign}
            onOptionChange={changeCardDesign}
            label="Movie card design"
          />
        </section>

        <section
          transition:fade={{ delay: transitionDelay * 2, duration: transitionDuration }}
        >
          <p class="title">FAQ</p>
          <Faq />
        </section>

        <section
          transition:fade={{ delay: transitionDelay * 3, duration: transitionDuration }}
        >
          <p class="title">Kontakt</p>
          <div class="emailAndCopyButton">
            <p class="text">{contactEmail}</p>
            <button
              onclick={() => copyEmailToClipboard(contactEmail)}
              aria-label="Copy email to clipboard"
            >
              <img src="/images/copyToClipboard.svg" alt="copy icon" />
            </button>
          </div>
        </section>

        <section
          transition:fade={{ delay: transitionDelay * 4, duration: transitionDuration }}
        >
          <p class="title">Privacy policy</p>
          <p class="text">{privacyPolicyContent}</p>
        </section>

        <section
          transition:fade={{ delay: transitionDelay * 5, duration: transitionDuration }}
        >
          <p class="title">GitHub repository</p>
          <a href="https://github.com/lukaslovre/Better-Cinestar" class="text"
            >github.com/lukaslovre/Better-Cinestar</a
          >
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

  #logo {
    width: 7rem;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  #logo:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .menu {
    z-index: 2;
    background-color: #273454;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;

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
  .menu a.text {
    text-decoration: underline;
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
</style>
