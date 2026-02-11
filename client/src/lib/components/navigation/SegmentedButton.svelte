<script lang="ts">
  interface SegmentedButtonProps {
    options: LabelValue<string>[];
    selectedOption: string;
    onOptionChange: (option: string) => void;
    label: string;
  }

  let { options, selectedOption, onOptionChange, label }: SegmentedButtonProps = $props();
</script>

<div class="segmentedButton" role="radiogroup" aria-label={label}>
  {#each options as { label, value } (value)}
    <button
      type="button"
      class="option"
      class:selected={selectedOption === value}
      role="radio"
      aria-checked={selectedOption === value}
      aria-label={label}
      onclick={() => {
        onOptionChange(value);
      }}
    >
      <img src="/images/whiteCheckForMenu.svg" alt="checkmark" />
      <p>{label}</p>
    </button>
  {/each}
</div>

<style>
  .segmentedButton {
    display: flex;
    /* max-width: 45rem; */
  }
  .segmentedButton .option {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    column-gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0;
    border: 1px solid #d9d9d9;
    cursor: pointer;
  }
  /* first and last options have border-radius on outer sides */
  .segmentedButton .option:first-child {
    border-top-left-radius: 10rem;
    border-bottom-left-radius: 10rem;
  }
  .segmentedButton .option:last-child {
    border-top-right-radius: 10rem;
    border-bottom-right-radius: 10rem;
  }
  .segmentedButton .option:hover {
    background-color: rgba(255, 255, 255, 0.125);
  }

  .segmentedButton .option.selected {
    background-color: rgba(255, 255, 255, 0.125);
  }
  .segmentedButton .option img {
    width: 1.5rem;
    height: 1.5rem;
    display: none;
  }
  .segmentedButton .option.selected img {
    display: block;
  }
  .segmentedButton .option p {
    font-size: 1rem;
    color: #ffffff;
    font-weight: 400;
  }
</style>
