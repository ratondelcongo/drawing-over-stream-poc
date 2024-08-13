import type { Coordinate, Point } from "./geometry";

function drawPoint(
	ctx: CanvasRenderingContext2D,
	point: Point,
	color: string | CanvasGradient | CanvasPattern,
) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
	ctx.fill();
	ctx.closePath();
}

function drawLine(
	ctx: CanvasRenderingContext2D,
	point1: Point,
	point2: Point,
	color: string | CanvasGradient | CanvasPattern,
) {
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(point1.x, point1.y);
	ctx.lineTo(point2.x, point2.y);
	ctx.stroke();
	ctx.closePath();
}

// function draw;

function drawPolygon(
	ctx: CanvasRenderingContext2D,
	points: { x: number; y: number }[],
	isClosed: boolean,
) {
	if (points.length < 2) {
		return;
	}

	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y);

	for (let i = 1; i < points.length; i++) {
		ctx.lineTo(points[i].x, points[i].y);
	}

	if (isClosed) {
		ctx.closePath();
	}

	ctx.stroke();
}

function drawCrosshair(
	ctx: CanvasRenderingContext2D,
	coordinate: Coordinate,
	color: string | CanvasGradient | CanvasPattern = "red",
) {
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(coordinate.x, 0);
	ctx.lineTo(coordinate.x, ctx.canvas.height);
	ctx.moveTo(0, coordinate.y);
	ctx.lineTo(ctx.canvas.width, coordinate.y);
	ctx.stroke();
	ctx.closePath();
}

function drawMousePosition(
	ctx: CanvasRenderingContext2D,
	coordinate: Coordinate,
	color: string | CanvasGradient | CanvasPattern = "black",
	font = "10px Arial",
) {
	ctx.fillStyle = color;
	ctx.font = font;
	ctx.fillText(
		`(${coordinate.x}, ${coordinate.y})`,
		coordinate.x + 5,
		coordinate.y - 5,
	);
}

export { drawPoint, drawLine, drawPolygon, drawCrosshair, drawMousePosition };
