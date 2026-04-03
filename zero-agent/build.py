"""
Zero Agent Build Script
Produces single-file executables for Windows, macOS, and Linux using PyInstaller.

Usage:
  python build.py           # Builds for current OS
  python build.py --all     # Cross-compile hints (needs CI/CD)
"""

import platform
import subprocess
import sys
from pathlib import Path

DIST = Path("dist")
DIST.mkdir(exist_ok=True)

SYSTEM = platform.system()

SUFFIXES = {
    "Windows": "zero-agent-windows.exe",
    "Darwin": "zero-agent-mac",
    "Linux": "zero-agent-linux",
}

OUT_NAME = SUFFIXES.get(SYSTEM, "zero-agent")

def build():
    print(f"Building Zero Agent for {SYSTEM}…")
    
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "agent.py",
        "--onefile",
        "--name", OUT_NAME,
        "--distpath", str(DIST),
        "--workpath", "build",
        "--specpath", "build",
        "--hidden-import", "websockets",
        "--hidden-import", "pyautogui",
        "--hidden-import", "playwright",
        "--hidden-import", "PIL",
        "--hidden-import", "pytesseract",
        "--clean",
        "--noconfirm",
    ]

    if SYSTEM == "Windows":
        cmd += ["--icon", "assets/icon.ico"] if Path("assets/icon.ico").exists() else []
    elif SYSTEM == "Darwin":
        cmd += ["--icon", "assets/icon.icns"] if Path("assets/icon.icns").exists() else []

    result = subprocess.run(cmd, cwd=Path(__file__).parent)
    
    if result.returncode == 0:
        out = DIST / OUT_NAME
        print(f"\n✅ Built: {out}")
        print(f"   Size: {out.stat().st_size / 1024 / 1024:.1f} MB")
        print(f"\nTest it: ./{OUT_NAME}")
    else:
        print("\n❌ Build failed. Check errors above.")
        sys.exit(1)


if __name__ == "__main__":
    build()
