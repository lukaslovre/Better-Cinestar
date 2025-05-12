<div class="loader" />

<style>
  .loader {
    margin: calc(150px - 3rem) auto 0 auto;
    width: 3rem;
    height: 3rem;
    border: 0.3125rem solid #fff;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: block;
    animation: rotation 1.62s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
