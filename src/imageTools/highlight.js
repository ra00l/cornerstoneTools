var cornerstoneTools = (function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "highlight";

    ///////// BEGIN ACTIVE TOOL ///////
    function createNewMeasurement(mouseEventData)
    {
        //if already a highlight measurement, creating a new one will be useless
        var existingToolData = cornerstoneTools.getToolState(mouseEventData.event.currentTarget, toolType);
        if (existingToolData && existingToolData.data && existingToolData.data.length > 0)
            return;
    
        // create the measurement data for this tool with the end handle activated
        var measurementData = {
            visible : true,
            handles : {
                start : {
                    x : mouseEventData.currentPoints.image.x,
                    y : mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: false
                },
                end: {
                    x : mouseEventData.currentPoints.image.x,
                    y : mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: true
                }
            }
        };

        return measurementData;
    }
    ///////// END ACTIVE TOOL ///////

    function pointInsideRect(data, coords)
    {
        var rect = {
            left : Math.min(data.handles.start.x, data.handles.end.x),
            top : Math.min(data.handles.start.y, data.handles.end.y),
            width : Math.abs(data.handles.start.x - data.handles.end.x),
            height : Math.abs(data.handles.start.y - data.handles.end.y)
        };

        var insideBox = false;
        if ((coords.x >= rect.left && coords.x <= (rect.left + rect.width)) &&
            coords.y >= rect.top && coords.y <= (rect.top + rect.height)) {
            insideBox = true;
        }
        return insideBox;
    }

    function pointNearTool(data, coords)
    {
        var rect = {
            left : Math.min(data.handles.start.x, data.handles.end.x),
            top : Math.min(data.handles.start.y, data.handles.end.y),
            width : Math.abs(data.handles.start.x - data.handles.end.x),
            height : Math.abs(data.handles.start.y - data.handles.end.y)
        };

        var distanceToPoint = cornerstoneMath.rect.distanceToPoint(rect, coords);
        return (distanceToPoint < 5);
    }

    ///////// BEGIN IMAGE RENDERING ///////

    function onImageRendered(e, eventData) {

        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if(toolData === undefined) {
            return;
        }

        // we have tool data for this elemen
        var context = eventData.canvasContext.canvas.getContext("2d");
        cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, context);

        var color;

        context.save();
        var data = toolData.data[0];
        if (!data) return;

        if (pointNearTool(data, cornerstoneTools.toolCoordinates.getCoords())) {
            data.active = true;
            color = cornerstoneTools.toolColors.getActiveColor();
        } else {
            data.active = false;
            color = cornerstoneTools.toolColors.getToolColor();
        }

        //differentiate the color of activation tool
        var rect = {
            left : Math.min(data.handles.start.x, data.handles.end.x),
            top : Math.min(data.handles.start.y, data.handles.end.y),
            width : Math.abs(data.handles.start.x - data.handles.end.x),
            height : Math.abs(data.handles.start.y - data.handles.end.y)
        };

        // draw dark fill outside the rectangle
        context.beginPath();
        context.strokeStyle = "transparent";

        context.save();
        context.setTransform(1,0,0,1,0,0);
        context.rect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight);
        context.restore();

        context.rect(rect.width + rect.left, rect.top, -rect.width, rect.height);
        context.restore();
        context.stroke();
        context.fillStyle = "rgba(0,0,0,0.7)";
        context.fill();
        context.closePath();

        // draw dashed stroke rectangle
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 2.5 / eventData.viewport.scale;
        context.setLineDash([4]);
        context.strokeRect(rect.left, rect.top, rect.width, rect.height);
        context.restore();
        
        // draw the handles last, so they will be on top of the overlay
        context.beginPath();
        cornerstoneTools.drawHandles(context, eventData, data.handles, color);
        context.stroke();
    }
    ///////// END IMAGE RENDERING ///////


    // module exports
    var preventHandleOutsideImage = true;

    cornerstoneTools.highlight = cornerstoneTools.mouseButtonRectangleTool({
        createNewMeasurement : createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool : pointNearTool,
        pointInsideRect: pointInsideRect,
        toolType : toolType
    }, preventHandleOutsideImage);
    cornerstoneTools.highlightTouch = cornerstoneTools.touchTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        pointInsideRect: pointInsideRect,
        toolType: toolType
    }, preventHandleOutsideImage);

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));
