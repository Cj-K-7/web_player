class Player {
  private loopingStartEvent = new CustomEvent("loopingStart");
  private loopedEvent = new CustomEvent("looped");
  private loopingEndEvent = new CustomEvent("loopingEnd");
  private waitingEvent = new CustomEvent("waiting");
  element: HTMLVideoElement;
  stopped = true;
  isActive = false;
  isLooping: boolean = false;
  escapeLooping: boolean = false;
  isWaiting: boolean = false;
  escapeWaiting: boolean = false;

  constructor() {
    this.element = document.createElement("video");
    this.element.id = "player";
    this.element.style.width = "100%";
    this.element.style.height = "100%";

    this.element.addEventListener("loopingStart", () => {
      this.isLooping = true;
    });
    this.element.addEventListener("loopingEnd", () => {
      this.isLooping = false;
      this.escapeLooping = false;
    });

    this.element.addEventListener("waiting", () => {
      this.isWaiting = true;
      this.escapeLooping = false;
    });
    this.element.style.backgroundColor = "black";
    document.body.appendChild(this.element);

    return this;
  }

  setSrc(src: string) {
    this.element.src = src;
  }

  async activate() {
    // this.style.opacity = "1";
  }

  async deactivate() {}

  async startCheckUserLeave() {}

  async play(): Promise<void> {
    if (this.isWaiting) {
      this.isWaiting = false;
    }
    this.stopped = false;
    return await this.element.play();
  }

  pause(): void {
    return this.element.pause();
  }

  async stop(): Promise<void> {
    this.stopped = true;
  }

  setIsLoop(isLoop: boolean) {
    this.isLooping = isLoop;
  }

  async looping(start: number, end: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (end <= start) {
        reject(`end_time:${start} must be greater than start_time:${end}`);
        return;
      }
      const callback = () => {
        if (this.escapeLooping || !this.isActive) {
          this.element.currentTime = end / 1000;
          this.element.dispatchEvent(this.loopingEndEvent);
          resolve();
          return;
        }
        //set isLooping state true
        if (this.element.currentTime * 1000 >= start) {
          if (!this.isLooping) {
            this.element.dispatchEvent(this.loopingStartEvent);
          }
        }
        //playback time is greater then range
        if (this.element.currentTime * 1000 >= end) {
          this.element.currentTime = start / 1000;
          this.element.dispatchEvent(this.loopedEvent);
        }
        window.requestAnimationFrame(callback);
      };
      window.requestAnimationFrame(callback);
    });
  }

  stopLooping() {
    this.escapeLooping = true;
  }

  async waiting(wait_time: number, until?: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (until && until <= wait_time) {
        reject(
          `until_time:${until} must be greater than wait_time:${wait_time}`
        );
        return;
      }
      const callback = () => {
        if (this.escapeWaiting) {
          this.escapeWaiting = false;
          this.element.currentTime = wait_time / 1000;
          this.element.dispatchEvent(this.waitingEvent);
          resolve();
          return;
        }
        if (this.element.currentTime * 1000 >= wait_time || !this.isActive) {
          this.pause();
          this.element.dispatchEvent(this.waitingEvent);
          resolve();
          return;
        }

        window.requestAnimationFrame(callback);
      };
      window.requestAnimationFrame(callback);
    });
  }

  stopWating() {
    this.escapeWaiting = true;
  }
}

export default Player;
