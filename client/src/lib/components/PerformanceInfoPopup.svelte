<script>
  import { createEventDispatcher } from 'svelte';
  import { modal } from '$lib/utils/modal';
  const dispatch = createEventDispatcher();

  function close() {
    dispatch('showPerformanceInfoPopup', false);
  }

  localStorage.setItem('visitedWebsiteBefore', 'true');
</script>

<div class="backdrop">
  <div
    id="card"
    role="dialog"
    aria-modal="true"
    aria-label="Pomoć za termine"
    tabindex="-1"
    use:modal={close}
  >
    <img src="/images/performancesHelp.svg" alt="performances help" />
    <button on:click={close}> Kužim </button>
  </div>
</div>

<style>
  .backdrop {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;

    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(3px);
  }
  #card {
    position: fixed;
    top: 3rem;
    left: 50%;
    transform: translateX(-50%);

    max-width: 30rem;
    width: calc(100% - 2rem);
    padding: 2rem;
    border-radius: 0.5rem;
    background: #131a2a;
    box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.75);
  }
  #card img {
    width: 100%;
  }

  #card button {
    margin-top: 4rem;
    width: 100%;
    color: #e8c547;
    padding: 0.625rem;
    border-radius: 0.375rem;
    background: rgba(232, 197, 71, 0.2);
    text-align: center;
    border: none;
    cursor: pointer;
  }
</style>
