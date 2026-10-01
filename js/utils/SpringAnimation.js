// Tiny 1D spring, used for the language switch thumb.
//
// Why not a CSS transition? Because a spring can be retargeted mid-flight
// and keeps its current velocity, so if you tap RO/EN quickly the thumb
// changes direction smoothly instead of jumping back to the start.

export class SpringAnimation {
  constructor({ responseInSeconds = 0.35, onUpdate }) {
    // Critically damped (damping ratio = 1): no overshoot, settles as fast as possible.
    const angularFrequency = (2 * Math.PI) / responseInSeconds;
    this.stiffness = angularFrequency ** 2;
    this.damping = 2 * angularFrequency;

    this.onUpdate = onUpdate;
    this.currentValue = 0;
    this.velocity = 0;
    this.targetValue = 0;
    this.animationFrameId = null;
    this.lastFrameTime = 0;

    this.tick = this.tick.bind(this);
  }

  // Jump straight to a value, no animation (initial render, resize, drag).
  setValue(value) {
    this.stop();
    this.currentValue = value;
    this.targetValue = value;
    this.velocity = 0;
    this.onUpdate(value);
  }

  // Always animates from wherever the thumb is right now.
  animateTo(targetValue, initialVelocity = this.velocity) {
    this.targetValue = targetValue;
    this.velocity = initialVelocity;

    if (this.animationFrameId === null) {
      this.lastFrameTime = performance.now();
      this.animationFrameId = requestAnimationFrame(this.tick);
    }
  }

  stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  tick(frameTime) {
    // Clamp delta so a backgrounded tab doesn't make the thumb teleport
    const deltaSeconds = Math.min(0.032, (frameTime - this.lastFrameTime) / 1000);
    this.lastFrameTime = frameTime;

    const displacement = this.currentValue - this.targetValue;
    const acceleration = -this.stiffness * displacement - this.damping * this.velocity;

    this.velocity += acceleration * deltaSeconds;
    this.currentValue += this.velocity * deltaSeconds;

    const hasSettled = Math.abs(this.velocity) < 2 && Math.abs(this.currentValue - this.targetValue) < 0.3;
    if (hasSettled) {
      this.currentValue = this.targetValue;
      this.velocity = 0;
      this.animationFrameId = null;
      this.onUpdate(this.currentValue);
      return;
    }

    this.onUpdate(this.currentValue);
    this.animationFrameId = requestAnimationFrame(this.tick);
  }
}
