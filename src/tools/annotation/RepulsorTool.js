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
      configuration: {
        radius: 50,
      },
    };
    super(props, defaultProps);
    this._getMouseLocation = this._getMouseLocation.bind(this);
    this._editMouseDragCallback = this._editMouseDragCallback.bind(this);
    this._editMouseUpCallback = this._editMouseUpCallback.bind(this);
    this._editMouseWheelCallback = this._editMouseWheelCallback.bind(this);
  }

  renderToolData(evt) {
    console.log('renderRepulsor');

    const eventData = evt.detail;
    const element = eventData.element;
    const config = this.configuration;
    if (config.center) {
      console.log('drawing');
      const context = getNewContext(element.children[0]);
      var options = {};
      console.log(config.center);
      draw(context, context => {
        drawCircle(
          context,
          eventData.element,
          config.center,
          config.radius,
          options
        );
      });
    }
  }

  preMouseDownCallback(evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    element.addEventListener(EVENTS.MOUSE_DRAG, this._editMouseDragCallback);
    element.addEventListener(EVENTS.MOUSE_UP, this._editMouseUpCallback);
    element.addEventListener('wheel', this._editMouseWheelCallback);
    // Set the mouseLocation handle
    this._getMouseLocation(eventData);
    external.cornerstone.updateImage(element);
  }

  _editMouseDragCallback(evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const config = this.configuration;
    const center = config.center;
    const radius = config.radius;
    // Set the mouseLocation handle
    this._getMouseLocation(eventData);
    var toolState = getToolState(evt.currentTarget, 'FreehandMouse');
    console.log('toolState', toolState);
    if (toolState) {
      const points = toolState.data[0].handles.points;
      points.forEach(function(point) {
        console.log(
          Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2) <
            Math.pow(radius, 2)
        );
      });
    }
    external.cornerstone.updateImage(element);
  }

  _editMouseUpCallback(evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const config = this.configuration;
    config.center = undefined;
    config.radius = 50;
    element.removeEventListener(EVENTS.MOUSE_DRAG, this._editMouseDragCallback);
    element.removeEventListener(EVENTS.MOUSE_UP, this._editMouseUpCallback);
    element.removeEventListener('wheel', this._editMouseWheelCallback);
    external.cornerstone.updateImage(eventData.element);
  }

  _editMouseWheelCallback(evt) {
    const config = this.configuration;
    if (evt.deltaY < 0) {
      config.radius += 10;
    }
    if (evt.deltaY > 0) {
      if (config.radius > 10) {
        config.radius -= 10;
      }
    }
    //We get the element that is stored in the wheelevt in path to renderToolData
    const element = evt.path[1];
    external.cornerstone.updateImage(evt.path[1]);
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
}
