<script lang="ts">
  const enabled = true;
  const message = '';
  const href = '';
</script>

{#if enabled && message}
  <div class="announcementBar" role="status" aria-live="polite">
    <div class="inner">
      {#if href}
        <a {href} target="_blank" rel="noopener noreferrer">{message}</a>
      {:else}
        <p>{message}</p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .announcementBar {
    position: relative;
    overflow: hidden;
    color: #ffffff;
  }

  /* Background layer that animates using transforms (GPU-accelerated) */
  .announcementBar::before {
    content: '';
    position: absolute;
    inset: 0;
    /* Make it wider so we can translate it to create the moving gradient effect */
    width: 200%;
    background: linear-gradient(90deg, #273454 0%, #4065bf 50%, #273454 100%);
    /* Use transform instead of background-position to leverage the compositor (GPU) */
    will-change: transform;
    backface-visibility: hidden;
    transform: translate3d(-50%, 0, 0);
    animation: slide 3s ease-in-out infinite;
  }

  @keyframes slide {
    0% {
      transform: translate3d(-50%, 0, 0);
    }
    50% {
      transform: translate3d(0%, 0, 0);
    }
    100% {
      transform: translate3d(-50%, 0, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .announcementBar::before {
      animation: none;
      transform: none;
    }
  }

  .inner {
    position: relative;
    z-index: 1;
    max-width: 100rem;
    margin: 0 auto;
    padding: 0.25rem 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  p,
  a {
    font-size: 0.625rem;
    font-weight: 500;
    line-height: 1.25rem;
    text-align: center;
  }

  a {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
