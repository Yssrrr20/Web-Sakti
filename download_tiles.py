import requests
import os
import math
from PIL import Image # Perlu Pillow

# Helper functions for tile calculations
def lon_to_x(lon, zoom):
    return math.floor((lon + 180) / 360 * (2 ** zoom))

def lat_to_y(lat, zoom):
    lat_rad = math.radians(lat)
    return math.floor((1 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2 * (2 ** zoom))

# Konfigurasi
MIN_LAT = -6.5521184511 - 0.001 # Tambah margin
MIN_LON = 106.7163111719 - 0.001 # Tambah margin
MAX_LAT = -6.5503091233 + 0.001 # Tambah margin
MAX_LON = 106.7171265634 + 0.001 # Tambah margin
MIN_ZOOM = 14    # Sesuaikan
MAX_ZOOM = 19    # Sesuaikan (lebih tinggi dari 18 untuk buffer)

OUTPUT_DIR = "offline_map_tiles" # Nama folder tempat ubin akan disimpan

TILE_SERVER_URL = "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
HEADERS = {'User-Agent': 'YourAppName/1.0 (your-email@example.com)'} # Penting: Isi ini!

def download_tile(url, save_path):
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    if os.path.exists(save_path):
        # print(f"Skipping existing tile: {save_path}") # Bisa diaktifkan jika ingin lihat skipping
        return True
    try:
        response = requests.get(url, headers=HEADERS, stream=True)
        response.raise_for_status() # Raise an exception for HTTP errors
        with open(save_path, 'wb') as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        print(f"Downloaded: {save_path}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error downloading {url}: {e}")
        return False

def main():
    print(f"Starting tile download to {OUTPUT_DIR}...")
    for z in range(MIN_ZOOM, MAX_ZOOM + 1):
        print(f"Processing zoom level: {z}")
        start_x_tile = lon_to_x(MIN_LON, z)
        end_x_tile = lon_to_x(MAX_LON, z)
        start_y_tile = lat_to_y(MAX_LAT, z) # Max lat corresponds to min Y tile index
        end_y_tile = lat_to_y(MIN_LAT, z)   # Min lat corresponds to max Y tile index

        print(f"Zoom {z}: X range [{start_x_tile}, {end_x_tile}], Y range [{start_y_tile}, {end_y_tile}]")
        num_tiles_expected = (end_x_tile - start_x_tile + 1) * (end_y_tile - start_y_tile + 1)
        print(f"Expected tiles for zoom {z} (per subdomain): {num_tiles_expected}")


        for x in range(start_x_tile, end_x_tile + 1):
            for y in range(start_y_tile, end_y_tile + 1):
                # Ini adalah loop utama yang harusnya menghasilkan setiap kombinasi x dan y unik
                tile_url = TILE_SERVER_URL.format(z=z, x=x, y=y)
                save_path = os.path.join(OUTPUT_DIR, str(z), str(x), f"{y}.png") # Ini sudah benar
                download_tile(tile_url, save_path)
    print("Download complete.")

if __name__ == "__main__":
    main()