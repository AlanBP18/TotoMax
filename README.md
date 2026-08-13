# TotoMax

TotoMax es una solución estandarizada para la descarga y el procesamiento de contenido multimedia. Este documento describe la arquitectura tecnológica empleada en el proyecto y establece los términos de licencia, uso y atribución de su código fuente.

---

## Descripción Tecnológica

El sistema está estructurado mediante una arquitectura cliente-servidor orientada al rendimiento, la eficiencia asíncrona y la comunicación en tiempo real.

### Backend

* **Python**: Lenguaje de programación principal, utilizado por su capacidad de integración en el procesamiento de datos y bibliotecas multimedia.
* **FastAPI y Uvicorn**: Framework web de alto rendimiento y servidor ASGI encargados de gestionar la API RESTful y la comunicación asíncrona con mínima latencia.
* **yt-dlp**: Motor principal de extracción y procesamiento de archivos de video y audio desde diversas plataformas web.
* **WebSockets**: Protocolo de comunicación bidireccional en tiempo real utilizado para transmitir el estado de descarga y progreso al cliente sin necesidad de sondeo (polling).
* **FFmpeg**: Herramienta de procesamiento multimedia empleada en la conversión, multiplexado y codificación de flujos de audio y video.

### Frontend

* **React y Vite**: Entorno de desarrollo e interfaz de usuario basada en componentes reactivos, seleccionados para garantizar tiempos de carga reducidos y una navegación fluida.
* **Lucide React**: Colección de iconografía vectorial estandarizada para la interfaz gráfica.

---

## Instrucciones de Despliegue Local

### Módulo Servidor (Backend)
```bash
pip install -r requirements.txt
python run_app.py
```

### Módulo Cliente (Frontend)
```bash
cd frontend
npm install
npm run dev
```

---

## Licencia y Reconocimiento de Créditos

Este código fuente está disponible para su libre uso, ejecución y modificación por parte de cualquier usuario o desarrollador.

No obstante, en caso de utilizar, redistribuir, republicar o integrar este proyecto (de forma total o parcial, con o sin modificaciones) en otros repositorios o aplicaciones, **es obligatorio otorgar la correspondiente atribución y créditos explícitos al autor original**, incluyendo un enlace directo a este repositorio de origen.
