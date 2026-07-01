#!/usr/bin/env python3
"""Backend locale per il paziente IA.

Avvio:
    OPENAI_API_KEY="sk-..." python3 ai-backend.py

Opzionale:
    OPENAI_MODEL="gpt-4.1-mini" OPENAI_API_KEY="sk-..." python3 ai-backend.py
"""

import json
import mimetypes
import os
from pathlib import Path
import sys
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from threading import Lock


HOST = os.environ.get("HOST") or ("0.0.0.0" if os.environ.get("PORT") else "127.0.0.1")
PORT = int(os.environ.get("PORT") or os.environ.get("AI_BACKEND_PORT", "8787"))
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")
OPENAI_URL = "https://api.openai.com/v1/responses"
BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = Path(os.environ.get("HOSPITAL_DATA_FILE", BASE_DIR / "hospital-data.json"))
DATA_LOCK = Lock()
STATE_KEYS = [
    "pazienti",
    "archivio",
    "personale",
    "logAzioni",
    "interventi118",
    "interventi118Archivio",
    "intervento118Counter",
    "ambulanze",
    "saleOperatorie",
    "ruoliOspedale",
]


def empty_state():
    return {
        "pazienti": [],
        "archivio": [],
        "personale": [],
        "logAzioni": [],
        "interventi118": [],
        "interventi118Archivio": [],
        "intervento118Counter": 0,
        "ambulanze": [
            {"id": "A1", "nome": "Ambulanza 1"},
            {"id": "A2", "nome": "Ambulanza 2"},
            {"id": "A3", "nome": "Ambulanza 3"},
        ],
        "saleOperatorie": [],
        "ruoliOspedale": None,
        "updatedAt": None,
    }


def load_state():
    with DATA_LOCK:
        if not DATA_FILE.exists():
            return empty_state()
        try:
            data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        except Exception:
            data = {}
        state = empty_state()
        for key in STATE_KEYS:
            if key in data:
                state[key] = data[key]
        state["updatedAt"] = data.get("updatedAt")
        return state


def save_state(payload):
    state = empty_state()
    for key in STATE_KEYS:
        if key in payload:
            state[key] = payload[key]
    state["updatedAt"] = payload.get("updatedAt") or __import__("datetime").datetime.utcnow().isoformat() + "Z"
    with DATA_LOCK:
        DATA_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    return state


def json_response(handler, status, payload):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    handler.send_header("Content-Length", str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)


def extract_text(response_json):
    if response_json.get("output_text"):
        return response_json["output_text"]
    chunks = []
    for item in response_json.get("output", []):
        for content in item.get("content", []):
            if content.get("type") in ("output_text", "text"):
                chunks.append(content.get("text", ""))
    return "\n".join(chunks).strip()


def call_openai(system, user_text):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY non impostata")

    payload = {
        "model": OPENAI_MODEL,
        "input": [
            {"role": "system", "content": system},
            {"role": "user", "content": user_text},
        ],
        "temperature": 0.8,
        "max_output_tokens": 280,
    }
    req = urllib.request.Request(
        OPENAI_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=35) as res:
            body = json.loads(res.read().decode("utf-8"))
            text = extract_text(body)
            if not text:
                raise RuntimeError("Risposta OpenAI senza testo")
            return text
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")
        try:
            parsed = json.loads(detail)
            message = parsed.get("error", {}).get("message") or detail
        except Exception:
            message = detail
        if exc.code == 429:
            raise RuntimeError(
                "OpenAI ha risposto 429 Too Many Requests: quota/credito esaurito o limite di richieste raggiunto. "
                + message
            ) from exc
        raise RuntimeError(f"Errore OpenAI {exc.code}: {message}") from exc
    except urllib.error.URLError as exc:
        if "CERTIFICATE_VERIFY_FAILED" in str(exc):
            raise RuntimeError(
                "Certificati SSL Python non configurati. Su macOS esegui Install Certificates.command "
                "della tua installazione Python, poi riavvia ai-backend.py."
            ) from exc
        raise


def static_response(handler, rel_path):
    safe = rel_path.strip("/") or "index.html"
    if safe in ("", "."):
        safe = "index.html"
    target = (BASE_DIR / safe).resolve()
    if not str(target).startswith(str(BASE_DIR)) or not target.exists() or not target.is_file():
        json_response(handler, 404, {"error": "file non trovato"})
        return
    data = target.read_bytes()
    content_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
    if target.suffix == ".js":
        content_type = "text/javascript; charset=utf-8"
    elif target.suffix in (".html", ".css", ".md"):
        content_type = f"{content_type}; charset=utf-8"
    handler.send_response(200)
    handler.send_header("Content-Type", content_type)
    handler.send_header("Content-Length", str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def do_OPTIONS(self):
        json_response(self, 200, {"ok": True})

    def do_GET(self):
        if self.path == "/health":
            json_response(self, 200, {
                "ok": True,
                "model": OPENAI_MODEL,
                "hasKey": bool(os.environ.get("OPENAI_API_KEY")),
                "database": str(DATA_FILE),
            })
            return
        if self.path == "/api/state":
            json_response(self, 200, load_state())
            return
        if self.path.startswith("/api/"):
            json_response(self, 404, {"error": "endpoint non trovato"})
            return
        static_response(self, self.path.split("?", 1)[0])

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
        except json.JSONDecodeError:
            json_response(self, 400, {"error": "JSON non valido"})
            return

        if self.path == "/patient-chat":
            try:
                system = payload.get("system", "")
                domanda = payload.get("domanda", "")
                chat = payload.get("chat", [])
                history = "\n".join(
                    f"{m.get('from', 'operatore')}: {m.get('text', '')}" for m in chat[-8:]
                )
                user_text = f"Storico recente:\n{history}\n\nDomanda operatore:\n{domanda}"
                text = call_openai(system, user_text)
                json_response(self, 200, {"text": text, "model": OPENAI_MODEL})
            except Exception as exc:
                json_response(self, 502, {"error": str(exc)})
            return

        if self.path == "/debrief":
            try:
                system = (
                    "Sei un tutor di simulazione clinica. Produci un debrief sintetico, "
                    "didattico e non punitivo, basato solo sui dati ricevuti."
                )
                user_text = json.dumps(payload, ensure_ascii=False)
                text = call_openai(system, user_text)
                json_response(self, 200, {"text": text, "model": OPENAI_MODEL})
            except Exception as exc:
                json_response(self, 502, {"error": str(exc)})
            return

        if self.path == "/api/state":
            try:
                state = save_state(payload)
                json_response(self, 200, {"ok": True, "updatedAt": state["updatedAt"]})
            except Exception as exc:
                json_response(self, 500, {"error": str(exc)})
            return

        json_response(self, 404, {"error": "endpoint non trovato"})


def main():
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Backend IA pronto su http://{HOST}:{PORT}")
    print(f"Modello: {OPENAI_MODEL}")
    print("Chiave API:", "presente" if os.environ.get("OPENAI_API_KEY") else "mancante")
    server.serve_forever()


if __name__ == "__main__":
    main()
