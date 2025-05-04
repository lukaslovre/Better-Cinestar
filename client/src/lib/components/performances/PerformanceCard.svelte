<script lang="ts">
  interface PerformanceCardProps {
    performance: MoviePerformance;
    onClick: () => void;
  }

  let { performance, onClick }: PerformanceCardProps = $props();
</script>

<button type="button" class="performanceCard" onclick={onClick}>
  <p class="performanceTime">
    {performance.performanceTime}
  </p>

  <div class="performanceFeature">
    {#each performance.performanceFeatures || [] as feature}
      <p>{feature}</p>
    {/each}
  </div>
</button>

<style>
  .performanceCard {
    padding: 0.5rem;
    border-radius: 0.25rem;
    border-radius: 0.25rem;
    border: 1px solid #596fa6;
    background: #06080e;
    cursor: pointer;

    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 0.5rem;

    transition: border-color 200ms ease-out;
  }
  .performanceCard:hover {
    border-color: hsl(223, 30%, 75%);
  }

  .performanceCard .performanceTime {
    color: #e6e6e6;
    font-size: 0.75rem;
  }
  .performanceCard .performanceFeature {
    text-align: center;
    color: #bfbfbf;
    font-size: 0.625rem;
    font-weight: 400;
    line-height: 140%;
  }
</style>
