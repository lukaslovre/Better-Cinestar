<script lang="ts">
  const enabled = true;
  const message = 'isprike šta se raspada stranica';
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
    /* background: #4065bf; */
    background: linear-gradient(90deg, #273454 0%, #4065bf 50%, #273454 100%);
    background-size: 200% 100%;
    animation: gradientShift 8s ease-in-out infinite;

    color: #ffffff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  }

  @keyframes gradientShift {
    0% {
      background-position-x: 0%;
    }
    50% {
      background-position-x: 100%;
    }
    100% {
      background-position-x: 0%;
    }
  }

  .inner {
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
