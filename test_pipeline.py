import io
import requests
from PIL import Image, ImageDraw, ImageFont

def create_sample_image(text_lines):
    img = Image.new("RGB", (800, 600), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    y = 50
    for line in text_lines:
        draw.text((50, y), line, fill=(0, 0, 0))
        y += 40
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf

# Front panel test
front_lines = [
    "DELICIOUS CHOCOLATE",
    "Net Wt: 50 g",
    "Composite Chocolate"
]
front_img = create_sample_image(front_lines)

# Back panel test
back_lines = [
    "MFD: 08/2026",
    "MRP: Rs. 25.00",
    "Mfd by: Good Foods Pvt Ltd",
    "Distt Solan, Pin 173220",
    "Customer Care: 1800-123-456"
]
back_img = create_sample_image(back_lines)

files = {
    "front": ("front.jpg", front_img, "image/jpeg"),
    "back": ("back.jpg", back_img, "image/jpeg")
}

print("Sending request to http://localhost:8000/evaluate ...")
response = requests.post("http://localhost:8000/evaluate", files=files)
print(f"Status Code: {response.status_code}")
print("Response JSON:")
import json
print(json.dumps(response.json(), indent=2))
