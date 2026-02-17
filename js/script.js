console.log("Let's Write java script.");
let currentSong = new Audio();
let songs;
let currFolder;

// Helper: Convert seconds to mm:ss format (unchanged)
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

// Replace your getSongs function to fetch songs from info.json of the folder via jsDelivr
async function getSongs(folder) {
  currFolder = folder;

  // jsDelivr base URL — change username/repo/branch as per your repo
  const baseURL = `https://cdn.jsdelivr.net/gh/AbhishekSharma-9/Spotify-Clone@main/${folder}/`;

  // Fetch info.json from the folder to get the songs list
  let res = await fetch(baseURL + 'info.json');
  if (!res.ok) {
    console.error(`Failed to load info.json from ${folder}`);
    return [];
  }
  let info = await res.json();

  // songs array of filenames with underscores (from info.json)
  songs = info.songs;

  // Show all the songs in the playlist
  let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
  songUL.innerHTML = "";

  for (const song of songs) {
    // Replace underscores with spaces, remove .mp3
    const decodedSong = song.replaceAll("_", " ").replace(".mp3", "");
    const [title, artist] = decodedSong.split(" - ");

    songUL.innerHTML += `
        <li data-src="${song}"> <img class="invert" src="Image_Assets/music.svg" alt="music" width="18">
            <div class="info">
                <div>Song Name: ${title}</div>
                <div>Artist: ${artist || "Unknown Artist"}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="Image_Assets/play.svg" alt="Play" width="18">
            </div> 
        </li>`;
  }

  // Attach click listeners to play song
  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((element) => {
    element.addEventListener("click", (e) => {
      const songFile = element.getAttribute("data-src");
      playMusic(songFile);
    });
  });

  return songs;
}

// Modify playMusic to use jsDelivr URLs, no local URLs
const playMusic = (track, pause = false) => {
  // Use jsDelivr url for the current folder + track
  currentSong.src = `https://cdn.jsdelivr.net/gh/AbhishekSharma-9/Spotify-Clone@main/${currFolder}/${track}`;

  if (!pause) {
    currentSong.play();
    play.src = "Image_Assets/pause.svg";
  }

  // Format the track name for display in playbar
  let displayName = track
    .replace(/_/g, ' ')          // Replace all underscores with spaces
    .replace(/(\w)-(\w)/g, '$1 - $2')  // Add spaces around hyphens between words
    .replace('.mp3', '');        // Remove .mp3 extension

  document.querySelector(".songinfo").innerHTML = displayName;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

  // Highlight playing song
  const allSongs = document.querySelectorAll(".songList li");
  allSongs.forEach(li => {
    li.classList.remove("playing");
    const playIcon = li.querySelector(".playnow img");
    if (playIcon) {
      playIcon.src = "Image_Assets/play.svg"; 
    }
  });

  const currentLi = Array.from(allSongs).find(li => li.getAttribute("data-src") === track);

  if (currentLi) {
    currentLi.classList.add("playing");
    const playIcon = currentLi.querySelector(".playnow img");
    if (playIcon) {
      playIcon.src = "Image_Assets/pause.svg";
    }

    currentLi.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

// Update displayAlbums to fetch folders dynamically using jsDelivr is tricky because jsDelivr (and GitHub) don't provide directory listings.
// So here we must hardcode or maintain a list of folders manually.

async function displayAlbums() {
  // List of your folders (replace or extend this array with your actual folders)
  const folders = [
      "bhojpuri",
      "Devotional",
      "TopHits2025",
      "djsongs",
      "EDM",
      "Mashup",
      "Motivation",
      "Odia",
      "party",
      "Phonk",
      "pop",
      "romantic",
      "sad",
      "South",
      "TopHits",
    ];

  let cardContainer = document.querySelector(".cardContainer");
  cardContainer.innerHTML = ''; // Clear previous

  for (const folder of folders) {
    // Compose jsDelivr URL for info.json
    const url = `https://cdn.jsdelivr.net/gh/AbhishekSharma-9/Spotify-Clone@main/songs/${folder}/info.json`;

    let res = await fetch(url);
    if (!res.ok) {
      console.warn(`Could not load info.json for folder ${folder}`);
      continue;
    }
    let response = await res.json();

    cardContainer.innerHTML += `
      <div data-folder="songs/${folder}" class="card">
        <div class="play">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
              stroke-linejoin="round" />
          </svg>
        </div>

        <img src="https://cdn.jsdelivr.net/gh/AbhishekSharma-9/Spotify-Clone@main/songs/${folder}/cover.jpg" alt="${response.title} cover">
        <h3>${response.title}</h3>
        <p style="font-size: 14px">${response.description}</p>
      </div>`;
  }

  // Add click listener to load playlist
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getSongs(item.currentTarget.dataset.folder);
      if (songs.length > 0) playMusic(songs[0]);
    });
  });
}

