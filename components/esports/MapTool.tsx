"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Undo2, Redo2, Trash2, Download, MousePointer2, Pencil, Eraser, Circle, ArrowRight, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const MAP_SIZE = 1024;

type TeamColor = "blue" | "red";
type Tool = "select" | "draw" | "arrow" | "fight" | "area" | "erase";

interface Pt { x: number; y: number; }

interface PlayerToken { id: string; type: "player"; x: number; y: number; team: TeamColor; role: string; }
interface PathEl     { id: string; type: "path";   points: Pt[]; color: string; width: number; }
interface ArrowEl    { id: string; type: "arrow";  x1: number; y1: number; x2: number; y2: number; color: string; }
interface FightEl    { id: string; type: "fight";  x: number; y: number; }
interface AreaEl     { id: string; type: "area";   cx: number; cy: number; r: number; color: string; }

type MapElement = PlayerToken | PathEl | ArrowEl | FightEl | AreaEl;

const TEAM_COLORS: Record<TeamColor, string> = { blue: "#3B82F6", red: "#EF4444" };
const ROLES = ["T", "J", "M", "B", "S"];
const ROLE_LABELS: Record<string, string> = { T: "Top", J: "Jungle", M: "Mid", B: "Bot", S: "Suporte" };

function uid() { return Math.random().toString(36).slice(2); }

function getSVGCoords(e: React.MouseEvent<SVGSVGElement | SVGElement>, svgEl: SVGSVGElement): Pt {
  const rect = svgEl.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * MAP_SIZE,
    y: ((e.clientY - rect.top) / rect.height) * MAP_SIZE,
  };
}

function pointsToD(points: Pt[]): string {
  if (points.length < 2) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
}

function SwordsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
      <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
      <line x1="5" y1="14" x2="9" y2="18" />
      <line x1="7" y1="21" x2="9" y2="19" />
      <line x1="3" y1="19" x2="5" y2="21" />
    </svg>
  );
}

