import base64
import zlib
import urllib.request
import urllib.error

def generate_image():
    try:
        # Read the mermaid file
        with open('appointment_flow.mmd', 'r') as f:
            mermaid_code = f.read()
        
        # 1. Encode to UTF-8
        utf8_bytes = mermaid_code.encode('utf-8')
        
        # 2. Compress with zlib (level 9)
        compressed_bytes = zlib.compress(utf8_bytes, 9)
        
        # 3. Base64 URL Safe Encode
        base64_bytes = base64.urlsafe_b64encode(compressed_bytes)
        base64_string = base64_bytes.decode('ascii')
        
        # Kroki URL
        url = "https://kroki.io/mermaid/png/" + base64_string
        
        print(f"Downloading from: {url}")
        
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                if response.status == 200:
                    with open('appointment_flow.png', 'wb') as f:
                        f.write(response.read())
                    print("Successfully saved appointment_flow.png")
                else:
                    print(f"Failed to download. Status code: {response.status}")
        except urllib.error.HTTPError as e:
            print(f"HTTP Error: {e.code} {e.reason}")
        except urllib.error.URLError as e:
            print(f"URL Error: {e.reason}")
            
    except Exception as e:
        print(f"General Error: {e}")

if __name__ == "__main__":
    generate_image()
