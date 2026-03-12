# SocialEcho - Setup Guide

## Prerequisites

Before running the application, make sure you have the following installed:

- Node.js
- MongoDB or MongoDB Atlas account

## Installation

1. Clone the repository

```bash
git clone https://github.com/nz-m/SocialEcho.git
```

2. Go to the project directory and install dependencies for both the client and server

```bash
cd client
npm install
```

```bash
cd server
npm install
```

3. Create a `.env` file in both the `client` and `server` directories and add the environment variables as shown in the `.env.example` files.

4. Start the server

```bash
cd server
npm start
```

5. Start the client

```bash
cd client
npm start
```

## Configuration

Run the `admin_tool.sh` script from the server directory with permissions for executing the script. This script is used for configuring the admin account, creating the initial communities, and other settings.

```bash
./admin_tool.sh
```

### `.env` Variables

For email service of context-based authentication, the following variables are required:

```bash
EMAIL=
PASSWORD=
EMAIL_SERVICE=
```

For content moderation, you need the `PERSPECTIVE_API_KEY` and either the `INTERFACE_API_KEY` or `TEXTRAZOR_API_KEY`. Visit the following links to obtain the API keys:

- [Perspective API](https://developers.perspectiveapi.com/s/docs-get-started)
- [TextRazor API](https://www.textrazor.com/)
- [Hugging Face Interface API](https://huggingface.co/facebook/bart-large-mnli)

If you prefer, the Flask server can be run locally as an alternative to using the Hugging Face Interface API or TextRazor API. Refer to the `classifier_server` directory for more information.

> **Note:** Configuration for context-based authentication and content moderation features are **_not mandatory_** to run the application. However, these features will not be available if the configuration is not provided.

