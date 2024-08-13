"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Coordinate, type Point, Polygon } from "./geometry";
import { drawCrosshair, drawMousePosition } from "./drawer";

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:6001";

export default function Home() {
	const [imgUrl, setImgUrl] = useState("/example.jpg");
	const [imgWidth, setImgWidth] = useState(640);
	const [imgHeight, setImgHeight] = useState(480);

	useEffect(() => {
		const socket = io(SOCKET_URL);
		socket.on(
			"data",
			(data: {
				frame_id: string;
				frame: string;
				frame_width: number;
				frame_height: number;
			}) => {
				const url = `data:image/jpeg;base64,${data.frame}`;
				setImgUrl(url);
				setImgWidth(data.frame_width);
				setImgHeight(data.frame_height);
			},
		);

		return () => {
			socket.disconnect();
		};
	}, []);

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [drawing, setDrawing] = useState(false);
	const [polygons, setPolygons] = useState<Polygon[]>([]);

	const [showCrosshair, setShowCrosshair] = useState(true);
	const [showMousePosition, setShowMousePosition] = useState(true);

	const [clickedPoint, setClickedPoint] = useState<{
		polygonIndex: number;
		pointIndex: number;
	} | null>(null);

	const addPolygon = () => {
		console.log("Now you can draw a polygon");

		setDrawing(true);
		setPolygons([...polygons, new Polygon()]);
	};

	const reset = () => {
		console.log("Resetting...");

		const canvas = canvasRef.current as HTMLCanvasElement;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		setDrawing(false);
		setPolygons([]);
	};

	const coordinateIsCloseToPolygonPoint = (coordinate: Coordinate) => {
		for (let i = 0; i < polygons.length; i++) {
			const polygon = polygons[i];
			for (let j = 0; j < polygon.points.length; j++) {
				if (coordinate.isNearPoint(polygon.points[j])) {
					return { polygonIndex: i, pointIndex: j };
				}
			}
		}

		return { polygonIndex: -1, pointIndex: -1 };
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current as HTMLCanvasElement;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const rect = canvas.getBoundingClientRect();
		// const x = e.clientX - rect.left;
		// const y = e.clientY - rect.top;
		const coordinate = new Coordinate(
			e.clientX - rect.left,
			e.clientY - rect.top,
		);

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (clickedPoint) {
			const { polygonIndex, pointIndex } = clickedPoint;
			const currentPolygon = polygons[polygonIndex];
			const currentPoint = currentPolygon.points[pointIndex];
			currentPoint.x = coordinate.x;
			currentPoint.y = coordinate.y;
		}

		if (polygons.length > 0) {
			for (const polygon of polygons) {
				polygon.points.length > 0 && polygon.draw(ctx);
			}
		}

		if (clickedPoint) {
			return;
		}

		const { polygonIndex, pointIndex } =
			coordinate.findNearesPolygonPoint(polygons);

		if (polygonIndex !== -1 && pointIndex !== -1) {
			if (pointIndex === 0 && !polygons[polygonIndex].isClosed) {
				const currentPolygon = polygons[polygonIndex];
				const currentPoint = currentPolygon.points[pointIndex];

				ctx.fillStyle = "red";
				ctx.beginPath();
				ctx.arc(currentPoint.x, currentPoint.y, 5, 0, 2 * Math.PI);
				ctx.fill();
				ctx.closePath();
			}

			canvas.style.cursor = "pointer";
		} else {
			canvas.style.cursor = "default";
		}

		if (showCrosshair) {
			drawCrosshair(ctx, coordinate, "rgba(0, 0, 0, 0.5)");
		}

		if (showMousePosition) {
			drawMousePosition(ctx, coordinate, "black");
		}
	};

	const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current as HTMLCanvasElement;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const rect = canvas.getBoundingClientRect();
		const coordinate = new Coordinate(
			e.clientX - rect.left,
			e.clientY - rect.top,
		);

		const { polygonIndex, pointIndex } =
			coordinate.findNearesPolygonPoint(polygons);

		if (polygonIndex !== -1 && pointIndex !== -1) {
			setClickedPoint({ polygonIndex, pointIndex });
		}
	};

	const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
		setClickedPoint(null);
	};

	const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		console.log("Click");
		if (!drawing) return;

		const canvas = canvasRef.current as HTMLCanvasElement;
		const rect = canvas.getBoundingClientRect();
		const coordinate = new Coordinate(
			e.clientX - rect.left,
			e.clientY - rect.top,
		);

		const { polygonIndex, pointIndex } =
			coordinateIsCloseToPolygonPoint(coordinate);

		if (polygonIndex !== -1 && pointIndex !== -1 && pointIndex !== 0) {
			return;
		}

		const currentPolygon = polygons[polygons.length - 1];

		if (
			currentPolygon.points.length > 0 &&
			coordinate.isNearPoint(currentPolygon.getFirstPoint())
		) {
			if (currentPolygon.points.length > 2) {
				currentPolygon.close();
			}
		} else {
			currentPolygon.addPoint(coordinate as Point);
		}

		if (currentPolygon.isClosed) {
			setDrawing(false);
		}
	};

	const handleCanvasKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {};

	const handleCanvasKeyUp = (e: React.KeyboardEvent<HTMLCanvasElement>) => {};

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
				<button
					type="button"
					onClick={addPolygon}
					disabled={drawing}
					style={{
						backgroundColor: drawing ? "#6c757d" : "#007BFF",
						color: "white",
						border: "none",
						padding: "10px 20px",
						borderRadius: "5px",
						cursor: "pointer",
						fontSize: "16px",
						transition: drawing ? "" : "background-color 0.3s ease",
					}}
					onMouseOver={(e) => {
						e.currentTarget.style.backgroundColor = drawing
							? "#6c757d"
							: "#0056b3";
					}}
					onMouseOut={(e) => {
						e.currentTarget.style.backgroundColor = drawing
							? "#6c757d"
							: "#007BFF";
					}}
					onFocus={(e) => {
						e.currentTarget.style.backgroundColor = drawing
							? "#6c757d"
							: "#0056b3";
					}}
					onBlur={(e) => {
						e.currentTarget.style.backgroundColor = drawing
							? "#6c757d"
							: "#007BFF";
					}}
				>
					Dibujar Polígono
				</button>
				<button
					type="button"
					onClick={reset}
					style={{
						backgroundColor: "#DC3545",
						color: "white",
						border: "none",
						padding: "10px 20px",
						borderRadius: "5px",
						cursor: "pointer",
						fontSize: "16px",
						transition: "background-color 0.3s ease",
					}}
					onMouseOver={(e) => {
						e.currentTarget.style.backgroundColor = "#a71d2a";
					}}
					onMouseOut={(e) => {
						e.currentTarget.style.backgroundColor = "#DC3545";
					}}
					onFocus={(e) => {
						e.currentTarget.style.backgroundColor = "#a71d2a";
					}}
					onBlur={(e) => {
						e.currentTarget.style.backgroundColor = "#DC3545";
					}}
				>
					Reiniciar
				</button>
				<div className="checkbox-container">
					<input
						type="checkbox"
						name="showCrosshair"
						id="showCrosshair"
						defaultChecked
						onChange={(e) => {
							setShowCrosshair(e.target.checked);
						}}
					/>
					<label htmlFor="showCrosshair">Mostrar crosshair</label>
				</div>
				<div className="checkbox-container">
					<input
						type="checkbox"
						name="showMousePosition"
						id="showMousePosition"
						defaultChecked
						onChange={(e) => {
							setShowMousePosition(e.target.checked);
						}}
					/>
					<label htmlFor="showMousePosition">Mostrar posición del mouse</label>
				</div>
			</div>
			<div className="relative">
				<canvas
					ref={canvasRef}
					onMouseMove={handleMouseMove}
					onMouseDown={handleMouseDown}
					onMouseUp={handleMouseUp}
					onClick={handleCanvasClick}
					onKeyDown={handleCanvasKeyDown}
					onKeyUp={handleCanvasKeyUp}
					width={imgWidth}
					height={imgHeight}
					style={{ border: "1px solid black" }}
					className="absolute top-0 left-0"
				/>
				<img src={imgUrl} width={imgWidth} height={imgHeight} alt="Frame" />
			</div>
		</main>
	);
}
