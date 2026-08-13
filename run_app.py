import os
import sys
import subprocess
import threading
import time
import webbrowser

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def check_python_dependencies():
    print("--> Verificando dependencias de Python...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", os.path.join(ROOT_DIR, "requirements.txt")], check=True)

def build_frontend():
    frontend_dir = os.path.join(ROOT_DIR, "frontend")
    dist_dir = os.path.join(frontend_dir, "dist")
    
    if not os.path.exists(os.path.join(frontend_dir, "node_modules")):
        print("--> Instalando paquetes de React (npm install)...")
        subprocess.run(["npm", "install"], cwd=frontend_dir, shell=True, check=True)

    print("--> Compilando aplicación React para producción...")
    subprocess.run(["npm", "run", "build"], cwd=frontend_dir, shell=True, check=True)

def start_backend():
    print("--> Iniciando servidor backend FastAPI en http://localhost:8000...")
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)

def open_browser():
    time.sleep(2)
    print("--> Abriendo TotoMax en el navegador...")
    webbrowser.open("http://localhost:8000")

if __name__ == "__main__":
    print("==================================================")
    print("   Iniciando TotoMax - Downloader & Media Trimmer ")
    print("==================================================")
    
    check_python_dependencies()
    build_frontend()
    
    threading.Thread(target=open_browser, daemon=True).start()
    start_backend()
