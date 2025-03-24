# 🌌 Universe

Welcome to **Universe** — a powerful, easy-to-use web server, embedder, and vector database designed for developers who want to work with embeddings and vector-based queries effortlessly. With Universe, you can "emit" (store) and "resonate" (query) with text-based "things" in a universe of your choice, leveraging the power of the latest embedding models from multiple providers.

Universe is built to be production-ready, highly configurable, and delightful to use. Whether you're building AI-powered applications, experimenting with vector databases, or just exploring the possibilities of embeddings, Universe has got you covered! 🚀

---

## ✨ Features

- **Simple CLI Interface**: Get started with just a few commands.
- **Flexible Configuration**: Use environment variables, CLI flags, or an interactive setup to configure your server.
- **Multiple Embedding Providers**: Choose between OpenAI, Voyage, or other providers for generating embeddings.
- **Secure Authentication**: Protect your server with bearer token authentication.
- **Robust Error Handling**: Built-in error handling and logging for a smooth development experience.
- **Interactive Setup**: Get up and running quickly with an easy-to-follow setup process.
- **Beautiful Console Output**: Enjoy colorful logs and a splash screen that makes development fun.
- **Web UI**: Easily interact with the system through your browser.

---

## 📦 Installation

To install Universe globally, run:

```bash
npm i -g @shoprag/universe
```

This will make the `universe` CLI command available on your system.

---

## 🚀 Quick Start

After installation, simply run:

```bash
universe
```

If this is your first time, Universe will guide you through an interactive setup to configure your server, including selecting an embedding provider and entering the necessary API keys. Once set up, your Universe server will start, and you'll be ready to emit and resonate with things!

---

## 🛠️ Usage

Universe provides a simple CLI to manage your server:

- **Start the Server**: 
  ```bash
  universe
  ```
  Launches the server with the configured settings. The web UI can be accessed from a browser.

- **Help**: 
  ```bash
  universe --help
  ```
  Displays all available options and commands.

- **Custom Configuration**:  
  You can override default settings using CLI flags. For example:

  ```bash
  universe --port 3000 --log-level debug --provider openai --api-key sk-...
  ```

  Available flags:
  - `--port <port>`: Port to listen on (default: 8080)
  - `--provider <provider>`: Embedding provider (e.g., `openai`, `voyage`) (default: `openai`)
  - `--api-key <key>`: API key for the selected provider
  - `--model <model>`: Embedding model to use (provider-specific)
  - `--base-url <url>`: Base URL for the provider (only for OpenAI, default: https://api.openai.com/v1)
  - `--bearer-token <token>`: Bearer token for authentication
  - `--log-level <level>`: Log level (debug, info, critical) (default: info)
  - `--data-dir <dir>`: Directory to store data (default: ./data)
  - `--log-requests`: Log incoming requests (default: false)

---

## 🔧 Configuration

Universe is highly configurable:

- **Environment Variables**: Set variables in a `.env` file or directly in your environment. Key variables include:
  - `PROVIDER`: The embedding provider (e.g., `openai`, `voyage`)
  - `API_KEY`: API key for the selected provider
  - `MODEL`: Embedding model (provider-specific)
  - `BASE_URL`: Base URL for the provider (only for OpenAI)
  - `PORT`, `BEARER_TOKEN`, `LOG_LEVEL`, `DATA_DIR`, `LOG_REQUESTS`
- **CLI Flags**: Override settings on the fly when starting the server.
- **Interactive Setup**: If essential settings are missing, Universe will prompt you to configure them interactively, including selecting the provider and entering provider-specific details.

During setup, you'll be asked for:
- Embedding provider (e.g., OpenAI or Voyage)
- Provider-specific API key and model
- Bearer token (with an option to generate one automatically)
- Port, log level, data directory, and more

All settings are saved in a `.env` file for future use.

---

## 📡 API Documentation

Universe exposes a RESTful API for interacting with your universes. The API remains the same regardless of the embedding provider chosen.

### Authentication

All requests must include a bearer token in the `Authorization` header:

```
Authorization: Bearer YOUR_BEARER_TOKEN
```

### Endpoints

#### **POST /emit**

- **Description**: Emit (add) one or multiple things to a universe.
- **Body**:
  - `universe` (string, required): The universe name.
  - `thing` (object, optional): A single thing with `text` (required) and `id` (optional).
  - `things` (array, optional): An array of things, each with `text` and optional `id`.
  - `replace` (string, optional): Replace the thing with this ID.
- **Response**: 
  ```json
  { "status": "success" }
  ```

#### **POST /resonate**

- **Description**: Resonate (query) with a thing in a universe.
- **Body**:
  - `universe` (string, required): The universe name.
  - `thing` (string, required): The text to resonate with.
  - `reach` (number, optional): Number of results to return (default: 10).
- **Response**: 
  ```json
  { 
    "status": "success", 
    "results": [{ "closeness": number, "thing": string, "id": string }] 
  }
  ```

#### **DELETE /thing/:universe/:id**

- **Description**: Delete a specific thing from a universe.
- **Parameters**:
  - `universe` (string, required): The universe name.
  - `id` (string, required): The ID of the thing to delete.
- **Response**: 
  ```json
  { "status": "success" }
  ```

#### **DELETE /universe/:universe**

- **Description**: Delete all things from a universe.
- **Parameters**:
  - `universe` (string, required): The universe name.
- **Response**: 
  ```json
  { "status": "success" }
  ```

---

## 🤝 Contributing

We welcome contributions to Universe! If you have ideas, bug reports, or want to contribute code, please:

1. Check out the [GitHub repository](https://github.com/shoprag/universe).
2. Open an issue or submit a pull request.

---

## 📄 License

Universe is licensed under the MIT License.
