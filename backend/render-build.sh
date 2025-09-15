#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install wkhtmltopdf
apt-get update && apt-get install -y wkhtmltopdf
