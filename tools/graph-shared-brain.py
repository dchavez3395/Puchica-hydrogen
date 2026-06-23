#!/usr/bin/env python3
import os
import sys
import json
import re
import urllib.request
from pathlib import Path
from datetime import datetime

BUS_URL = "https://college-market-nasa-eat.trycloudflare.com"
TOKEN = "cf598c067af7e3ae7675897d5e76e107f110480d0eeaba45ae5300f7c649c58b"
SHARED_DIR = Path(r"E:\.openclaw\shared")
OUTPUT_MD = SHARED_DIR / "ctx" / "shared_brain_graph.md"
OUTPUT_HTML = SHARED_DIR / "shared_brain_dashboard.html"

def api_call(path):
    url = f"{BUS_URL.rstrip('/')}/{path.lstrip('/')}"
    headers = {"X-Bus-Token": TOKEN}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"[WARN] Failed to fetch {path} from bus: {e}", file=sys.stderr)
        return None

def parse_yaml_header(content):
    meta = {}
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if m:
        header_text = m.group(1)
        for line in header_text.splitlines():
            line = line.strip()
            if not line or ":" not in line:
                continue
            k, v = line.split(":", 1)
            meta[k.strip().lower()] = v.strip()
    return meta

def scan_local_brain():
    drafts = []
    reviews = []
    
    # Scan drafts
    drafts_dir = SHARED_DIR / "drafts"
    if drafts_dir.exists():
        for p in drafts_dir.glob("**/*.md"):
            try:
                content = p.read_text(encoding="utf-8", errors="ignore")
                meta = parse_yaml_header(content)
                drafts.append({
                    "name": p.name,
                    "rel_path": str(p.relative_to(SHARED_DIR)),
                    "persona": meta.get("persona", p.parent.name),
                    "agent": meta.get("agent", "unknown"),
                    "started": meta.get("started", "unknown"),
                    "bus_task": meta.get("bus_task", "unknown"),
                    "status": meta.get("status", "draft"),
                    "title": p.stem.replace("-", " ").title()
                })
            except Exception as e:
                print(f"[WARN] Error reading draft {p}: {e}", file=sys.stderr)
                
    # Scan reviews
    reviews_dir = SHARED_DIR / "reviews"
    if reviews_dir.exists():
        for p in reviews_dir.glob("*.md"):
            try:
                content = p.read_text(encoding="utf-8", errors="ignore")
                meta = parse_yaml_header(content)
                reviews.append({
                    "name": p.name,
                    "rel_path": str(p.relative_to(SHARED_DIR)),
                    "persona": meta.get("persona", "unknown"),
                    "agent": meta.get("agent", "unknown"),
                    "started": meta.get("started", "unknown"),
                    "bus_task": meta.get("bus_task", "unknown"),
                    "status": meta.get("status", "review"),
                    "title": p.stem.replace("-", " ").title()
                })
            except Exception as e:
                print(f"[WARN] Error reading review {p}: {e}", file=sys.stderr)
                
    return drafts, reviews

