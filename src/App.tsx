import type { Component } from "solid-js";
import { createSignal, onCleanup, onMount } from "solid-js";
import landing from "./assets/landing.mp3";
import { IoPlay } from "solid-icons/io";
import { IoPause } from "solid-icons/io";
import bg from "./assets/BG_1.mp4";

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const AudioPlayer: Component<{ src: string }> = (props) => {
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [currentTime, setCurrentTime] = createSignal(0);
  const [duration, setDuration] = createSignal(0);
  const [isDragging, setIsDragging] = createSignal(false);
  let audioRef: HTMLAudioElement;
  let progressRef: HTMLDivElement | undefined;

  onMount(() => {
    audioRef = new Audio(props.src);
    audioRef.addEventListener("loadedmetadata", () => {
      setDuration(audioRef.duration);
    });
    audioRef.addEventListener("timeupdate", () => {
      if (!isDragging()) {
        setCurrentTime(audioRef.currentTime);
      }
    });
    audioRef.addEventListener("ended", () => {
      setIsPlaying(false);
    });

    // Add global mouse event listeners
    const handleMouseUp = () => {
      if (isDragging()) {
        setIsDragging(false);
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging() && progressRef) {
        const rect = progressRef.getBoundingClientRect();
        const percent = Math.max(
          0,
          Math.min(1, (e.clientX - rect.left) / rect.width)
        );
        setCurrentTime(percent * duration());
        audioRef.currentTime = percent * duration();
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    onCleanup(() => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
      audioRef?.pause();
    });
  });

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    const rect = progressRef?.getBoundingClientRect();
    if (rect) {
      const percent = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width)
      );
      setCurrentTime(percent * duration());
      audioRef.currentTime = percent * duration();
    }
  };

  const togglePlay = () => {
    if (isPlaying()) {
      audioRef.pause();
    } else {
      audioRef.play();
    }
    setIsPlaying(!isPlaying());
  };

  return (
    <div class="w-[500px] bg-transparent rounded-xl p-4">
      <div class="flex items-center gap-4">
        <button
          onClick={togglePlay}
          class="w-11 h-11 flex items-center justify-center bg-transparent hover:bg-black/5 text-black rounded-lg transition-all"
          aria-label={isPlaying() ? "Pause" : "Play"}
        >
          {isPlaying() ? (
            <IoPause class="w-5 h-5" />
          ) : (
            <IoPlay class="w-5 h-5 ml-0.5" />
          )}
        </button>

        <div class="flex-1 relative group">
          <div
            ref={progressRef!}
            class="h-1.5 bg-black/10 rounded-full cursor-pointer overflow-hidden"
            onMouseDown={handleMouseDown}
          >
            <div
              class="h-full bg-black group-hover:bg-gray-800"
              style={{
                width: `${(currentTime() / duration()) * 100}%`,
              }}
            />
          </div>
          <div
            class="absolute -top-2 -bottom-2 left-0 right-0 hidden group-hover:block"
            onMouseDown={handleMouseDown}
          />
        </div>

        <div class="text-sm text-black font-body whitespace-nowrap">
          {formatTime(currentTime())} / {formatTime(duration())}
        </div>
      </div>
    </div>
  );
};

const App: Component = () => {
  return (
    <div class="relative min-h-screen w-full overflow-hidden">
      {/* Background Video */}
      <video
        autoplay
        loop
        muted
        playsinline
        class="absolute top-0 left-0 w-full h-full object-cover opacity-50 blur-lg scale-110"
      >
        <source src={bg} type="video/mp4" />
      </video>

      {/* Content */}
      <div class="relative h-[80vh] flex flex-col justify-between px-[20vw] pt-[25vh]">
        <div>
          <div class="flex items-baseline gap-3 mb-4">
            <h1 class="text-6xl font-bold text-black font-heading">Nari</h1>
            <span class="text-lg text-gray-500 font-heading">v0.1</span>
          </div>
          <h2 class="text-3xl text-black font-heading font-bold">
            Generate lifelike dialogue with custom voices
          </h2>
        </div>
        <div class="flex flex-col pb-56">
          <div class="flex flex-col items-center gap-3 mb-3 text-[1.1rem] font-light">
            <p class="text-center font-body">
              <span class="">like a cream that also has some structure</span>{" "}
              <span class="italic text-gray-600">Yes. Okay.</span>{" "}
              <span class="">It's like it's a particle and a wave.</span>{" "}
              <span class="italic text-gray-600">Yep, yep.</span>{" "}
              <span class="">But like...</span>
            </p>
          </div>

          <div class="flex flex-col items-center gap-3">
            <AudioPlayer src={landing} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
