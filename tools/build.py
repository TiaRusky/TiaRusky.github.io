#!/usr/bin/env python3
"""
Quick Jekyll build script for local testing.
Processes the XP Portfolio site into _site/ directory.
Usage: python tools/build.py && python tools/build.py --serve
"""

import os
import re
import sys
import json
import shutil
import yaml
import markdown as md_lib
from pathlib import Path

ROOT = Path(__file__).parent.parent

# --- Load site config ---
with open(ROOT / "_config.yml", "r", encoding="utf-8") as f:
    config = yaml.safe_load(f) or {}

# --- Load data files ---
data = {}
for data_file in (ROOT / "_data").glob("*.yml"):
    with open(data_file, "r", encoding="utf-8") as f:
        data[data_file.stem] = yaml.safe_load(f) or []

site = {
    "title": config.get("title", ""),
    "description": config.get("description", ""),
    "baseurl": config.get("baseurl", ""),
    "url": config.get("url", ""),
    "data": data
}

# --- Template engine ---
def relative_url(path):
    base = site["baseurl"].rstrip("/")
    return base + "/" + path.lstrip("/") if base else path

def markdownify(text):
    if not text:
        return ""
    return md_lib.markdown(text, extensions=["extra", "codehilite"])

def jsonify(obj):
    return json.dumps(obj, ensure_ascii=False)

def slugify(text):
    return str(text).lower().replace(" ", "-")


def process_item_vars(template, item):
    """Replace {{ var.field }}, {{ var.field | filter }} in a template using item dict."""
    
    def var_replace(match):
        field = match.group(2)
        filter_name = match.group(3)
        val = item.get(field, "")
        
        if filter_name == "markdownify":
            return markdownify(str(val))
        elif filter_name == "jsonify":
            return jsonify(val)
        elif filter_name == "slugify":
            return slugify(val)
        else:
            return str(val)
    
    return re.sub(
        r'\{\{\s*(\w+)\.(\w+)\s*(?:\|\s*(\w+))?\s*\}\}',
        var_replace,
        template
    )


def process_liquid(template, page_vars=None):
    """Process Liquid-like tags in template."""
    page = page_vars or {}
    
    # --- Handle includes ---
    def replace_include(match):
        include_path = match.group(1).strip()
        inc_file = ROOT / "_includes" / include_path
        if inc_file.exists():
            with open(inc_file, "r", encoding="utf-8") as f:
                return f.read()
        return f"<!-- include not found: {include_path} -->"
    
    template = re.sub(r'\{%\s*include\s+([\w/\-.]+)\s*%\}', replace_include, template)
    
    # --- Handle for loops ---
    def replace_for(match):
        collection_path = match.group(2).strip()
        body = match.group(3)
        
        parts = collection_path.split(".")
        collection = None
        if parts[0] == "site":
            current = site
            for p in parts[1:]:
                if isinstance(current, dict):
                    current = current.get(p)
                elif isinstance(current, list):
                    break
            collection = current
        
        if not collection or not isinstance(collection, list):
            return ""
        
        result = []
        for item in collection:
            item_body = body if isinstance(item, dict) else body
            
            if isinstance(item, dict):
                # Substitute variables
                item_body = process_item_vars(item_body, item)
                
                # Handle {% if item.field %} ... {% endif %}
                item_body = re.sub(
                    r'\{%\s*if\s+\w+\.(\w+)\s*%\}(.*?)\{%\s*endif\s*%\}',
                    lambda m, it=item: m.group(2) if it.get(m.group(1)) else "",
                    item_body,
                    flags=re.DOTALL
                )
            
            result.append(item_body)
        
        return "".join(result)
    
    template = re.sub(
        r'\{%\s*for\s+(\w+)\s+in\s+([\w.]+)\s*%\}(.*?)\{%\s*endfor\s*%\}',
        replace_for,
        template,
        flags=re.DOTALL
    )
    
    # --- Handle page-level variable substitution ---
    template = re.sub(
        r'\{\{\s*page\.title\s*\|\s*default:\s*site\.title\s*\}\}',
        page.get("title", site["title"]),
        template
    )
    
    template = re.sub(
        r"\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}",
        lambda m: relative_url(m.group(1)),
        template
    )
    
    template = re.sub(
        r'\{\{\s*site\.data\.(\w+)\s*\|\s*jsonify\s*\}\}',
        lambda m: jsonify(site["data"].get(m.group(1), [])),
        template
    )
    
    template = re.sub(
        r'\{\{\s*""\s*\|\s*relative_url\s*\}\}',
        relative_url(""),
        template
    )
    
    return template


# --- Build ---
def build():
    out_dir = ROOT / "_site"
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir()
    
    layout_path = ROOT / "_layouts" / "xp-desktop.html"
    with open(layout_path, "r", encoding="utf-8") as f:
        layout = f.read()
    
    page = {"title": site["title"], "permalink": "/"}
    index_path = ROOT / "index.html"
    if index_path.exists():
        with open(index_path, "r", encoding="utf-8") as f:
            content = f.read()
        fm_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        if fm_match:
            fm = yaml.safe_load(fm_match.group(1))
            if fm:
                page.update(fm)
    
    html = process_liquid(layout, page)
    
    with open(out_dir / "index.html", "w", encoding="utf-8") as f:
        f.write(html)
    
    # Copy assets
    assets_src = ROOT / "assets"
    assets_dst = out_dir / "assets"
    if assets_src.exists():
        shutil.copytree(assets_src, assets_dst)
    
    # Copy tools (exclude .py and plaintext)
    tools_src = ROOT / "tools"
    tools_dst = out_dir / "tools"
    if tools_src.exists():
        shutil.copytree(tools_src, tools_dst,
                       ignore=shutil.ignore_patterns("*.py", "*-plaintext.md"))
    
    print(f"Build complete -> {out_dir}")
    print(f"  index.html ({len(html)} bytes)")
    print(f"  assets/ copied")
    return out_dir


def serve():
    import http.server
    import socketserver
    
    os.chdir(ROOT / "_site")
    
    PORT = 8080
    Handler = http.server.SimpleHTTPRequestHandler
    
    print(f"\nServer running at http://localhost:{PORT}")
    print(f"  Open your browser: http://localhost:{PORT}")
    print(f"  Press Ctrl+C to stop\n")
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")


if __name__ == "__main__":
    out = build()
    if "--serve" in sys.argv:
        serve()
    else:
        print("\nTo start the server: python tools/build.py --serve")
