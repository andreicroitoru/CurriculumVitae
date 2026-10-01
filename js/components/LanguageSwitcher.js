import { SpringAnimation } from "../utils/SpringAnimation.js";

const DRAG_START_THRESHOLD_PX = 4;
const MOMENTUM_DECELERATION_RATE = 0.998;
const MOMENTUM_STRENGTH = 0.2; // a full flick projection is way too strong for a 50px track

// iOS-style segmented control for RO / EN.
// You can tap either side, or grab the thumb and drag / flick it.
export class LanguageSwitcher {
  constructor(containerElement, { initialLanguage, onLanguageChange }) {
    this.containerElement = containerElement;
    this.thumbElement = containerElement.querySelector(".languageSwitch__thumb");
    this.optionButtons = [...containerElement.querySelectorAll(".languageSwitch__option")];

    this.selectedLanguage = initialLanguage;
    this.onLanguageChange = onLanguageChange;
    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.dragState = null;

    this.thumbSpring = new SpringAnimation({
      responseInSeconds: 0.35,
      onUpdate: (positionX) => {
        this.thumbElement.style.transform = `translateX(${positionX}px)`;
      },
    });

    this.bindEvents();
    this.thumbSpring.setValue(this.getThumbPositionFor(initialLanguage));
    this.updateAriaState();
  }

  // How far the thumb can travel = half of the track minus the 2px padding
  get maxThumbOffset() {
    return this.containerElement.clientWidth / 2 - 2;
  }

  getThumbPositionFor(language) {
    return language === "en" ? this.maxThumbOffset : 0;
  }

  bindEvents() {
    this.containerElement.addEventListener("pointerdown", (event) => this.handlePointerDown(event));
    this.containerElement.addEventListener("pointermove", (event) => this.handlePointerMove(event));
    this.containerElement.addEventListener("pointerup", (event) => this.handlePointerUp(event));
    this.containerElement.addEventListener("pointercancel", (event) => this.handlePointerUp(event));
    this.containerElement.addEventListener("keydown", (event) => this.handleKeyDown(event));

    // event.detail === 0 means the click came from the keyboard (Enter / Space),
    // mouse and touch are already handled by the pointer events above
    this.optionButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        if (event.detail === 0) this.selectLanguage(button.dataset.language);
      });
    });

    window.addEventListener("resize", () => {
      this.thumbSpring.setValue(this.getThumbPositionFor(this.selectedLanguage));
    });
  }

  handlePointerDown(event) {
    this.containerElement.setPointerCapture(event.pointerId);
    this.thumbSpring.stop();

    this.dragState = {
      pointerStartX: event.clientX,
      thumbStartX: this.thumbSpring.currentValue,
      hasMoved: false,
      recentPointerPositions: [{ x: event.clientX, time: event.timeStamp }],
    };
  }

  handlePointerMove(event) {
    if (!this.dragState) return;

    const pointerDeltaX = event.clientX - this.dragState.pointerStartX;

    // Small threshold so a slightly shaky tap doesn't count as a drag
    if (!this.dragState.hasMoved && Math.abs(pointerDeltaX) < DRAG_START_THRESHOLD_PX) return;

    this.dragState.hasMoved = true;
    this.containerElement.classList.add("isDragging");

    const nextThumbX = this.applyRubberBand(this.dragState.thumbStartX + pointerDeltaX);
    this.thumbSpring.currentValue = nextThumbX;
    this.thumbSpring.onUpdate(nextThumbX);

    // Keep only the last few samples, we only need them for the release velocity
    this.dragState.recentPointerPositions.push({ x: event.clientX, time: event.timeStamp });
    if (this.dragState.recentPointerPositions.length > 5) {
      this.dragState.recentPointerPositions.shift();
    }
  }

  handlePointerUp(event) {
    if (!this.dragState) return;

    const finishedDrag = this.dragState;
    this.dragState = null;
    this.containerElement.classList.remove("isDragging");

    // Plain tap: pick whichever half was pressed
    if (!finishedDrag.hasMoved) {
      const containerRect = this.containerElement.getBoundingClientRect();
      const tappedRightHalf = event.clientX - containerRect.left > containerRect.width / 2;
      this.selectLanguage(tappedRightHalf ? "en" : "ro", 0);
      return;
    }

    const releaseVelocity = this.calculateReleaseVelocity(finishedDrag.recentPointerPositions);

    // Decide the side based on where the thumb *would* land, not where it was let go,
    // so a quick flick to the right selects EN even if it was released on the left half
    const projectedThumbX =
      this.thumbSpring.currentValue +
      (releaseVelocity / 1000) * (MOMENTUM_DECELERATION_RATE / (1 - MOMENTUM_DECELERATION_RATE)) * MOMENTUM_STRENGTH;

    this.selectLanguage(projectedThumbX > this.maxThumbOffset / 2 ? "en" : "ro", releaseVelocity);
  }

  handleKeyDown(event) {
    if (event.key === "ArrowRight") {
      this.selectLanguage("en");
      this.optionButtons[1].focus();
    }
    if (event.key === "ArrowLeft") {
      this.selectLanguage("ro");
      this.optionButtons[0].focus();
    }
  }

  calculateReleaseVelocity(pointerPositions) {
    const firstSample = pointerPositions[0];
    const lastSample = pointerPositions[pointerPositions.length - 1];
    const elapsedSeconds = (lastSample.time - firstSample.time) / 1000;

    if (elapsedSeconds <= 0) return 0;
    return (lastSample.x - firstSample.x) / elapsedSeconds; // px per second
  }

  // Past the edges the thumb still follows the finger, just with growing resistance
  applyRubberBand(positionX) {
    const maxOffset = this.maxThumbOffset;
    const resistance = 0.55;
    const dampen = (overflow) => (overflow * maxOffset * resistance) / (maxOffset + resistance * Math.abs(overflow));

    if (positionX < 0) return -dampen(-positionX);
    if (positionX > maxOffset) return maxOffset + dampen(positionX - maxOffset);
    return positionX;
  }

  selectLanguage(language, releaseVelocity) {
    const targetX = this.getThumbPositionFor(language);

    if (this.prefersReducedMotion) {
      this.thumbSpring.setValue(targetX);
    } else {
      this.thumbSpring.animateTo(targetX, releaseVelocity);
    }

    if (language === this.selectedLanguage) return;

    this.selectedLanguage = language;
    this.updateAriaState();
    this.onLanguageChange(language);
  }

  updateAriaState() {
    this.optionButtons.forEach((button) => {
      button.setAttribute("aria-checked", String(button.dataset.language === this.selectedLanguage));
    });
  }
}
