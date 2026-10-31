<script lang="ts">
  import emblaCarouselSvelte from 'embla-carousel-svelte';
  import type { EmblaCarouselType as EmblaApi } from 'embla-carousel';

  interface Props {
    movie: Movie;
    eagerPoster?: boolean;
  }

  let { movie, eagerPoster = false }: Props = $props();
  let embla: EmblaApi | undefined;
  let selected = $state(0);
  let requested = $state<number[]>([]);
  let loaded = $state<string[]>([]);
  let failed = $state<string[]>([]);

  // Fall back to the Cinestar poster if the TMDB one fails to load.
  const posterUrl = $derived(
    [movie.tmdb_poster_url, movie.imageUrl].find((url) => url && !failed.includes(url))
  );
  const backdrops = $derived(movie.tmdb_backdrop_urls ?? []);
  const slides = $derived([posterUrl, ...backdrops]);
  const title = $derived(movie.originalTitle || movie.title || '');

  function requestNearby(index: number) {
    requested = [...new Set([...requested, index - 1, index, index + 1])];
  }

  function onInit(event: CustomEvent<EmblaApi>) {
    embla = event.detail;
    const syncSelection = (api: EmblaApi) => {
      selected = api.selectedScrollSnap();
      if (selected > 0 || requested.length) requestNearby(selected);
    };
    syncSelection(embla);
    embla.on('select', syncSelection);
    embla.on('reInit', syncSelection);
  }

  function navigate(direction: 'previous' | 'next') {
    requestNearby(selected + (direction === 'next' ? 1 : -1));
    if (direction === 'next') embla?.scrollNext();
    else embla?.scrollPrev();
  }

  function onKeydown(event: KeyboardEvent) {
    if (slides.length < 2) return;
    if (event.key === 'ArrowRight') navigate('next');
    else if (event.key === 'ArrowLeft') navigate('previous');
    else return;
    event.preventDefault();
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div
  class="gallery"
  role="region"
  aria-label="Slike filma {title}"
  tabindex={slides.length > 1 ? 0 : undefined}
  onkeydown={onKeydown}
>
  <div
    class="viewport"
    role="group"
    aria-label="Pregled slika"
    use:emblaCarouselSvelte
    onemblaInit={onInit}
    onpointerdown={() => requestNearby(selected)}
  >
    <div class="slides">
      {#each slides as url, index (index)}
        <div class="slide" aria-hidden={index !== selected}>
          {#if url && loaded.includes(url) && !failed.includes(url)}
            <div class="imageBackground" style:background-image={`url(${url})`}></div>
            <div class="overlay"></div>
          {/if}
          {#if url && (index === 0 || requested.includes(index)) && !failed.includes(url)}
            <img
              class:poster={index === 0}
              class:backdrop={index > 0}
              src={url}
              alt={index === 0 ? `${title} poster` : `${title} — slika ${index}`}
              loading={index === 0 && eagerPoster ? 'eager' : 'lazy'}
              draggable="false"
              onload={() => (loaded = [...loaded, url])}
              onerror={() => (failed = [...failed, url])}
            />
          {:else if !url || failed.includes(url)}
            <span class="imageUnavailable">Slika nije dostupna</span>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  {#if slides.length > 1}
    <button
      class="galleryArrow previous"
      type="button"
      aria-label="Prethodna slika"
      disabled={selected === 0}
      onclick={() => navigate('previous')}>&#8249;</button
    >
    <button
      class="galleryArrow next"
      type="button"
      aria-label="Sljedeća slika"
      disabled={selected >= slides.length - 1}
      onclick={() => navigate('next')}>&#8250;</button
    >
    <div class="galleryDots" aria-hidden="true">
      {#each slides, index (index)}
        <span class:active={index === selected}></span>
      {/each}
    </div>
    <span class="visuallyHidden" aria-live="polite"
      >Slika {selected + 1} od {slides.length}</span
    >
  {/if}
</div>

<style>
  .gallery {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 0.825;
    border-radius: 0.5rem 0.5rem 0 0;
    overflow: hidden;
  }
  .viewport,
  .slides {
    height: 100%;
  }
  .viewport {
    overflow: hidden;
    touch-action: pan-y pinch-zoom;
  }
  .slides {
    display: flex;
  }
  .slide {
    flex: 0 0 100%;
    min-width: 0;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  .imageBackground,
  .overlay {
    position: absolute;
    inset: 0;
  }
  .imageBackground {
    background-position: center;
    background-size: cover;
  }
  .overlay {
    background: rgba(19, 26, 42, 0.66);
    backdrop-filter: blur(21.5px);
  }
  .poster,
  .backdrop {
    height: 100%;
    object-fit: contain;
    z-index: 1;
  }
  .poster {
    width: 55%;
    border-radius: 0.5rem;
  }
  .backdrop {
    width: 100%;
  }
  .imageUnavailable {
    color: #ccc;
    font-size: 0.875rem;
  }
  .galleryArrow {
    position: absolute;
    z-index: 2;
    top: 50%;
    transform: translateY(-50%);
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    border: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    color: white;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
  }
  .galleryArrow:disabled {
    visibility: hidden;
  }
  .previous {
    left: 0.5rem;
  }
  .next {
    right: 0.5rem;
  }
  .galleryDots {
    position: absolute;
    z-index: 2;
    bottom: 0.6rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.35rem;
    padding: 0.3rem 0.4rem;
    border-radius: 1rem;
    background: rgba(0, 0, 0, 0.5);
  }
  .galleryDots span {
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
  }
  .galleryDots span.active {
    background: white;
  }
  .gallery:focus-visible {
    outline: 2px solid white;
    outline-offset: -2px;
  }
  .visuallyHidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>
