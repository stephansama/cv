#!/usr/bin/env sh

OUTPUT=schema

mkdir -p $OUTPUT

json-refs resolve https://raw.githubusercontent.com/rendercv/rendercv/refs/tags/v2.6/schema.json | json-schema-to-zod json-refs >"$OUTPUT/rendercv.ts"

json-refs resolve https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json | json-schema-to-zod json-refs >"$OUTPUT/resume.ts"

pnpm run build:schema-patch
