import EVENTS from './../../events.js';
import external from './../../externalModules.js';
import BaseTool from './../base/BaseTool.js';
// State
import {
  addToolState,
  getToolState,
  removeToolState,
} from './../../stateManagement/toolState.js';
import toolStyle from './../../stateManagement/toolStyle.js';
import toolColors from './../../stateManagement/toolColors.js';
import { state } from '../../store/index.js';
import triggerEvent from '../../util/triggerEvent.js';
// Manipulators
import { moveHandleNearImagePoint } from '../../util/findAndMoveHelpers.js';
// Implementation Logic
import pointInsideBoundingBox from '../../util/pointInsideBoundingBox.js';
import calculateSUV from '../../util/calculateSUV.js';
import numbersWithCommas from '../../util/numbersWithCommas.js';

// Drawing
import {
  getNewContext,
  draw,
  drawJoinedLines,
  drawCircle,
  drawPolygon,
} from '../../drawing/index.js';
import drawLinkedTextBox from '../../drawing/drawLinkedTextBox.js';
import drawHandles from '../../drawing/drawHandles.js';
import { clipToBox } from '../../util/clip.js';
import { hideToolCursor, setToolCursor } from '../../store/setToolCursor.js';
import { freehandMouseCursor } from '../cursors/index.js';
import freehandUtils from '../../util/freehand/index.js';
import { getLogger } from '../../util/logger.js';
import throttle from '../../util/throttle';
import {
  newImageIdSpecificToolStateManager,
  globalImageIdSpecificToolStateManager,
} from '../../stateManagement/imageIdSpecificStateManager.js';

const logger = getLogger('tools:annotation:RepulsorTool');

/**
 * @public
 * @class RepulsorTool
 * @memberof Tools.Annotation
 * @classdesc Tool for tuning ROI's
 * @extends Tools.Base.BaseAnnotationTool
 */
export default class RepulsorTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'Repulsor',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {},
    };
    super(props, defaultProps);
    this._getMouseLocation = this._getMouseLocation.bind(this);
    this._editMouseDragCallback = this._editMouseDragCallback.bind(this);
  }

  renderToolData(evt) {
    console.log('renderRepulsor');

    const eventData = evt.detail;
    const element = eventData.element;
    const config = this.configuration;
    element.addEventListener(EVENTS.MOUSE_DRAG, this._editMouseDragCallback);
    if (config.center) {
      console.log('drawing');
      const context = getNewContext(element.children[0]);
      var options = {};
      console.log(config.center);
      var toolState = getToolState(evt.currentTarget, 'FreehandMouse');
      draw(context, context => {
        drawCircle(context, eventData.element, config.center, 50, options);
      });
    }
  }

  preMouseDownCallback(evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    element.addEventListener(EVENTS.MOUSE_DRAG, this._editMouseDragCallback);
    // Set the mouseLocation handle
    //this._getMouseLocation(eventData);
    const config = this.configuration;

    if (!config.center) {
      config.center = {};
    }

    config.center.x = eventData.currentPoints.image.x;
    config.center.y = eventData.currentPoints.image.y;
    external.cornerstone.updateImage(element);
  }

  _editMouseDragCallback(evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    // Set the mouseLocation handle
    //this._getMouseLocation(eventData);
    const config = this.configuration;

    if (!config.center) {
      config.center = {};
    }

    config.center.x = eventData.currentPoints.image.x;
    config.center.y = eventData.currentPoints.image.y;
    external.cornerstone.updateImage(element);
  }

  /**
   * Gets the current mouse location and stores it in the configuration object.
   *
   * @private
   * @param {Object} eventData The data assoicated with the event.
   * @returns {undefined}
   */
  _getMouseLocation(eventData) {
    // Set the mouseLocation handle
    const config = this.configuration;

    if (!config.center) {
      config.center = {};
    }

    config.center.x = eventData.currentPoints.image.x;
    config.center.y = eventData.currentPoints.image.y;
  }

  fireModifiedEvent(element, measurementData) {
    const eventType = EVENTS.MEASUREMENT_MODIFIED;
    const eventData = {
      toolName: this.name,
      element,
      measurementData,
    };

    triggerEvent(element, eventType, eventData);
  }
}
