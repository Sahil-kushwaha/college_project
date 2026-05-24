import path from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up one level to reach worker/temp from worker/utils
const TEMP_DIR = path.join(__dirname, '..', 'temp');

/**
 * Get file extension for a given language
 */
export const getFileExtension = (language) => {
  const extensions = {
    javascript: 'js',
    python: 'py',
    cpp: 'cpp'
  };
  return extensions[language] || 'txt';
};

/**
 * Build Docker command for executing code
 * @param {string} language - Programming language
 * @param {string} fileName - Code file name
 * @returns {string} Docker command to execute
 */
export const getDockerCommand = (language, fileName) => {
  switch (language) {
    case 'javascript':
      return `docker run -i \
        --rm \
        --memory=100m \
        --cpus=0.5 \
        --network=none \
        -v codemate_codemate-worker-temp:/app/temp \
        -w /app/temp \
        node:lts-alpine node ${fileName}`;

    case 'python':
      return `docker run -i \
        --rm \
        --memory=100m \
        --cpus=0.5 \
        --network=none \
        -v codemate_codemate-worker-temp:/app/temp \
        -w /app/temp \
        python:3.9-slim python ${fileName}`;

    case 'cpp':
      const cppOutput = fileName.replace('.cpp', '');
      return `docker run -i \
        --rm \
        --memory=100m \
        --cpus=0.5 \
        --network=none \
        -v codemate_codemate-worker-temp:/app/temp \
        -w /app/temp \
        gcc:latest /bin/bash -c "g++ ${fileName} -o ${cppOutput} && ./${cppOutput}"`;

    default:
      throw new Error(`Unsupported language: ${language}`);
  }
};

export default {
  getFileExtension,
  getDockerCommand
};