export default function MapTool() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/esports/logout", { method: "POST" });
    router.push("/esports/login");
    router.refresh();
  }
  const [elements, setElements] = useState<MapElement[]>([]);
  const [history, setHistory] = useState<MapElement[][]>([[]]);
  const [histIdx, setHistIdx] = useState(0);
  const [tool, setTool] = useState<Tool>("select");
  const [team, setTeam] = useState<TeamColor>("blue");
  const [drawing, setDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Pt[]>([]);
  const [arrowStart, setArrowStart] = useState<Pt | null>(null);
  const [areaStart, setAreaStart] = useState<Pt | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Pt>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const pushHistory = useCallback((els: MapElement[]) => {
    setHistory(h => {
      const next = h.slice(0, histIdx + 1);
      next.push(els);
      setHistIdx(next.length - 1);
      return next;
    });
    setElements(els);
  }, [histIdx]);

  const undo = () => {
    if (histIdx === 0) return;
    const ni = histIdx - 1;
    setHistIdx(ni);
    setElements(history[ni]);
  };

  const redo = () => {
    if (histIdx >= history.length - 1) return;
    const ni = histIdx + 1;
    setHistIdx(ni);
    setElements(history[ni]);
  };

  const addPlayer = (role: string) => {
    const el: PlayerToken = { id: uid(), type: "player", x: MAP_SIZE / 2, y: MAP_SIZE / 2, team, role };
    pushHistory([...elements, el]);
  };

  // ── Mouse handlers ──────────────────────────────────────────────
  const onSVGMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const pt = getSVGCoords(e, svgRef.current);

    if (tool === "draw") {
      setDrawing(true);
      setCurrentPath([pt]);
    } else if (tool === "arrow") {
      if (!arrowStart) {
        setArrowStart(pt);
      } else {
        const el: ArrowEl = { id: uid(), type: "arrow", x1: arrowStart.x, y1: arrowStart.y, x2: pt.x, y2: pt.y, color: TEAM_COLORS[team] };
        pushHistory([...elements, el]);
        setArrowStart(null);
      }
    } else if (tool === "fight") {
      const el: FightEl = { id: uid(), type: "fight", x: pt.x, y: pt.y };
      pushHistory([...elements, el]);
    } else if (tool === "area") {
      setAreaStart(pt);
      setDrawing(true);
    }
  };

  const onSVGMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const pt = getSVGCoords(e, svgRef.current);

    if (tool === "draw" && drawing) {
      setCurrentPath(prev => [...prev, pt]);
    }

    if (draggingId) {
      setElements(prev => prev.map(el => {
        if (el.id !== draggingId) return el;
        if (el.type === "player") return { ...el, x: pt.x - dragOffset.x, y: pt.y - dragOffset.y };
        if (el.type === "fight")  return { ...el, x: pt.x - dragOffset.x, y: pt.y - dragOffset.y };
        if (el.type === "area")   return { ...el, cx: pt.x - dragOffset.x, cy: pt.y - dragOffset.y };
        return el;
      }));
    }
  };

  const onSVGMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    if (tool === "draw" && drawing && currentPath.length > 1) {
      const el: PathEl = { id: uid(), type: "path", points: currentPath, color: TEAM_COLORS[team], width: 4 };
      pushHistory([...elements, el]);
      setCurrentPath([]);
    }
    if (tool === "area" && drawing && areaStart && svgRef.current) {
      const pt = getSVGCoords(e, svgRef.current);
      const r = Math.hypot(pt.x - areaStart.x, pt.y - areaStart.y);
      if (r > 10) {
        const el: AreaEl = { id: uid(), type: "area", cx: areaStart.x, cy: areaStart.y, r, color: TEAM_COLORS[team] };
        pushHistory([...elements, el]);
      }
      setAreaStart(null);
    }
    setDrawing(false);

    if (draggingId) {
      pushHistory([...elements]);
      setDraggingId(null);
    }
  };

  const onElementMouseDown = (e: React.MouseEvent<SVGElement>, el: MapElement) => {
    e.stopPropagation();
    if (!svgRef.current) return;

    if (tool === "erase") {
      pushHistory(elements.filter(x => x.id !== el.id));
      return;
    }

    if (tool === "select") {
      const pt = getSVGCoords(e, svgRef.current);
      setDraggingId(el.id);
      if (el.type === "player") setDragOffset({ x: pt.x - el.x, y: pt.y - el.y });
      else if (el.type === "fight") setDragOffset({ x: pt.x - el.x, y: pt.y - el.y });
      else if (el.type === "area")  setDragOffset({ x: pt.x - el.cx, y: pt.y - el.cy });
      else setDragOffset({ x: 0, y: 0 });
    }
  };

  const saveImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = MAP_SIZE;
    canvas.height = MAP_SIZE;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const svg = svgRef.current!;
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgImg = new Image();
      svgImg.onload = () => {
        ctx.drawImage(svgImg, 0, 0, MAP_SIZE, MAP_SIZE);
        const a = document.createElement("a");
        a.download = "hok-strategy.png";
        a.href = canvas.toDataURL();
        a.click();
      };
      svgImg.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };
    img.src = "/hok-map.png";
  };

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: "select", icon: <MousePointer2 size={18} />, label: "Mover" },
    { id: "draw",   icon: <Pencil size={18} />,        label: "Desenhar" },
    { id: "arrow",  icon: <ArrowRight size={18} />,    label: "Seta" },
    { id: "area",   icon: <Circle size={18} />,        label: "Área" },
    { id: "fight",  icon: <SwordsIcon size={18} />,    label: "Combate" },
    { id: "erase",  icon: <Eraser size={18} />,        label: "Apagar" },
  ];

  return (
    <div style={{ height: "calc(100vh - 56px)" }} className="flex overflow-hidden bg-dark-900">

      {/* ── Sidebar esquerda ── */}
      <div className="w-14 bg-dark-800 border-r border-dark-600 flex flex-col items-center py-3 gap-1 shrink-0">
        {tools.map(t => (
          <button
            key={t.id}
            onClick={() => { setTool(t.id); setArrowStart(null); setAreaStart(null); }}
            title={t.label}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              tool === t.id ? "bg-gold-500 text-dark-900" : "text-gray-400 hover:bg-dark-700 hover:text-white"
            }`}
          >
            {t.icon}
          </button>
        ))}

        <div className="w-8 h-px bg-dark-600 my-2" />

        {/* Undo / Redo */}
        <button onClick={undo} disabled={histIdx === 0} title="Desfazer (Ctrl+Z)" className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-dark-700 hover:text-white disabled:opacity-30 transition-all">
          <Undo2 size={16} />
        </button>
        <button onClick={redo} disabled={histIdx >= history.length - 1} title="Refazer" className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-dark-700 hover:text-white disabled:opacity-30 transition-all">
          <Redo2 size={16} />
        </button>
        <button onClick={() => pushHistory([])} title="Limpar tudo" className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-dark-700 hover:text-red-400 transition-all">
          <Trash2 size={16} />
        </button>
        <button onClick={saveImage} title="Salvar como imagem" className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-dark-700 hover:text-green-400 transition-all">
          <Download size={16} />
        </button>

        <div className="w-8 h-px bg-dark-600 my-1" />

        <button onClick={logout} title="Sair" className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-red-900/20 hover:text-red-400 transition-all">
          <LogOut size={15} />
        </button>
      </div>

      {/* ── Canvas ── */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#0B0F17]">
        <div className="relative" style={{ height: "calc(100vh - 56px)", aspectRatio: "1/1" }}>
          {/* Map image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hok-map.png" alt="Mapa HOK" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

          {/* SVG overlay */}
          <svg
            ref={svgRef}
            viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`}
            className="absolute inset-0 w-full h-full"
            style={{ cursor: tool === "draw" ? "crosshair" : tool === "erase" ? "cell" : tool === "fight" ? "crosshair" : "default" }}
            onMouseDown={onSVGMouseDown}
            onMouseMove={onSVGMouseMove}
            onMouseUp={onSVGMouseUp}
            onMouseLeave={onSVGMouseUp}
          >
            <defs>
              <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#3B82F6" />
              </marker>
              <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
              </marker>
            </defs>

            {/* Drawn elements */}
            {elements.map(el => {
              if (el.type === "path") return (
                <path key={el.id} d={pointsToD(el.points)} fill="none" stroke={el.color} strokeWidth={el.width}
                  strokeLinecap="round" strokeLinejoin="round" style={{ cursor: tool === "erase" || tool === "select" ? "pointer" : "default" }}
                  onMouseDown={e => onElementMouseDown(e, el)} />
              );

              if (el.type === "arrow") {
                const isBlue = el.color === "#3B82F6";
                return (
                  <line key={el.id} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2}
                    stroke={el.color} strokeWidth={4} strokeLinecap="round"
                    markerEnd={`url(#arrow-${isBlue ? "blue" : "red"})`}
                    style={{ cursor: tool === "erase" ? "pointer" : "default" }}
                    onMouseDown={e => onElementMouseDown(e, el)} />
                );
              }

              if (el.type === "area") return (
                <circle key={el.id} cx={el.cx} cy={el.cy} r={el.r}
                  fill={el.color + "33"} stroke={el.color} strokeWidth={3} strokeDasharray="12 6"
                  style={{ cursor: tool === "erase" || tool === "select" ? "pointer" : "default" }}
                  onMouseDown={e => onElementMouseDown(e, el)} />
              );

              if (el.type === "fight") return (
                <g key={el.id} transform={`translate(${el.x},${el.y})`}
                  style={{ cursor: tool === "erase" || tool === "select" ? "pointer" : "default" }}
                  onMouseDown={e => onElementMouseDown(e, el)}>
                  <circle r={22} fill="rgba(0,0,0,0.6)" stroke="#FACC15" strokeWidth={2} />
                  <text textAnchor="middle" dominantBaseline="central" fontSize="24" fill="white">⚔</text>
                </g>
              );

              if (el.type === "player") return (
                <g key={el.id} transform={`translate(${el.x},${el.y})`}
                  style={{ cursor: tool === "select" ? "grab" : tool === "erase" ? "pointer" : "default" }}
                  onMouseDown={e => onElementMouseDown(e, el)}>
                  <circle r={24} fill={TEAM_COLORS[el.team]} stroke="white" strokeWidth={2.5} />
                  <text textAnchor="middle" dominantBaseline="central" fontSize="22" fontWeight="bold" fill="white" fontFamily="sans-serif">
                    {el.role}
                  </text>
                </g>
              );

              return null;
            })}

            {/* Current path preview */}
            {drawing && currentPath.length > 1 && (
              <path d={pointsToD(currentPath)} fill="none" stroke={TEAM_COLORS[team]} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            )}

            {/* Arrow start indicator */}
            {arrowStart && (
              <circle cx={arrowStart.x} cy={arrowStart.y} r={6} fill={TEAM_COLORS[team]} opacity={0.8} />
            )}

            {/* Area drag preview */}
            {areaStart && drawing && (
              <circle cx={areaStart.x} cy={areaStart.y} r={30} fill={TEAM_COLORS[team] + "22"} stroke={TEAM_COLORS[team]} strokeWidth={2} strokeDasharray="10 5" />
            )}
          </svg>
        </div>
      </div>

      {/* ── Painel direito — Times ── */}
      <div className="w-28 bg-dark-800 border-l border-dark-600 flex flex-col shrink-0 overflow-y-auto">
        {/* Team selector */}
        <div className="p-2 border-b border-dark-600 flex gap-1">
          <button onClick={() => setTeam("blue")} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${team === "blue" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-dark-700"}`}>
            Azul
          </button>
          <button onClick={() => setTeam("red")} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${team === "red" ? "bg-red-600 text-white" : "text-gray-500 hover:bg-dark-700"}`}>
            Verm
          </button>
        </div>

        {/* Role tokens */}
        <div className="p-2 space-y-1.5">
          <p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold px-1 pt-1">Adicionar</p>
          {ROLES.map(role => (
            <button
              key={role}
              onClick={() => addPlayer(role)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-dark-700 transition-colors group"
              title={`Adicionar ${ROLE_LABELS[role]}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                style={{ backgroundColor: TEAM_COLORS[team] }}
              >
                {role}
              </div>
              <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors leading-tight">{ROLE_LABELS[role]}</span>
            </button>
          ))}
        </div>

        <div className="h-px bg-dark-600 mx-2" />

        {/* Legend */}
        <div className="p-3 text-[9px] text-gray-600 space-y-1">
          <p className="font-bold text-gray-500 uppercase tracking-wider mb-2">Legenda</p>
          {ROLES.map(r => (
            <div key={r} className="flex items-center gap-1.5">
              <span className="font-bold text-gray-400">{r}</span>
              <span>{ROLE_LABELS[r]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
