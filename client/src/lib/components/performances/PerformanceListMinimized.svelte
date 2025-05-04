<script lang="ts">
  import PerformanceCard from './PerformanceCard.svelte';

  interface PerformanceListMinimizedProps {
    performances: MoviePerformance[];
    performanceDateText: string | undefined;
    onSelectPerformance: (performance: MoviePerformance) => void;
  }

  let {
    performances,
    performanceDateText,
    onSelectPerformance
  }: PerformanceListMinimizedProps = $props();
</script>

<div class="performanceContainer">
  <div class="performanceslabel">
    {performanceDateText}
  </div>
  <div class="performanceList">
    {#each performances as performance}
      <PerformanceCard {performance} onClick={() => onSelectPerformance(performance)} />
    {/each}
  </div>
</div>

<style>
  .performanceContainer {
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
  }
  .performanceContainer .performanceslabel {
    color: #e6e6e6;
    font-weight: 500;
    font-size: 0.875rem;
    text-transform: capitalize;
  }
  .performanceContainer .performanceList {
    display: flex;
    column-gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.25rem;
    margin-bottom: 0.25rem;
  }
</style>