async function main() {
  // Initialize with a default folder (change as needed)
  await getSongs("songs/TopHits2025");
  playMusic(songs[0], true);

  await displayAlbums();

  // Play/Pause button event listener
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "Image_Assets/pause.svg";
    } else {
      currentSong.pause();
      play.src = "Image_Assets/play.svg";
    }
  });
  
  // Set initial volume
  currentSong.volume = 1;
  document.querySelector(".range input").value = 100;

  // Time update event for seekbar
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Click event for seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Hamburger menu events
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  // Previous/Next song events
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Volume control events
  document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
    if (currentSong.volume == 0) {
      document.querySelector(".volume img").src = "Image_Assets/mute.svg";
    } else {
      document.querySelector(".volume img").src = "Image_Assets/volume.svg";
    }
  });

  // Mute toggle event
  document.querySelector(".volume img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = "Image_Assets/mute.svg";
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = "Image_Assets/volume.svg";
      currentSong.volume = 1;
      document.querySelector(".range input").value = 100;
    }
  });

  // Volume input event
  document.querySelector(".range input").addEventListener("input", (e) => {
    const volumeValue = parseInt(e.target.value);
    currentSong.volume = volumeValue / 100;

    const icon = document.querySelector(".volume img");
    if (volumeValue === 0) {
      icon.src = "Image_Assets/mute.svg";
    } else {
      icon.src = "Image_Assets/volume.svg";
    }
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "Space":
        e.preventDefault();
        if (currentSong.paused) {
          currentSong.play();
          play.src = "Image_Assets/pause.svg";
        } else {
          currentSong.pause();
          play.src = "Image_Assets/play.svg";
        }
        break;

      case "ArrowRight": // Next song
        next.click();
        break;

      case "ArrowLeft": // Previous song
        previous.click();
        break;

      case "ArrowUp":
        currentSong.volume = Math.min(currentSong.volume + 0.1, 1);
        document.querySelector(".range input").value = currentSong.volume * 100;
        break;

      case "ArrowDown":
        currentSong.volume = Math.max(currentSong.volume - 0.1, 0);
        document.querySelector(".range input").value = currentSong.volume * 100;
        break;
    }
  });

  // Drag-based seeking
  let isSeeking = false;
  const seekbar = document.querySelector(".seekbar");

  seekbar.addEventListener("mousedown", () => {
    isSeeking = true;
  });

  seekbar.addEventListener("mousemove", (e) => {
    if (isSeeking) {
      const percent = (e.offsetX / seekbar.getBoundingClientRect().width) * 100;
      document.querySelector(".circle").style.left = percent + "%";
      currentSong.currentTime = (currentSong.duration * percent) / 100;
    }
  });

  document.addEventListener("mouseup", () => {
    if (isSeeking) {
      isSeeking = false;
    }
  });

  // Autoplay next song when current ends
  currentSong.addEventListener("ended", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });
}

main();
