export class Point {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	draw(
		ctx: CanvasRenderingContext2D,
		color: string | CanvasGradient | CanvasPattern = "red",
	) {
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
		ctx.fill();
		ctx.closePath();
	}
}

export class Polygon {
	points: Point[];
	isClosed: boolean;

	constructor(points: Point[] = [], isClosed = false) {
		this.points = points;
		this.isClosed = isClosed;
	}

	addPoint(point: Point) {
		if (this.isClosed) {
			return;
		}

		if (
			this.points.length > 2 &&
			(this.getFirstPoint().x - point.x) ** 2 +
				(this.getFirstPoint().y - point.y) ** 2 <
				100
		) {
			this.close();
			return;
		}

		this.points.push(point);
	}

	getPoints() {
		return this.points;
	}

	getLength() {
		return this.points.length;
	}

	getFirstPoint() {
		return this.points[0];
	}

	getLastPoint() {
		return this.points[this.points.length - 1];
	}

	close() {
		this.isClosed = true;
	}

	draw(ctx: CanvasRenderingContext2D) {
		this.points.forEach((point: Point, index) => {
			point.draw(ctx, "red");
		});
		!this.isClosed && this.points[0].draw(ctx, "green");

		ctx.strokeStyle = "blue";
		ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(this.points[0].x, this.points[0].y);
		this.points.forEach((point, index) => {
			if (index === 0) {
				return;
			}
			ctx.lineTo(point.x, point.y);
		});
		this.isClosed && ctx.lineTo(this.points[0].x, this.points[0].y);
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
	}
}
