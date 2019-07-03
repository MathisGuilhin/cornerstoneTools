import external from './../externalModules.js';
import path from './path.js';
import { rotatePoint } from '../util/pointProjector.js';

/**
 * Draw a polygon defined by an array of Points.
 * @public
 * @method drawPolygon
 * @memberof Drawing
 *
 * @param {CanvasRenderingContext2D} context - Target context
 * @param {HTMLElement} element - The DOM Element to draw on
 * @param {Array} points - array of `{ x, y }` coordinates.
 * @param {Object} options - See {@link path}
 * @param {String} [coordSystem='pixel'] - Can be "pixel" (default) or "canvas". The coordinate
 *     system of the points passed in to the function. If "pixel" then cornerstone.pixelToCanvas
 *     is used to transform the points from pixel to canvas coordinates.
 * @param {Number} initialRotation - Rectangle initial rotation
 * @returns {undefined}
 */
export default function(
  context,
  element,
  points,
  options,
  initialRotation = 0.0
) {
  path(context, options, context => {
    points[0] = external.cornerstone.pixelToCanvas(element, points[0]);
    for (let i = 0; i < points.length - 1; i++) {
      points[i + 1] = external.cornerstone.pixelToCanvas(
        element,
        points[i + 1]
      );
      context.moveTo(points[i].x, points[i].y);
      context.lineTo(points[i + 1].x, points[i + 1].y);
    }
    context.moveTo(points[points.length - 1].x, points[points.length - 1].y);
    context.lineTo(points[0].x, points[0].y);
  });
}
