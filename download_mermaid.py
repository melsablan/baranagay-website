import base64
import urllib.request
import sys

def generate_image():
    try:
        # Read the mermaid file
        with open('appointment_flow.mmd', 'r') as f:
            mermaid_code = f.read()
        
        # Base64 encode
        graphbytes = mermaid_code.encode("ascii")
        base64_bytes = base64.b64encode(graphbytes)
        base64_string = base64_bytes.decode("ascii")
        
        # Construct URL
        url = "https://mermaid.ink/img/" + base64_string
        
        print(f"Downloading from: {url}")
        
        # Download
        try:
            with urllib.request.urlopen(url) as response:
                if response.status == 200:
                    with open('appointment_flow.png', 'wb') as f:
                        f.write(response.read())
                    print("Successfully saved appointment_flow.png")
                else:
                    print(f"Failed to download. Status code: {response.status}")
        except urllib.error.URLError as e:
            print(f"Download error: {e}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_image()
