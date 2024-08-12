"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Point, Polygon } from "./geometry";

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

	const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current as HTMLCanvasElement;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (polygons.length > 0) {
			for (const polygon of polygons) {
				polygon.points.length > 0 && polygon.draw(ctx);
			}
		}

		if (showCrosshair) {
			ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvas.height);
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
			ctx.stroke();
		}

		if (showMousePosition) {
			ctx.fillStyle = "black";
			ctx.font = "12px Arial";
			ctx.fillText(`(${x}, ${y})`, x + 10, y - 10);
		}
	};

	const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		console.log("Click");
		if (!drawing) return;

		const canvas = canvasRef.current as HTMLCanvasElement;
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const currentPolygon = polygons[polygons.length - 1];
		currentPolygon.addPoint(new Point(x, y));

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
