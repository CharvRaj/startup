import urllib.request
import json

url = "https://vxoghqxyaefjicelvxog.backend.onspace.ai/rest/v1/associate_requests?limit=1"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwODA3MzYwMTQsImlhdCI6MTc2NTM3NjAxNCwiaXNzIjoib25zcGFjZSIsInJlZiI6InZ4b2docXh5YWVmamljZWx2eG9nIiwicm9sZSI6ImFub24ifQ.72xATOHM5V4fzOqxWrx000z9t9bwYeDJrXaU8a5p2KQ"

req = urllib.request.Request(url, headers={
    "apikey": key,
    "Authorization": f"Bearer {key}"
})

try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print("Associate sample:", data)
except Exception as e:
    print("Error:", e)

