(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const albumGrid = $("#albumGrid");
  const photoGrid = $("#photoGrid");
  const albumsView = $("#albumsView");
  const photosView = $("#photosView");
  const searchInput = $("#searchInput");
  const categoryFilters = $("#categoryFilters");
  const resultCount = $("#resultCount");
  const emptyAlbums = $("#emptyAlbums");
  const emptyPhotos = $("#emptyPhotos");
  const lightbox = $("#lightbox");

  let activeCategory = "Tous";
  let activeAlbum = null;
  let visiblePhotos = [];
  let activePhotoIndex = 0;

  const safeDate = (value) => {
    if (!value) return "";
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", {
      day: "numeric", month: "long", year: "numeric"
    }).format(date);
  };

  const categories = ["Tous", ...new Set(albums.map(album => album.category).filter(Boolean))];

  function renderFilters() {
    categoryFilters.innerHTML = "";
    categories.forEach(category => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `filter-button${category === activeCategory ? " active" : ""}`;
      button.textContent = category;
      button.setAttribute("aria-pressed", String(category === activeCategory));
      button.addEventListener("click", () => {
        activeCategory = category;
        renderFilters();
        renderAlbums();
      });
      categoryFilters.appendChild(button);
    });
  }

  function albumMatches(album, query) {
    const text = `${album.title} ${album.date} ${album.category} ${album.description}`.toLocaleLowerCase("fr");
    return (!query || text.includes(query)) && (activeCategory === "Tous" || album.category === activeCategory);
  }

  function renderAlbums() {
    /* const query = searchInput.value.trim().toLocaleLowerCase("fr");*/
	const query = "";
    const matches = albums.filter(album => albumMatches(album, query));
    albumGrid.innerHTML = "";
    matches.forEach(album => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "album-card";
      button.setAttribute("aria-label", `Ouvrir l’album ${album.title}`);

      const cover = document.createElement("div");
      cover.className = "album-cover";
      const image = document.createElement("img");
      image.src = album.cover || album.photos?.[0]?.src || "";
      image.alt = "";
      image.loading = "lazy";
      image.onerror = () => { image.style.visibility = "hidden"; cover.style.background = "linear-gradient(135deg,#e4eadf,#cbd8c3)"; };
      cover.appendChild(image);

      const title = document.createElement("h3");
      title.textContent = album.title;
      const meta = document.createElement("p");
      meta.textContent = `${album.date || ""}${album.date ? " · " : ""}${(album.photos || []).length} photo(s)`;

      button.append(cover, title, meta);
      button.addEventListener("click", () => openAlbum(album.id));
      albumGrid.appendChild(button);
    });
    resultCount.textContent = `${matches.length} album(s)`;
    emptyAlbums.hidden = matches.length !== 0;
  }

  function openAlbum(id) {
    activeAlbum = albums.find(album => album.id === id);
    if (!activeAlbum) return;
    visiblePhotos = activeAlbum.photos || [];
    $("#currentAlbumTitle").textContent = activeAlbum.title;
    $("#currentAlbumDescription").textContent = `${activeAlbum.description || ""}${activeAlbum.date ? " · " + activeAlbum.date : ""}`;
    albumsView.hidden = true;
    photosView.hidden = false;
    renderPhotos();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderPhotos() {
    photoGrid.innerHTML = "";
    visiblePhotos.forEach((photo, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "photo-card";
      button.setAttribute("aria-label", `Afficher ${photo.title || "la photo"}`);
      const image = document.createElement("img");
      image.src = photo.src;
      image.alt = photo.title || "";
      image.loading = "lazy";
      image.onerror = () => { button.hidden = true; };
      button.appendChild(image);
      button.addEventListener("click", () => openLightbox(index));
      photoGrid.appendChild(button);
    });
    emptyPhotos.hidden = visiblePhotos.length !== 0;
  }

  function openLightbox(index) {
    if (!visiblePhotos.length) return;
    activePhotoIndex = index;
    updateLightbox();
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else lightbox.setAttribute("open", "");
  }

  function updateLightbox() {
    const photo = visiblePhotos[activePhotoIndex];
    if (!photo) return;
    $("#lightboxImage").src = photo.src;
    $("#lightboxImage").alt = photo.title || "";
    $("#lightboxTitle").textContent = photo.title || activeAlbum.title;
    $("#lightboxMeta").textContent = [safeDate(photo.date), activeAlbum.title].filter(Boolean).join(" · ");
    $("#lightboxCounter").textContent = `${activePhotoIndex + 1} / ${visiblePhotos.length}`;
    $("#previousPhoto").disabled = visiblePhotos.length < 2;
    $("#nextPhoto").disabled = visiblePhotos.length < 2;
  }

  function movePhoto(direction) {
    if (!visiblePhotos.length) return;
    activePhotoIndex = (activePhotoIndex + direction + visiblePhotos.length) % visiblePhotos.length;
    updateLightbox();
  }

  function closeLightbox() {
    if (lightbox.open && typeof lightbox.close === "function") lightbox.close();
    else lightbox.removeAttribute("open");
  }

  $("#backToAlbums").addEventListener("click", () => {
    photosView.hidden = true;
    albumsView.hidden = false;
    activeAlbum = null;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  $("#closeLightbox").addEventListener("click", closeLightbox);
  $("#previousPhoto").addEventListener("click", () => movePhoto(-1));
  $("#nextPhoto").addEventListener("click", () => movePhoto(1));
  lightbox.addEventListener("click", event => { if (event.target === lightbox) closeLightbox(); });
  /*searchInput.addEventListener("input", renderAlbums);*/

  document.addEventListener("keydown", event => {
    if (!lightbox.open) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") movePhoto(-1);
    if (event.key === "ArrowRight") movePhoto(1);
  });

  renderFilters();
  renderAlbums();
})();