def build_graph(bus_agents, bus_tasks, bus_messages, drafts, reviews):
    nodes = []
    links = []
    node_map = {}
    
    # 1. Add Agents
    agents_list = []
    if bus_agents:
        agents_list = bus_agents
    else:
        # Fallback list from known agents
        agents_list = [
            {"name": "connor", "status": "active", "working_on": "managing the team"},
            {"name": "claude-code", "status": "offline", "working_on": "idle"},
            {"name": "claude-code-laptop", "status": "active", "working_on": "waiting on walls"},
            {"name": "antigravity", "status": "active", "working_on": "graphing shared brain"}
        ]
        
    for agent in agents_list:
        name = agent["name"]
        n_id = f"agent_{name}"
        node = {
            "id": n_id,
            "label": name,
            "type": "agent",
            "status": agent.get("status", "active"),
            "working_on": agent.get("working_on", "unknown"),
            "details": f"Status: {agent.get('status')}<br>Working on: {agent.get('working_on')}"
        }
        nodes.append(node)
        node_map[n_id] = node
        
    # 2. Add Tasks
    tasks_list = bus_tasks or []
    for task in tasks_list:
        t_id = f"task_{task['id']}"
        node = {
            "id": t_id,
            "label": f"Task #{task['id']}: {task.get('title', 'Untitled')}",
            "type": "task",
            "status": task.get("status", "open"),
            "assigned_to": task.get("assigned_to", ""),
            "details": f"Status: {task.get('status')}<br>Assigned: {task.get('assigned_to') or 'Unassigned'}"
        }
        nodes.append(node)
        node_map[t_id] = node
        
        # Link assigned agent
        if task.get("assigned_to"):
            assignee = task["assigned_to"]
            a_id = f"agent_{assignee}"
            if a_id in node_map:
                links.append({"source": a_id, "target": t_id, "label": "assigned_to"})

    # 3. Add Drafts
    for d in drafts:
        d_id = f"draft_{d['name']}"
        node = {
            "id": d_id,
            "label": f"Draft: {d['title']}",
            "type": "draft",
            "status": d["status"],
            "persona": d["persona"],
            "details": f"Persona: {d['persona']}<br>Author: {d['agent']}<br>Path: {d['rel_path']}"
        }
        nodes.append(node)
        node_map[d_id] = node
        
        # Link author agent
        a_id = f"agent_{d['agent']}"
        if a_id in node_map:
            links.append({"source": a_id, "target": d_id, "label": "authored"})
            
        # Link to task if specified
        task_ref = d["bus_task"]
        if task_ref and task_ref != "unknown":
            # Check if task_ref is a number or contains a number
            m = re.search(r"\b(\d+)\b", task_ref)
            if m:
                t_id = f"task_{m.group(1)}"
                if t_id in node_map:
                    links.append({"source": d_id, "target": t_id, "label": "references"})

    # 4. Add Reviews
    for r in reviews:
        r_id = f"review_{r['name']}"
        node = {
            "id": r_id,
            "label": f"Review: {r['title']}",
            "type": "review",
            "status": r["status"],
            "details": f"Author: {r['agent']}<br>Path: {r['rel_path']}"
        }
        nodes.append(node)
        node_map[r_id] = node
        
        # Link reviewer agent
        a_id = f"agent_{r['agent']}"
        if a_id in node_map:
            links.append({"source": a_id, "target": r_id, "label": "wrote_review"})
            
        # Try to link to draft being reviewed
        # Typically the review file matches the draft name or topic
        draft_match = r['name'].replace("-review-", "-").replace("review-", "")
        # Find closest draft
        for d in drafts:
            if d['name'] in r['name'] or r['name'] in d['name'] or "hero" in r['name'] and "hero" in d['name']:
                links.append({"source": r_id, "target": f"draft_{d['name']}", "label": "reviews"})
                break

    # 5. Extract interaction links from recent messages
    if bus_messages:
        for msg in bus_messages[:30]: # Look at latest 30 messages
            sender = msg.get("from")
            mentions = msg.get("mentions") or []
            
            s_id = f"agent_{sender}"
            if s_id not in node_map:
                continue
                
            for mentioned in mentions:
                m_id = f"agent_{mentioned}"
                if m_id in node_map and s_id != m_id:
                    # Add mention link
                    # Check if link already exists to prevent duplicate lines
                    exists = any(l["source"] == s_id and l["target"] == m_id and l["label"] == "mentions" for l in links)
                    if not exists:
                        links.append({"source": s_id, "target": m_id, "label": "mentions"})
                        
    return nodes, links

