import requests
import json
import time

SUPABASE_URL = "https://tyneeznaprtomxuhmsti.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bmVlem5hcHJ0b214dWhtc3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NTQzMzgsImV4cCI6MjA4OTQzMDMzOH0.E8JKkd6P-y0lZ4xSa8Ftm2XRiVLdnOnRx1XGcXTkH-g"
API_URL = "http://localhost:3333"

def run_test():
    print("=== IDEAL LIQUID 2.0 E2E AUTOMATED TEST ===")
    
    # 1. Signup via Supabase
    res = requests.post(
        f"{SUPABASE_URL}/auth/v1/signup",
        headers={"apikey": SUPABASE_ANON_KEY},
        json={"email": f"test_e2e_{int(time.time())}@mktreal.com.br", "password": "TestPassword123!"}
    )
    token = res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create New Project to fetch fresh Catalog Schema
    res = requests.post(f"{API_URL}/m1/projects", json={
        "clientCompanyName": "Liquid 2.0 Automation Test", 
        "cnpj": "12.345.678/0001-99",
        "segment": "Technology",
        "expectedEndAt": "2026-12-31"
    }, headers=headers)
    project_id = res.json()["project"]["id"]
    
    # 5. Fetch Stage E to check for Phase 9 and Phase 11
    print("\n=> Fetching Stage E (Estrutura)")
    res = requests.get(f"{API_URL}/m1/projects/{project_id}/methodology/E/FORMULARIO_ESTRUTURA", headers=headers)
    est = res.json()
    if est.get("ok"):
       print("Computed Suggestions for Structure length:", len(est.get("computed_suggestions", [])))
       fields = [f for s in est.get("artifact", {}).get("sections", []) for f in s.get("fields", [])]
       types = [f["type"] for f in fields]
       codes = [f["code"] for f in fields]
       print("Found codes:", codes)
       print("Found types:", types)
       if "file" in types:
           print("[SUCCESS] Phase 9 File Upload Field verified.")
       else:
           print("[FAILURE] No file input in Structure.")
    else:
       print("Failed to load FORMULARIO_ESTRUTURA:", est)
        
    print("\n=== E2E Completed ===")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"Test crashed: {e}")
