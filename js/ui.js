const get = id => document.getElementById(id);

const screens = {
  home: get("homeScreen"),
  setup: get("setupScreen"),
  online: get("onlineScreen"),
  lobby: get("lobbyScreen"),
  game: get("gameScreen")
};

export function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove("active"));
  screens[name].classList.add("active");
  get("homeButton").classList.toggle("hidden", name === "home");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function setOnlineTab(tab) {
  document.querySelectorAll("[data-online-tab]").forEach(button => {
    button.classList.toggle("selected", button.dataset.onlineTab === tab);
  });
  get("createRoomPanel").classList.toggle("hidden", tab !== "create");
  get("joinRoomPanel").classList.toggle("hidden", tab !== "join");
  get("spectateRoomPanel").classList.toggle("hidden", tab !== "spectate");
}

export function buildColumnControls(handler) {
  const controls = get("columnControls");
  controls.innerHTML = "";
  for (let column = 0; column < 7; column++) {
    const button = document.createElement("button");
    button.textContent = "▼";
    button.setAttribute("aria-label", `Drop disc in column ${column + 1}`);
    button.addEventListener("click", () => handler(column));
    controls.appendChild(button);
  }
}

export function setGameStatus(message) {
  get("gameStatus").textContent = message || "";
}

export function showWinner(title, subtitle) {
  get("winnerTitle").textContent = title;
  get("winnerSubtitle").textContent = subtitle;
  get("winnerOverlay").classList.remove("hidden");
}

export function hideWinner() {
  get("winnerOverlay").classList.add("hidden");
}
