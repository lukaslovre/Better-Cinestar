<script lang="ts">
  interface HamburgerProps {
    isOpen: boolean;
    onClick: () => void;
    ariaLabel?: string;
    ariaControlsId?: string; // Id of the element controlled by the button
  }

  let {
    isOpen,
    onClick,
    ariaLabel = 'Toggle menu',
    ariaControlsId
  }: HamburgerProps = $props();

  function handleHamburgerClick() {
    onClick();
  }
</script>

<button
  type="button"
  aria-label={ariaLabel}
  aria-expanded={isOpen}
  aria-controls={ariaControlsId}
  class="hamburger"
  class:open={isOpen}
  onclick={handleHamburgerClick}
>
  <div class="line"></div>
  <div class="line"></div>
  <div class="line"></div>
</button>

<style>
  .hamburger {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 2.5rem;
    height: 2rem;
    cursor: pointer;
  }
  .hamburger .line {
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
</style>
