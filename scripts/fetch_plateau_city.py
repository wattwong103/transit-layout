"""Cache all tiles in the pinned Shibuya ward layers and record checksums.

The viewer streams the exact same versioned source URLs. The full local cache
supports inspection and reproducible building identity/coordinate extraction.
"""
import concurrent.futures
import hashlib
import json
import posixpath
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".cache/plateau-city/2025"
CONFIG = ROOT / "src/data/plateau-city.json"


def safe_relative(uri):
    parsed = urllib.parse.urlsplit(uri)
    clean = posixpath.normpath(urllib.parse.unquote(parsed.path))
    if parsed.scheme or parsed.netloc or clean.startswith(("/", "..")) or "\\" in clean or ":" in clean:
        raise ValueError(f"Unsupported source URI: {uri}")
    if parsed.query or parsed.fragment or Path(clean).suffix not in {".b3dm", ".glb"}:
        raise ValueError(f"Unsupported content/dependency: {uri}")
    return clean


def fetch(url, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        with urllib.request.urlopen(url, timeout=60) as response:
            data = response.read()
        path.write_bytes(data)
    data = path.read_bytes()
    return {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}


def tile_uris(tile):
    if "content" in tile:
        yield tile["content"]["uri"]
    for child in tile.get("children", []):
        yield from tile_uris(child)


def main():
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    report = {"catalogUrl": config["catalogApi"], "catalogYear": config["year"],
              "checkedOn": config["checkedOn"], "layers": []}
    for layer in config["layers"]:
        directory = CACHE / layer["id"]
        root_info = fetch(layer["url"], directory / "tileset.json")
        tileset = json.loads((directory / "tileset.json").read_text(encoding="utf-8"))
        uris = sorted(set(tile_uris(tileset["root"])))
        def download(uri):
            clean = safe_relative(uri)
            return {"path": clean, **fetch(urllib.parse.urljoin(layer["url"], uri), directory / clean)}
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            files = list(pool.map(download, uris))
        row = {**layer, "root": root_info, "rootBoundingVolume": tileset["root"]["boundingVolume"],
               "tileCount": len(files), "downloadedBytes": sum(f["bytes"] for f in files), "files": files}
        report["layers"].append(row)
        print(f"{layer['id']}: {len(files)} tiles, {row['downloadedBytes']:,} bytes", flush=True)
    output = ROOT / "docs/spatial-recovery/city-download-manifest.json"
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