def generate_markdown(nodes, links, drafts, reviews, messages):
    lines = []
    lines.append(f"# Shared Brain Topology Graph — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append("")
    lines.append("> [!NOTE]")
    lines.append("> This graph maps the relationships between active agents, tasks, and draft artifacts on the Puchica bus.")
    lines.append("")
    
    # Active agents list
    lines.append("## Active Agents")
    lines.append("")
    lines.append("| Agent | Status | Current Focus |")
    lines.append("|---|---|---|")
    for n in nodes:
        if n["type"] == "agent":
            lines.append(f"| **{n['label']}** | `{n['status']}` | {n['working_on']} |")
    lines.append("")
    
    # Mermaid graph
    lines.append("## Live Relationship Graph")
    lines.append("")
    lines.append("```mermaid")
    lines.append("graph TD")
    
    # Node styles
    lines.append("  %% Style Declarations")
    lines.append("  classDef agent fill:#7f5af0,stroke:#2cb67d,stroke-width:2px,color:#fff;")
    lines.append("  classDef task fill:#16161a,stroke:#72757a,stroke-width:1px,color:#94a1b2;")
    lines.append("  classDef draft fill:#2cb67d,stroke:#7f5af0,stroke-width:1px,color:#fff;")
    lines.append("  classDef review fill:#ff8906,stroke:#e53e3e,stroke-width:1px,color:#fff;")
    lines.append("")
    
    # Print nodes
    for n in nodes:
        clean_label = n["label"].replace('"', '\\"')
        lines.append(f'  {n["id"]}["{clean_label}"]')
        lines.append(f'  class {n["id"]} {n["type"]};')
        
    # Print links
    for l in links:
        lines.append(f'  {l["source"]} -->|"{l["label"]}"| {l["target"]}')
        
    lines.append("```")
    lines.append("")
    
    # Recent communication activity
    lines.append("## Recent Discussions")
    lines.append("")
    if messages:
        for msg in messages[:8]:
            ts = msg.get("ts", "")
            if ts:
                # Parse timestamp to nice readable format
                try:
                    ts = datetime.fromisoformat(ts.replace("Z", "+00:00")).strftime("%H:%M")
                except Exception:
                    pass
            lines.append(f"- **{msg.get('from')}** to **{msg.get('to')}** ({ts}): {msg.get('text')}")
    else:
        lines.append("No recent messages found on bus.")
        
    return "\n".join(lines)

def generate_html(nodes, links):
    # Modern, glowing dashboard using D3 force directed graph
    nodes_json = json.dumps(nodes)
    links_json = json.dumps(links)
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Puchica Shared Brain Map</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Space+Grotesk:wght@400;600&display=swap" rel="stylesheet">
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        :root {{
            --bg-color: #0b0914;
            --panel-bg: rgba(18, 15, 32, 0.7);
            --border-color: rgba(127, 90, 240, 0.2);
            --text-color: #e2e8f0;
            --text-muted: #94a3b8;
            --primary: #7f5af0;
            --primary-glow: rgba(127, 90, 240, 0.4);
            --secondary: #2cb67d;
            --secondary-glow: rgba(44, 182, 125, 0.4);
            --accent: #ff8906;
            --danger: #ef4444;
        }}
        
        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}
        
        body {{
            background-color: var(--bg-color);
            background-image: 
                radial-gradient(at 0% 0%, rgba(127, 90, 240, 0.1) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(44, 182, 125, 0.08) 0px, transparent 50%);
            color: var(--text-color);
            font-family: 'Outfit', sans-serif;
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }}
        
        header {{
            padding: 1.5rem 2rem;
            border-bottom: 1px solid var(--border-color);
            background: rgba(11, 9, 20, 0.8);
            backdrop-filter: blur(12px);
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 10;
        }}
        
        h1 {{
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.8rem;
            font-weight: 600;
            background: linear-gradient(135deg, #a78bfa 0%, #34d399 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }}
        
        .pulse-dot {{
            width: 10px;
            height: 10px;
            background-color: var(--secondary);
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 10px var(--secondary-glow);
            animation: pulse 2s infinite;
        }}
        
        @keyframes pulse {{
            0% {{ transform: scale(0.95); box-shadow: 0 0 0 0 rgba(44, 182, 125, 0.7); }}
            70% {{ transform: scale(1); box-shadow: 0 0 0 8px rgba(44, 182, 125, 0); }}
            100% {{ transform: scale(0.95); box-shadow: 0 0 0 0 rgba(44, 182, 125, 0); }}
        }}
        
        .timestamp {{
            font-size: 0.9rem;
            color: var(--text-muted);
            font-family: 'Space Grotesk', sans-serif;
        }}
        
        .main-container {{
            flex: 1;
            display: flex;
            position: relative;
        }}
        
        #graph-canvas {{
            flex: 1;
            height: 100%;
            cursor: grab;
        }}
        
        #graph-canvas:active {{
            cursor: grabbing;
        }}
        
        .sidebar {{
            width: 380px;
            border-left: 1px solid var(--border-color);
            background: var(--panel-bg);
            backdrop-filter: blur(16px);
            padding: 2rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            overflow-y: auto;
            z-index: 5;
            box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
        }}
        
        .glass-card {{
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 1.25rem;
            transition: all 0.3s ease;
        }}
        
        .glass-card:hover {{
            border-color: var(--border-color);
            background: rgba(255, 255, 255, 0.05);
        }}
        
        h2 {{
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.2rem;
            margin-bottom: 0.75rem;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }}
        
        .node-details {{
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }}
        
        .node-details-title {{
            font-size: 1.4rem;
            font-weight: 600;
            color: #fff;
            margin-bottom: 0.25rem;
        }}
        
        .tag {{
            display: inline-block;
            padding: 0.25rem 0.6rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
        
        .tag-agent {{ background: rgba(127, 90, 240, 0.15); color: #a78bfa; border: 1px solid rgba(127, 90, 240, 0.3); }}
        .tag-task {{ background: rgba(148, 163, 184, 0.1); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.2); }}
        .tag-draft {{ background: rgba(44, 182, 125, 0.15); color: #34d399; border: 1px solid rgba(44, 182, 125, 0.3); }}
        .tag-review {{ background: rgba(255, 137, 6, 0.15); color: #ff9f43; border: 1px solid rgba(255, 137, 6, 0.3); }}
        
        .legend {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
        }}
        
        .legend-item {{
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.85rem;
            color: var(--text-muted);
        }}
        
        .legend-color {{
            width: 12px;
            height: 12px;
            border-radius: 3px;
        }}
        
        .link {{
            stroke: rgba(148, 163, 184, 0.2);
            stroke-width: 1.5px;
            fill: none;
            transition: stroke 0.2s ease;
        }}
        
        .link.active {{
            stroke: var(--primary);
            stroke-width: 2.5px;
        }}
        
        .node-circle {{
            cursor: pointer;
            transition: filter 0.2s ease;
        }}
        
        .node-circle:hover {{
            filter: brightness(1.2) drop-shadow(0 0 8px var(--primary-glow));
        }}
        
        .node-text {{
            font-size: 11px;
            font-family: 'Space Grotesk', sans-serif;
            pointer-events: none;
            fill: #94a3b8;
        }}
        
        .node-text.active {{
            fill: #fff;
            font-weight: 600;
        }}
        
        /* Tooltip */
        .tooltip {{
            position: absolute;
            background: rgba(11, 9, 20, 0.95);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 0.5rem 0.75rem;
            font-size: 0.85rem;
            pointer-events: none;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            z-index: 100;
            opacity: 0;
            transition: opacity 0.15s ease;
        }}
    </style>
</head>
<body>
    <header>
        <h1><span class="pulse-dot"></span> Puchica Shared Brain Map</h1>
        <div class="timestamp">Last Synced: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</div>
    </header>
    
    <div class="main-container">
        <svg id="graph-canvas"></svg>
        <div class="tooltip" id="tooltip"></div>
        
        <div class="sidebar">
            <div class="glass-card">
                <h2>Node Directory</h2>
                <div class="legend">
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: var(--primary);"></div>
                        <span>Agent</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #475569;"></div>
                        <span>Task</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: var(--secondary);"></div>
                        <span>Draft</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: var(--accent);"></div>
                        <span>Review</span>
                    </div>
                </div>
            </div>
            
            <div class="glass-card" style="flex: 1; display: flex; flex-direction: column;">
                <h2>Details</h2>
                <div id="details-content" style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; color: var(--text-muted); text-align: center;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem; opacity: 0.5;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                    </svg>
                    <p>Click on any node in the shared brain network to view details and metadata.</p>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        const nodes = {nodes_json};
        const links = {links_json};
        
        const svg = d3.select("#graph-canvas");
        const width = document.getElementById("graph-canvas").clientWidth;
        const height = document.getElementById("graph-canvas").clientHeight;
        
        // Define colors
        const colors = {{
            agent: "#7f5af0",
            task: "#475569",
            draft: "#2cb67d",
            review: "#ff8906"
        }};
        
        // Setup Zoom
        const g = svg.append("g");
        svg.call(d3.zoom().on("zoom", (event) => {{
            g.attr("transform", event.transform);
        }}));
        
        // Force simulation
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(120))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(40));
            
        // Render links
        const link = g.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("class", "link");
            
        // Render nodes
        const node = g.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter().append("g")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
                
        // Node circles
        node.append("circle")
            .attr("r", d => d.type === "agent" ? 18 : 12)
            .attr("fill", d => colors[d.type])
            .attr("stroke", d => d.type === "agent" ? "#fff" : "none")
            .attr("stroke-width", 2)
            .attr("class", "node-circle")
            .on("click", showDetails)
            .on("mouseover", showTooltip)
            .on("mouseout", hideTooltip);
            
        // Node text
        node.append("text")
            .attr("dx", d => d.type === "agent" ? 22 : 16)
            .attr("dy", ".35em")
            .attr("class", "node-text")
            .text(d => d.type === "agent" ? "@" + d.label : d.label);
            
        simulation.on("tick", () => {{
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
                
            node
                .attr("transform", d => `translate(${{d.x}}, ${{d.y}})`);
        }});
        
        function dragstarted(event, d) {{
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }}
        
        function dragged(event, d) {{
            d.fx = event.x;
            d.fy = event.y;
        }}
        
        function dragended(event, d) {{
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }}
        
        // Tooltip handlers
        const tooltip = document.getElementById("tooltip");
        function showTooltip(event, d) {{
            tooltip.style.opacity = "1";
            tooltip.innerHTML = `<strong>${{d.label}}</strong> (${{d.type}})`;
            tooltip.style.left = (event.pageX + 15) + "px";
            tooltip.style.top = (event.pageY - 15) + "px";
        }}
        
        function hideTooltip() {{
            tooltip.style.opacity = "0";
        }}
        
        // Details panel handler
        function showDetails(event, d) {{
            const details = document.getElementById("details-content");
            
            // Highlight connections
            link.classed("active", l => l.source.id === d.id || l.target.id === d.id);
            node.select("text").classed("active", n => n.id === d.id);
            
            let badgeClass = "tag tag-" + d.type;
            
            details.style.alignItems = "flex-start";
            details.style.textAlign = "left";
            details.style.justifyContent = "flex-start";
            
            details.innerHTML = `
                <div class="node-details">
                    <span class="${{badgeClass}}">${{d.type}}</span>
                    <div class="node-details-title">${{d.label}}</div>
                    <div style="width: 100%; height: 1px; background: var(--border-color); margin: 0.5rem 0;"></div>
                    <div style="font-size: 0.95rem; line-height: 1.6;">
                        ${{d.details || 'No additional details metadata available.'}}
                    </div>
                </div>
            `;
        }}
    </script>
</body>
</html>
"""
    return html

def main():
    print("Graphing Puchica Shared Brain...")
    
    # 1. Get bus state
    bus_agents = api_call("/agents")
    bus_tasks = api_call("/tasks")
    bus_messages = api_call("/messages?limit=100")
    
    # Clean dictionaries if nested
    agents_list = []
    if bus_agents:
        if isinstance(bus_agents, dict) and "agents" in bus_agents:
            agents_list = list(bus_agents["agents"].values())
        elif isinstance(bus_agents, dict):
            agents_list = list(bus_agents.values())
        else:
            agents_list = bus_agents

    tasks_list = []
    if bus_tasks:
        if isinstance(bus_tasks, dict) and "tasks" in bus_tasks:
            tasks_list = bus_tasks["tasks"]
        else:
            tasks_list = bus_tasks

    messages_list = []
    if bus_messages:
        if isinstance(bus_messages, dict) and "messages" in bus_messages:
            messages_list = bus_messages["messages"]
        else:
            messages_list = bus_messages

    # 2. Get local filesystem states
    drafts, reviews = scan_local_brain()
    
    # 3. Build unified graph
    nodes, links = build_graph(agents_list, tasks_list, messages_list, drafts, reviews)
    
    # 4. Generate outputs
    md_content = generate_markdown(nodes, links, drafts, reviews, messages_list)
    html_content = generate_html(nodes, links)
    
    # Write outputs
    OUTPUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_MD.write_text(md_content, encoding="utf-8")
    print(f"[OK] Wrote markdown graph to {OUTPUT_MD}")
    
    OUTPUT_HTML.write_text(html_content, encoding="utf-8")
    print(f"[OK] Wrote HTML dashboard to {OUTPUT_HTML}")

if __name__ == "__main__":
    main()
