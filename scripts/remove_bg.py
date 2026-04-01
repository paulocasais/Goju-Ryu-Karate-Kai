from PIL import Image
from collections import deque
import sys

def remove_white_background(input_path, output_path, tolerance=50):
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    pixels = img.load()

    visited = set()
    queue = deque()

    def is_white(r, g, b):
        return r > (255 - tolerance) and g > (255 - tolerance) and b > (255 - tolerance)

    def try_seed(x, y):
        if 0 <= x < w and 0 <= y < h and (x, y) not in visited:
            r, g, b, a = pixels[x, y]
            if is_white(r, g, b):
                queue.append((x, y))
                visited.add((x, y))

    # Seed from entire perimeter border
    for x in range(w):
        try_seed(x, 0)
        try_seed(x, h-1)
    for y in range(h):
        try_seed(0, y)
        try_seed(w-1, y)

    # First pass: remove exterior white
    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (255, 255, 255, 0)
        for nx, ny in [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]:
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                r, g, b, a = pixels[nx, ny]
                if is_white(r, g, b):
                    queue.append((nx, ny))
                    visited.add((nx, ny))

    # Now scan the entire image for any remaining white pixels (inside enclosed areas)
    # and make them transparent too
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if is_white(r, g, b):
                pixels[x, y] = (255, 255, 255, 0)

    img.save(output_path, "PNG")
    print(f"Saved transparent PNG to: {output_path} ({w}x{h})")

if __name__ == "__main__":
    inp = sys.argv[1]
    out = sys.argv[2]
    tol = int(sys.argv[3]) if len(sys.argv) > 3 else 50
    remove_white_background(inp, out, tol)
