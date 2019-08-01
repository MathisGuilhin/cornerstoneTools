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

const {
  insertOrDelete,
  freehandArea,
  calculateFreehandStatistics,
  freehandIntersect,
  FreehandHandleData,
} = freehandUtils;

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
    };
    super(props, defaultProps);
  }

  renderToolData(evt) {
    console.log('renderRepulsor');
  }

  preMouseDownCallback(evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    element.addEventListener(EVENTS.MOUSE_DRAG, this._editMouseDragCallback);
    const context = getNewContext(element.children[0]);
    var center = {
      x: eventData.currentPoints.image.x,
      y: eventData.currentPoints.image.y,
    };
    var options = {};

    var toolState = getToolState(evt.currentTarget, 'FreehandMouse');
    draw(context, context => {
      drawCircle(context, eventData.element, center, 50, options);
    });
  }

  _editMouseDragCallback(evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    element.addEventListener(EVENTS.MOUSE_DRAG, this._editMouseDragCallback);
    const context = getNewContext(element.children[0]);
    var center = {
      x: eventData.currentPoints.image.x,
      y: eventData.currentPoints.image.y,
    };
    var options = {};

    var toolState = getToolState(evt.currentTarget, 'FreehandMouse');
    draw(context, context => {
      drawCircle(context, eventData.element, center, 50, options);
    });
  }
}
