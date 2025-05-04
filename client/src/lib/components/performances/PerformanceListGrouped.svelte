<script lang="ts">
  import { cinemas } from '$lib/utils/cinemas';
  import PerformanceCard from './PerformanceCard.svelte';

  interface PerformanceListGroupedProps {
    filteredPerformances: MoviePerformance[];
    onSelectPerformance: (performance: MoviePerformance) => void;
  }

  let { filteredPerformances, onSelectPerformance }: PerformanceListGroupedProps =
    $props();

  function groupPerformancesByCinema(performances: MoviePerformance[]) {
    const groupedPerformances = new Map();

    for (const e of performances) {
      const cinema = cinemas.find((cinema) => cinema.cinemaOid === e.cinemaOid);
      if (!cinema) {
        console.warn('Cinema not found for performance:', e);
        continue; // Skip this performance if cinema is not found
      }

      const cinemaName = cinema.cinemaName + ' (' + cinema.cinemaCity + ')';
      if (!groupedPerformances.has(cinemaName)) {
        groupedPerformances.set(cinemaName, []);
      }
      groupedPerformances.get(cinemaName).push(e);
    }

    return groupedPerformances;
  }
</script>

<div class="performanceContainer">
  {#each [...groupPerformancesByCinema(filteredPerformances)] as [groupLabel, performances]}
    <div class="performanceslabel">
      {groupLabel}
    </div>
    <div class="performanceList">
      {#each performances as performance}
        <PerformanceCard {performance} onClick={() => onSelectPerformance(performance)} />
      {/each}
    </div>
  {/each}
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
