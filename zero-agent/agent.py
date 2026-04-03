#!/usr/bin/env python3
"""
Zero Agent — Local WebSocket bridge for Zero AI Agentic Mode
Runs on ws://localhost:7821
Only accepts connections from localhost for security.

Install: pip install websockets pyautogui playwright pillow pytesseract
For browser: playwright install chromium
"""

import asyncio
import json
import logging
import os
import subprocess
import sys
import time
from base64 import b64encode
from datetime import datetime
from pathlib import Path

import websockets
from websockets.server import WebSocketServerProtocol

# ─── Logging ──────────────────────────────────────────────────────────────────
LOG_DIR = Path.home() / ".zero-agent" / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = LOG_DIR / f"agent_{datetime.now().strftime('%Y%m%d')}.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("zero-agent")

# Rate limiting: 1 action per 100ms
_last_action_time = 0.0

def rate_limit():
    global _last_action_time
    elapsed = time.time() - _last_action_time
    if elapsed < 0.1:
        time.sleep(0.1 - elapsed)
    _last_action_time = time.time()

# ─── Playwright browser (lazy init) ──────────────────────────────────────────
_playwright = None
_browser = None
_page = None

async def get_page():
    global _playwright, _browser, _page
    if _page is None:
        from playwright.async_api import async_playwright
        _playwright = await async_playwright().start()
        _browser = await _playwright.chromium.launch(headless=False)
        _page = await _browser.new_page()
    return _page

# ─── Tool handlers ────────────────────────────────────────────────────────────

async def handle_execute_terminal(params: dict) -> dict:
    rate_limit()
    cmd = params.get("command", "")
    cwd = params.get("working_directory", str(Path.home()))
    timeout = params.get("timeout_seconds", 30)
    log.info(f"execute_terminal: {cmd[:80]}")
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True,
            cwd=cwd, timeout=timeout
        )
        return {
            "stdout": result.stdout[:5000],
            "stderr": result.stderr[:1000],
            "exit_code": result.returncode,
        }
    except subprocess.TimeoutExpired:
        return {"error": f"Command timed out after {timeout}s", "exit_code": -1}
    except Exception as e:
        return {"error": str(e), "exit_code": -1}


async def handle_read_file(params: dict) -> dict:
    rate_limit()
    path = Path(params.get("file_path", ""))
    log.info(f"read_file: {path}")
    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
        return {"content": content[:10000], "size": len(content), "truncated": len(content) > 10000}
    except Exception as e:
        return {"error": str(e)}


async def handle_write_file(params: dict) -> dict:
    rate_limit()
    path = Path(params.get("file_path", ""))
    content = params.get("content", "")
    log.info(f"write_file: {path}")
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return {"success": True, "path": str(path), "bytes_written": len(content.encode())}
    except Exception as e:
        return {"error": str(e)}


async def handle_list_directory(params: dict) -> dict:
    rate_limit()
    path = Path(params.get("path", "."))
    log.info(f"list_directory: {path}")
    try:
        entries = []
        for entry in sorted(path.iterdir()):
            entries.append({
                "name": entry.name,
                "is_dir": entry.is_dir(),
                "size": entry.stat().st_size if entry.is_file() else None,
            })
        return {"entries": entries[:100], "path": str(path)}
    except Exception as e:
        return {"error": str(e)}


async def handle_take_screenshot(params: dict) -> dict:
    rate_limit()
    log.info("take_screenshot")
    try:
        import pyautogui
        from PIL import Image
        import io
        screenshot = pyautogui.screenshot()
        buf = io.BytesIO()
        screenshot.save(buf, format="PNG", optimize=True)
        b64 = b64encode(buf.getvalue()).decode()
        return {"screenshot": b64, "width": screenshot.width, "height": screenshot.height}
    except Exception as e:
        return {"error": str(e)}


async def handle_mouse_click(params: dict) -> dict:
    rate_limit()
    try:
        import pyautogui
        x, y = params.get("x", 0), params.get("y", 0)
        button = params.get("button", "left")
        log.info(f"mouse_click: ({x}, {y}) {button}")
        if button == "double":
            pyautogui.doubleClick(x, y)
        elif button == "right":
            pyautogui.rightClick(x, y)
        else:
            pyautogui.click(x, y)
        return {"success": True, "x": x, "y": y}
    except Exception as e:
        return {"error": str(e)}


async def handle_keyboard_type(params: dict) -> dict:
    rate_limit()
    try:
        import pyautogui
        text = params.get("text", "")
        keys = params.get("keys", "")
        log.info(f"keyboard_type: {text[:30] or keys}")
        if keys:
            pyautogui.hotkey(*keys.split("+"))
        if text:
            pyautogui.typewrite(text, interval=0.02)
        return {"success": True}
    except Exception as e:
        return {"error": str(e)}


async def handle_open_application(params: dict) -> dict:
    rate_limit()
    app = params.get("app_name", "")
    log.info(f"open_application: {app}")
    try:
        if sys.platform == "win32":
            subprocess.Popen(["start", app], shell=True)
        elif sys.platform == "darwin":
            subprocess.Popen(["open", "-a", app])
        else:
            subprocess.Popen([app])
        return {"success": True, "app": app}
    except Exception as e:
        return {"error": str(e)}


