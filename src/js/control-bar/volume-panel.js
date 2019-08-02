/**
 * @file volume-control.js
 */
import Component from '../component.js';
import {isPlain} from '../utils/obj';
import * as Events from '../utils/events.js';
import * as Fn from '../utils/fn.js';
import keycode from 'keycode';
import document from 'global/document';

// Required children
import './volume-control/volume-control.js';
import './mute-toggle.js';

/**
 * A Component to contain the MuteToggle and VolumeControl so that
 * they can work together.
 *
 * @extends Component
 */
class VolumePanel extends Component {

  /**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options={}]
   *        The key/value store of player options.
   */
  constructor(player, options = {}) {
    if (typeof options.inline !== 'undefined') {
      options.inline = options.inline;
    } else {
      options.inline = true;
    }

    // pass the inline option down to the VolumeControl as vertical if
    // the VolumeControl is on.
    if (typeof options.volumeControl === 'undefined' || isPlain(options.volumeControl)) {
      options.volumeControl = options.volumeControl || {};
      options.volumeControl.vertical = !options.inline;
    }

    super(player, options);

    this.on(player, ['loadstart'], this.volumePanelState_);
    this.on(this.muteToggle, 'keyup', this.handleKeyPress);
    this.on(this.volumeControl, 'keyup', this.handleVolumeControlKeyUp);
    this.on('keydown', this.handleKeyPress);
    this.on('mouseover', this.handleMouseOver);
    this.on('mouseout', this.handleMouseOut);

    // while the slider is active (the mouse has been pressed down and
    // is dragging) we do not want to hide the VolumeBar
    this.on(this.volumeControl, ['slideractive'], this.sliderActive_);

    this.on(this.volumeControl, ['sliderinactive'], this.sliderInactive_);
  }

  /**
   * Add vjs-slider-active class to the VolumePanel
   *
   * @listens VolumeControl#slideractive
   * @private
   */
  sliderActive_() {
    this.addClass('vjs-slider-active');
  }

  /**
   * Removes vjs-slider-active class to the VolumePanel
   *
   * @listens VolumeControl#sliderinactive
   * @private
   */
  sliderInactive_() {
    this.removeClass('vjs-slider-active');
  }

  /**
   * Adds vjs-hidden or vjs-mute-toggle-only to the VolumePanel
   * depending on MuteToggle and VolumeControl state
   *
   * @listens Player#loadstart
   * @private
   */
  volumePanelState_() {
    // hide volume panel if neither volume control or mute toggle
    // are displayed
    if (this.volumeControl.hasClass('vjs-hidden') && this.muteToggle.hasClass('vjs-hidden')) {
      this.addClass('vjs-hidden');
    }

    // if only mute toggle is visible we don't want
    // volume panel expanding when hovered or active
    if (this.volumeControl.hasClass('vjs-hidden') && !this.muteToggle.hasClass('vjs-hidden')) {
      this.addClass('vjs-mute-toggle-only');
    }
  }

  /**
   * Create the `Component`'s DOM element
   *
   * @return {Element}
   *         The element that was created.
   */
  createEl() {
    let orientationClass = 'vjs-volume-panel-horizontal';

    if (!this.options_.inline) {
      orientationClass = 'vjs-volume-panel-vertical';
    }

    return super.createEl('div', {
      className: `vjs-volume-panel vjs-control ${orientationClass}`
    });
  }

  /**
   * Dispose of the `volume-panel` and all child components.
   */
  dispose() {
    this.handleMouseOut();
    super.dispose();
  }

  /**
   * Handles `keyup` events on the `VolumeControl`, looking for ESC, which closes
   * the volume panel and sets focus on `MuteToggle`.
   *
   * @param {EventTarget~Event} event
   *        The `keyup` event that caused this function to be called.
   *
   * @listens keyup
   */
  handleVolumeControlKeyUp(event) {
    if (keycode.isEventKey(event, 'Esc')) {
      this.muteToggle.focus();
    }
  }

  /**
   * This gets called when a `VolumePanel` gains hover via a `mouseover` event.
   * Turns on listening for `mouseover` event. When they happen it
   * calls `this.handleMouseOver`.
   *
   * @param {EventTarget~Event} event
   *        The `mouseover` event that caused this function to be called.
   *
   * @listens mouseover
   */
  handleMouseOver(event) {
    this.addClass('vjs-hover');
    Events.on(document, 'keyup', Fn.bind(this, this.handleKeyPress));
  }

  /**
   * This gets called when a `VolumePanel` gains hover via a `mouseout` event.
   * Turns on listening for `mouseout` event. When they happen it
   * calls `this.handleMouseOut`.
   *
   * @param {EventTarget~Event} event
   *        The `mouseout` event that caused this function to be called.
   *
   * @listens mouseout
   */
  handleMouseOut(event) {
    this.removeClass('vjs-hover');
    Events.off(document, 'keyup', Fn.bind(this, this.handleKeyPress));
  }

  /**
   * Handles `keydown|keyup` events on the document, looking for ESC, which closes
   * the volume panel.
   *
   * @param {EventTarget~Event} event
   *        The keypress that triggered this event.
   *
   * @listens keydown | keyup
   */
  handleKeyPress(event) {
    if (keycode.isEventKey(event, 'Esc')) {
      this.removeClass('vjs-hover');
    }
  }
}

/**
 * Default options for the `VolumeControl`
 *
 * @type {Object}
 * @private
 */
VolumePanel.prototype.options_ = {
  children: [
    'muteToggle',
    'volumeControl'
  ]
};

Component.registerComponent('VolumePanel', VolumePanel);
export default VolumePanel;
