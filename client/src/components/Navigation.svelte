<script>
  function toggleCardDesign() {
    const movieCardDesign = localStorage.getItem("movieCardDesign");
    if (movieCardDesign === "v1") {
      localStorage.setItem("movieCardDesign", "v2");
    } else {
      localStorage.setItem("movieCardDesign", "v1");
    }

    alert("Promjenili ste dizajn kartica, osvježite stranicu da bi se promjene vidjele.");
  }
</script>

<nav>
  <img src="/images/logo.png" alt="Better CineStar logo" on:click={toggleCardDesign} />
  <div class="hamburger">
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
  </div>
</nav>

<style>
  nav {
    padding: 1.5rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #273454;
    box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.25);
    margin-bottom: 3rem;
  }
  img {
    width: 7rem;
  }
  .hamburger {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 2.5rem;
    height: 2rem;
    cursor: pointer;
  }
  .line {
    width: 100%;
    height: 0.25rem;
    background: #d9d9d9;
    border-radius: 0.25rem;
  }
</style>