async def handle_browser_navigate(params: dict) -> dict:
    rate_limit()
    url = params.get("url", "")
    log.info(f"browser_navigate: {url}")
    try:
        page = await get_page()
        await page.goto(url, wait_until="domcontentloaded", timeout=15000)
        return {"success": True, "url": page.url, "title": await page.title()}
    except Exception as e:
        return {"error": str(e)}


async def handle_browser_click(params: dict) -> dict:
    rate_limit()
    selector = params.get("selector", "")
    desc = params.get("description", "")
    log.info(f"browser_click: {selector or desc}")
    try:
        page = await get_page()
        if selector:
            await page.click(selector, timeout=8000)
        else:
            # Try to find by text
            await page.get_by_text(desc).first.click(timeout=8000)
        return {"success": True}
    except Exception as e:
        return {"error": str(e)}


async def handle_browser_screenshot(params: dict) -> dict:
    rate_limit()
    log.info("browser_screenshot")
    try:
        page = await get_page()
        buf = await page.screenshot(type="png")
        return {"screenshot": b64encode(buf).decode()}
    except Exception as e:
        return {"error": str(e)}


async def handle_browser_extract(params: dict) -> dict:
    rate_limit()
    fmt = params.get("format", "text")
    log.info(f"browser_extract: {fmt}")
    try:
        page = await get_page()
        if fmt == "text":
            text = await page.inner_text("body")
            return {"content": text[:8000]}
        else:
            html = await page.content()
            return {"content": html[:8000]}
    except Exception as e:
        return {"error": str(e)}


async def handle_browser_type(params: dict) -> dict:
    rate_limit()
    selector = params.get("selector", "")
    text = params.get("text", "")
    log.info(f"browser_type: {selector} -> {text[:30]}")
    try:
        page = await get_page()
        await page.fill(selector, text, timeout=8000)
        return {"success": True}
    except Exception as e:
        return {"error": str(e)}


async def handle_browser_scroll(params: dict) -> dict:
    rate_limit()
    direction = params.get("direction", "down")
    amount = params.get("amount", 3)
    log.info(f"browser_scroll: {direction} x{amount}")
    try:
        page = await get_page()
        delta = 300 * amount * (-1 if direction == "up" else 1)
        await page.evaluate(f"window.scrollBy(0, {delta})")
        return {"success": True}
    except Exception as e:
        return {"error": str(e)}


# ─── Tool dispatch table ──────────────────────────────────────────────────────
HANDLERS = {
    "execute_terminal": handle_execute_terminal,
    "read_file": handle_read_file,
    "write_file": handle_write_file,
    "list_directory": handle_list_directory,
    "take_screenshot": handle_take_screenshot,
    "mouse_click": handle_mouse_click,
    "keyboard_type": handle_keyboard_type,
    "open_application": handle_open_application,
    "browser_navigate": handle_browser_navigate,
    "browser_click": handle_browser_click,
    "browser_type": handle_browser_type,
    "browser_screenshot": handle_browser_screenshot,
    "browser_extract": handle_browser_extract,
    "browser_scroll": handle_browser_scroll,
}

# ─── WebSocket server ─────────────────────────────────────────────────────────
async def on_connect(websocket: WebSocketServerProtocol):
    # Security: only accept localhost
    host = websocket.remote_address[0]
    if host not in ("127.0.0.1", "::1", "localhost"):
        log.warning(f"Rejected connection from {host}")
        await websocket.close(1008, "Forbidden")
        return

    log.info(f"Zero AI connected from {host}")

    async for message in websocket:
        try:
            payload = json.loads(message)
            tool = payload.get("tool", "")
            params = payload.get("parameters", {})
            request_id = payload.get("requestId", "")

            log.info(f"Tool call: {tool} | requestId: {request_id}")

            if tool not in HANDLERS:
                await websocket.send(json.dumps({
                    "requestId": request_id,
                    "error": f"Unknown tool: {tool}",
                }))
                continue

            handler = HANDLERS[tool]
            result = await handler(params)

            # Attach screenshot to response if present
            response: dict = {"requestId": request_id, "result": result}
            if "screenshot" in result:
                response["screenshot"] = result.pop("screenshot")

            await websocket.send(json.dumps(response))

        except json.JSONDecodeError:
            log.error("Invalid JSON received")
        except Exception as e:
            log.exception("Unexpected error handling message")
            try:
                await websocket.send(json.dumps({
                    "requestId": payload.get("requestId", ""),
                    "error": str(e),
                }))
            except Exception:
                pass


async def main():
    log.info("═══════════════════════════════════════")
    log.info("  Zero Agent v1.0 — Starting on :7821  ")
    log.info("═══════════════════════════════════════")
    log.info(f"Logs: {LOG_FILE}")

    async with websockets.serve(on_connect, "127.0.0.1", 7821, ping_interval=20, ping_timeout=10):
        log.info("Listening on ws://localhost:7821")
        log.info("Open Zero AI → Agentic Mode — the green dot will appear.")
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
