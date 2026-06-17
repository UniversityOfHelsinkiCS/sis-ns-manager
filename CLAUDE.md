# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`sis-ns-manager` is a Kubernetes namespace manager for the University of Helsinki's SIS (Student Information System) infrastructure, maintained under the `toska-k8s` GitLab group.

## Git

Do not run any git commands (commit, push, pull, merge, rebase, etc.). Leave all version control operations to the user.

## Environment Files

Do not read `.env` files in this project.

## Network Access

Do not make requests to localhost, 127.x.x.x, or 192.x.x.x addresses.

## Response Style

Keep answers short. Work step by step rather than dumping walls of text, but do not omit important information.

## CI/CD

The GitLab CI pipeline (`gitlab-ci.yml`) uses GitLab's Secret Detection template. When adding pipeline stages, follow the existing pattern of including official GitLab Security templates.
