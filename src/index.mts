#!/usr/bin/env node

import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { LocalIndex } from 'vectra';
import OpenAI from 'openai';
import path from 'path';
import dotenv from 'dotenv';
import { Command } from 'commander';
import inquirer from 'inquirer';
import winston from 'winston';
import chalk from 'chalk';
import figlet from 'figlet';
import crypto from 'crypto';
import fs from 'fs';
import UI from './UI.mjs'

// Load environment variables initially
dotenv.config();

/**
 * Main function to start the Universe server.
 * Checks for required configurations, performs setup if needed, and launches the server.
 */
async function main() {
    // Check if essential configurations are missing
    if (!process.env.OPENAI_API_KEY || !process.env.BEARER_TOKEN) {
        await setupConfig();
        dotenv.config({ path: path.join(process.cwd(), '.env') });
    }

    // Set up CLI parsing with Commander
    const program = new Command();
    program
        .option('-p, --port <port>', 'Port to listen on', process.env.PORT || '8080')
        .option('--bearer-token <token>', 'Bearer token for authentication', process.env.BEARER_TOKEN)
        .option('--openai-api-key <key>', 'OpenAI API key', process.env.OPENAI_API_KEY)
        .option('--openai-base-url <url>', 'OpenAI base URL', process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1')
        .option('--embeddings-model <model>', 'Embeddings model to use', process.env.EMBEDDINGS_MODEL || 'text-embedding-ada-002')
        .option('--log-level <level>', 'Log level (debug, info, critical)', process.env.LOG_LEVEL || 'info')
        .option('--data-dir <dir>', 'Directory to store data', process.env.DATA_DIR || './data')
        .option('--log-requests', 'Log incoming requests', process.env.LOG_REQUESTS === 'true')
        .parse(process.argv);

    const config = program.opts();

    // Initialize logger with configurable level
    const logger = winston.createLogger({
        level: config.logLevel,
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`)
        ),
        transports: [new winston.transports.Console()],
    });

    // Initialize OpenAI client
    const api = new OpenAI({
        apiKey: config.openaiApiKey,
        baseURL: config.openaiBaseUrl,
    });

    // Ensure data directory exists
    if (!fs.existsSync(config.dataDir)) {
        fs.mkdirSync(config.dataDir, { recursive: true });
    }

    // Set up Express app
    const app = express();

    // Serve the UI
    app.get('/', (_, res: Response) => {
        res.status(200).set({
            'Content-Type': 'text/html'
        }).send(UI())
    })

    // Parse JSON bodies and set up CORS
    app.use(bodyParser.json({ limit: '100mb' }));
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        res.header('Access-Control-Allow-Methods', '*');
        res.header('Access-Control-Expose-Headers', '*');
        res.header('Access-Control-Allow-Private-Network', 'true');
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
        } else {
            next();
        }
    });

    // Log requests if enabled
    if (config.logRequests) {
        app.use((req: Request, res: Response, next: NextFunction) => {
            logger.info(`Request: ${req.method} ${req.url}`);
            next();
        });
    }

    // Middleware to authenticate bearer token
    const authenticateBearerToken = (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.warn('Missing or invalid authorization header');
            res.status(401).json({
                status: 'error',
                code: 'ERR_NO_AUTH_TOKEN',
                description: 'Authorization header missing or invalid format. Expecting "Bearer [TOKEN]".',
            });
            return
        }

        const token = authHeader.split(' ')[1];
        if (token !== config.bearerToken) {
            logger.warn('Invalid bearer token');
            res.status(403).json({
                status: 'error',
                code: 'ERR_INVALID_AUTH_TOKEN',
                description: 'Provided token is invalid.',
            });
            return
        }

        next();
    };

    app.use(authenticateBearerToken);

    // Store universe indexes
    const universes: { [key: string]: LocalIndex } = {};

    // Helper to get or create an index for a universe
    const getIndex = async (universe: string): Promise<LocalIndex> => {
        let index = universes[universe];
        if (!index) {
            index = new LocalIndex(path.join(config.dataDir, universe));
            if (!await index.isIndexCreated()) {
                await index.createIndex();
            }
            universes[universe] = index;
        }
        return index;
    };

    // Helper to get embedding vector
    const getVector = async (text: string): Promise<number[]> => {
        try {
            const response = await api.embeddings.create({
                model: config.embeddingsModel,
                input: text,
            });
            return response.data[0].embedding;
        } catch (error) {
            logger.error('Error getting vector:', error);
            throw error;
        }
    };

    // Routes

    /**
     * POST /emit
     * Emits (adds) one or multiple things to a specified universe.
     *
     * **Parameters:**
     * - `universe` (string, required): The name of the universe.
     * - `thing` (object, optional): A single thing with `text` (required) and `id` (optional).
     * - `things` (array, optional): An array of things, each with `text` (required) and `id` (optional).
     * - `replace` (string, optional): If provided, replaces the thing with this ID.
     *
     * **Returns:**
     * - `200`: `{ status: 'success' }`
     * - `400`: `{ error: 'Description of the error' }`
     * - `500`: `{ error: 'Internal server error' }`
     *
     * **Errors:**
     * - "Universe is required."
     * - "You cannot provide both 'thing' and 'things'."
     * - "'things' must be an array of objects with 'text' and optional 'id'."
     * - "'thing' must be an object with 'text' and optional 'id'."
     * - "Invalid universe name." (only alphanumeric and underscores allowed)
     */
    app.post('/emit', async (req: Request, res: Response): Promise<void> => {
        try {
            const { universe, thing, things, replace }: {
                universe: string;
                thing?: { text: string; id?: string };
                things?: { text: string; id?: string }[];
                replace?: string;
            } = req.body;

            if (!universe) {
                res.status(400).json({ error: 'Universe is required.' });
                return;
            }
            if (!/^[a-zA-Z0-9_]+$/.test(universe)) {
                res.status(400).json({ error: 'Invalid universe name.' });
                return;
            }
            if (thing && things) {
                res.status(400).json({ error: 'You cannot provide both "thing" and "things".' });
                return;
            }
            if (things && (!Array.isArray(things) || !things.every(t => typeof t === 'object' && 'text' in t))) {
                res.status(400).json({ error: '"things" must be an array of objects with "text" and optional "id".' });
                return
            }
            if (thing && (typeof thing !== 'object' || !('text' in thing))) {
                res.status(400).json({ error: '"thing" must be an object with "text" and optional "id".' });
                return
            }

            const index = await getIndex(universe);

            const insertThing = async (t: { text: string; id?: string }) => {
                const vector = await getVector(t.text);
                if (t.id) {
                    const items = await index.listItems();
                    if (items.find(item => item.id === t.id)) {
                        await index.deleteItem(t.id);
                    }
                    await index.insertItem({ id: t.id, vector, metadata: { text: t.text } });
                } else {
                    await index.insertItem({ vector, metadata: { text: t.text } });
                }
            };

            if (things) await Promise.all(things.map(insertThing));
            else if (thing) await insertThing(thing);
            if (replace) await index.deleteItem(replace);

            res.status(200).json({ status: 'success' });
        } catch (error) {
            logger.error('Error in /emit:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * POST /resonate
     * Resonates (queries) with a thing in a specified universe.
     *
     * **Parameters:**
     * - `universe` (string, required): The name of the universe.
     * - `thing` (string, required): The text to resonate with.
     * - `reach` (number, optional): Number of results to return (default: 10).
     *
     * **Returns:**
     * - `200`: `{ status: 'success', results: [{ closeness: number, thing: string, id: string }] }`
     * - `400`: `{ error: 'Description of the error' }`
     * - `500`: `{ error: 'Internal server error' }`
     *
     * **Errors:**
     * - "Universe is required."
     * - "Thing is required."
     * - "Reach must be a positive integer."
     * - "Invalid universe name."
     */
    app.post('/resonate', async (req: Request, res: Response): Promise<void> => {
        try {
            const { universe, thing, reach }: { universe: string; thing: string; reach?: number } = req.body;

            if (!universe) {
                res.status(400).json({ error: 'Universe is required.' });
                return;
            }
            if (!/^[a-zA-Z0-9_]+$/.test(universe)) {
                res.status(400).json({ error: 'Invalid universe name.' });
                return;
            }
            if (!thing) {
                res.status(400).json({ error: 'Thing is required.' });
                return;
            }
            if (reach !== undefined && (!Number.isInteger(reach) || reach < 1)) {
                res.status(400).json({ error: 'Reach must be a positive integer.' });
                return;
            }

            const index = await getIndex(universe);
            const results = await index.queryItems(await getVector(thing), reach || 10);
            res.status(200).json({
                status: 'success',
                results: results.map(x => ({ closeness: x.score, thing: x.item.metadata.text, id: x.item.id })),
            });
        } catch (error) {
            logger.error('Error in /resonate:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * DELETE /thing/:universe/:id
     * Deletes a specific thing from a universe.
     *
     * **Parameters:**
     * - `universe` (string, required, path): The name of the universe.
     * - `id` (string, required, path): The ID of the thing to delete.
     *
     * **Returns:**
     * - `200`: `{ status: 'success' }`
     * - `400`: `{ error: 'Description of the error' }`
     * - `500`: `{ error: 'Internal server error' }`
     *
     * **Errors:**
     * - "Universe is required."
     * - "ID is required."
     * - "Invalid universe name."
     */
    app.delete('/thing/:universe/:id', async (req: Request, res: Response): Promise<void> => {
        try {
            const { universe, id } = req.params;

            if (!universe) {
                res.status(400).json({ error: 'Universe is required.' });
                return;
            }
            if (!/^[a-zA-Z0-9_]+$/.test(universe)) {
                res.status(400).json({ error: 'Invalid universe name.' });
                return;
            }
            if (!id) {
                res.status(400).json({ error: 'ID is required.' });
                return;
            }

            const index = await getIndex(universe);
            await index.deleteItem(id);
            res.status(200).json({ status: 'success' });
        } catch (error) {
            logger.error('Error in DELETE /thing:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * DELETE /universe/:universe
     * Deletes all things from a specified universe.
     *
     * **Parameters:**
     * - `universe` (string, required, path): The name of the universe.
     *
     * **Returns:**
     * - `200`: `{ status: 'success' }`
     * - `400`: `{ error: 'Description of the error' }`
     * - `500`: `{ error: 'Internal server error' }`
     *
     * **Errors:**
     * - "Universe is required."
     * - "Invalid universe name."
     */
    app.delete('/universe/:universe', async (req: Request, res: Response): Promise<void> => {
        try {
            const { universe } = req.params;

            if (!universe) {
                res.status(400).json({ error: 'Universe is required.' });
                return;
            }
            if (!/^[a-zA-Z0-9_]+$/.test(universe)) {
                res.status(400).json({ error: 'Invalid universe name.' });
                return;
            }
            try {
                delete universes[universe];
                fs.rmdirSync(path.join(config.dataDir, universe));
                res.status(200).json({ status: 'success' });
            } catch (_) {
                res.status(404).json({ error: 'Universe not found.' })
            }
        } catch (error) {
            logger.error('Error in DELETE /universe:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Start the server with a splash screen
    app.listen(config.port, () => {
        console.log(chalk.blue(figlet.textSync('Universe', { horizontalLayout: 'full' })));
        console.log(chalk.green(`The universe is listening on port ${config.port} 🚀`));
    });
}

/**
 * Sets up the configuration interactively if essential settings are missing.
 * Creates a .env file with user-provided or default values.
 */
async function setupConfig() {
    if (fs.existsSync(path.join(process.cwd(), '.env'))) {
        console.log('A .env file already exists. Please edit it manually if needed.');
        process.exit(1);
    }

    console.log(chalk.cyan('Welcome to Universe setup! 🌌'));
    console.log('We need some info to get your Universe server running smoothly.');

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'openaiApiKey',
            message: 'Enter your OpenAI API key:',
            validate: (input: string) => input.trim() ? true : 'API key is required!',
        },
        {
            type: 'confirm',
            name: 'generateBearerToken',
            message: 'Generate a random bearer token for you? (Recommended)',
            default: true,
        },
        {
            type: 'input',
            name: 'bearerToken',
            message: 'Enter your bearer token:',
            when: (answers: any) => !answers.generateBearerToken,
            validate: (input: string) => input.trim() ? true : 'Bearer token is required!',
        },
        {
            type: 'input',
            name: 'port',
            message: 'Port to listen on:',
            default: '8080',
            validate: (input: string) => !isNaN(parseInt(input)) ? true : 'Must be a number!',
        },
        {
            type: 'input',
            name: 'openaiBaseUrl',
            message: 'OpenAI base URL:',
            default: 'https://api.openai.com/v1',
        },
        {
            type: 'input',
            name: 'embeddingsModel',
            message: 'Embeddings model to use:',
            default: 'text-embedding-ada-002',
        },
        {
            type: 'input',
            name: 'logLevel',
            message: 'Log level (debug, info, critical):',
            default: 'info',
            validate: (input: string) => ['debug', 'info', 'critical'].includes(input) ? true : 'Must be debug, info, or critical!',
        },
        {
            type: 'input',
            name: 'dataDir',
            message: 'Directory to store data:',
            default: './data',
        },
        {
            type: 'confirm',
            name: 'logRequests',
            message: 'Log incoming requests?',
            default: false,
        },
    ]);

    if (answers.generateBearerToken) {
        answers.bearerToken = crypto.randomBytes(32).toString('hex');
        console.log(chalk.yellow(`Generated bearer token: ${answers.bearerToken}`));
        console.log('Keep this safe—it’s your key to the Universe! 🔑');
    }

    const envContent = `
PORT=${answers.port}
BEARER_TOKEN=${answers.bearerToken}
OPENAI_API_KEY=${answers.openaiApiKey}
OPENAI_BASE_URL=${answers.openaiBaseUrl}
EMBEDDINGS_MODEL=${answers.embeddingsModel}
LOG_LEVEL=${answers.logLevel}
DATA_DIR=${answers.dataDir}
LOG_REQUESTS=${answers.logRequests.toString()}
    `.trim();

    fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);
    console.log(chalk.green('.env file created successfully! 🎉'));
}

// Run the server and handle startup errors
main().catch(error => {
    console.error(chalk.red('Fatal error:', error));
    process.exit(1);
});
