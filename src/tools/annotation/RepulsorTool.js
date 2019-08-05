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
        radius: 40,
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
    const scale = eventData.viewport.scale;
    if (config.center) {
      const context = getNewContext(element.children[0]);
      var options = {};
      draw(context, context => {
        drawCircle(
          context,
          eventData.element,
          config.center,
          config.radius * scale,
          options
        );
      });
    }
  }

  preMouseDownCallback(evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const config = this.configuration;
    config.radius = 40;
    element.addEventListener(EVENTS.MOUSE_DRAG, this._editMouseDragCallback);
    element.addEventListener(EVENTS.MOUSE_UP, this._editMouseUpCallback);
    element.addEventListener('wheel', this._editMouseWheelCallback);
    // Set the mouseLocation handle
    this._getMouseLocation(eventData);
    var toolState = getToolState(evt.currentTarget, 'FreehandMouse');
    if (toolState) {
      for (let size = 0; size < toolState.data.length; size++) {
        toolState.data[size].active = true;
      }
    }
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
    if (toolState) {
      for (let size = 0; size < toolState.data.length; size++) {
        const points = toolState.data[size].handles.points;
        for (let i = 0; i < points.length; i++) {
          var currentDistance =
            Math.pow(points[i].x - center.x, 2) +
            Math.pow(points[i].y - center.y, 2);
          if (currentDistance < Math.pow(radius, 2)) {
            console.log('resize');
            const vDir = {
              x: points[i].x - center.x,
              y: points[i].y - center.y,
            };
            var norme = Math.sqrt(Math.pow(vDir.x, 2) + Math.pow(vDir.y, 2));
            vDir.x /= norme;
            vDir.y /= norme;
            points[i].x = center.x + radius * vDir.x;
            points[i].y = center.y + radius * vDir.y;
            if (i != 0) {
              points[i - 1].lines[0].x = points[i].x;
              points[i - 1].lines[0].y = points[i].y;
            }
          }
        }
      }
    }
    external.cornerstone.updateImage(element);
  }

  _editMouseUpCallback(evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const config = this.configuration;
    config.radius = 0;
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
