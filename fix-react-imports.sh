#!/bin/bash

# ============================================================
# Fix React Imports - Safe / No Duplicate Version
# ============================================================
# Recursively scans app/ for:
#   .tsx .ts .jsx .js
#
# Features:
#   - Never adds duplicate React hooks/types
#   - Detects existing React imports
#   - Merges missing named imports into an existing import
#   - Supports multiline React imports
#   - Supports "use client" / 'use client'
#   - Skips node_modules, .next, dist, build
#   - No Bash process substitution (< <(...))
#   - macOS compatible
#
# Usage:
#   chmod +x fix-react-imports.sh
#   ./fix-react-imports.sh
#
# ============================================================

set -u

ROOT_DIR="${1:-app}"
FIXED_COUNT=0
SKIPPED_COUNT=0
SCANNED_COUNT=0

echo ""
echo "============================================================"
echo "🔧 React Import Fixer — SAFE / NO DUPLICATES"
echo "============================================================"
echo "📁 Target : $ROOT_DIR/"
echo "📦 Types  : .tsx .ts .jsx .js"
echo "🔍 Mode   : Recursive"
echo "============================================================"
echo ""

if [ ! -d "$ROOT_DIR" ]; then
    echo "❌ Directory '$ROOT_DIR' tidak ditemukan."
    echo ""
    echo "Usage:"
    echo "  ./fix-react-imports.sh app"
    echo ""
    exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
    echo "❌ python3 tidak ditemukan."
    echo "macOS biasanya sudah menyediakan python3 melalui instalasi Python."
    exit 1
fi

echo "⚠️  Script akan memodifikasi source code."
echo ""
read -r -p "Lanjutkan? [y/N] " CONFIRM

case "$CONFIRM" in
    y|Y|yes|YES)
        echo ""
        ;;
    *)
        echo ""
        echo "❌ Cancelled."
        exit 0
        ;;
esac

# ============================================================
# Fix one file
# ============================================================

fix_file() {
    local file="$1"

    RESULT=$(
        python3 - "$file" <<'PY'
import re
import sys

path = sys.argv[1]

with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# ------------------------------------------------------------
# React hooks / types commonly imported from "react"
# ------------------------------------------------------------

react_symbols = [
    "useState",
    "useEffect",
    "useCallback",
    "useMemo",
    "useRef",
    "useContext",
    "useReducer",
    "useLayoutEffect",
    "useImperativeHandle",
    "useId",
    "useTransition",
    "useDeferredValue",
    "useSyncExternalStore",
    "useInsertionEffect",
    "useDebugValue",
    "useOptimistic",
    "useActionState",
    "use",
    "ComponentProps",
    "ComponentPropsWithRef",
    "ComponentPropsWithoutRef",
    "CSSProperties",
    "HTMLAttributes",
    "InputHTMLAttributes",
    "ButtonHTMLAttributes",
    "FormHTMLAttributes",
    "LabelHTMLAttributes",
    "TextareaHTMLAttributes",
    "SelectHTMLAttributes",
    "OptionHTMLAttributes",
    "ImgHTMLAttributes",
    "AnchorHTMLAttributes",
    "VideoHTMLAttributes",
    "AudioHTMLAttributes",
    "TableHTMLAttributes",
    "ThHTMLAttributes",
    "TdHTMLAttributes",
    "ChangeEvent",
    "FormEvent",
    "MouseEvent",
    "KeyboardEvent",
    "FocusEvent",
    "DragEvent",
    "ClipboardEvent",
    "TouchEvent",
    "WheelEvent",
    "PointerEvent",
    "UIEvent",
    "SyntheticEvent",
    "ReactNode",
    "ReactElement",
    "ReactNodeArray",
    "FC",
    "FunctionComponent",
    "PropsWithChildren",
    "PropsWithoutRef",
    "Ref",
    "RefObject",
    "MutableRefObject",
    "ForwardedRef",
    "SetStateAction",
    "Dispatch",
    "Key",
]

# ------------------------------------------------------------
# Detect which React symbols are actually used.
#
# Important:
# - We do NOT detect "useComponentProps", because that is not
#   a React export.
# - We only add symbols that exist in react_symbols.
# ------------------------------------------------------------

used = []

for symbol in react_symbols:
    # Avoid matching the symbol when it is only present inside
    # an import declaration.
    pattern = r"\b" + re.escape(symbol) + r"\b"

    if not re.search(pattern, text):
        continue

    # Remove import sections before checking usage.
    text_without_imports = re.sub(
        r"^\s*import[\s\S]*?from\s*[\"']react[\"']\s*;?\s*$",
        "",
        text,
        flags=re.MULTILINE,
    )

    if re.search(pattern, text_without_imports):
        used.append(symbol)

if not used:
    print("NO_HOOKS")
    sys.exit(0)

# ------------------------------------------------------------
# Find ALL existing imports from react.
# Handles:
#
# import React from "react";
# import { useState } from "react";
# import React, { useState } from "react";
# import {
#   useState,
#   useEffect
# } from "react";
# ------------------------------------------------------------

react_import_pattern = re.compile(
    r'(?m)^[ \t]*import[ \t]+'
    r'(?P<body>[\s\S]*?)'
    r'[ \t]+from[ \t]+["\']react["\'][ \t]*;?[ \t]*$'
)

imports = list(react_import_pattern.finditer(text))

# ------------------------------------------------------------
# Existing named React imports
# ------------------------------------------------------------

existing = set()

for match in imports:
    body = match.group("body")

    brace_match = re.search(r"\{([\s\S]*?)\}", body)

    if brace_match:
        inside = brace_match.group(1)

        for item in inside.split(","):
            item = item.strip()

            if not item:
                continue

            # Handle:
            # useState
            # useState as state
            name = re.split(r"\s+as\s+", item)[0].strip()

            if name in react_symbols:
                existing.add(name)

# ------------------------------------------------------------
# Missing symbols only
# ------------------------------------------------------------

missing = [x for x in used if x not in existing]

# Everything already imported -> do nothing.
if not missing:
    print("ALREADY_OK")
    sys.exit(0)

# ------------------------------------------------------------
# If an existing named import exists, merge into it.
# ------------------------------------------------------------

named_import_match = None

for match in imports:
    body = match.group("body")
    if "{" in body and "}" in body:
        named_import_match = match
        break

if named_import_match:
    body = named_import_match.group("body")

    brace_match = re.search(r"\{([\s\S]*?)\}", body)

    if brace_match:
        old_inside = brace_match.group(1)

        # Preserve existing formatting as much as possible.
        items = [
            item.strip()
            for item in old_inside.split(",")
            if item.strip()
        ]

        for symbol in missing:
            if symbol not in items and not any(
                re.split(r"\s+as\s+", item)[0].strip() == symbol
                for item in items
            ):
                items.append(symbol)

        # Use a clean multiline format when original is multiline.
        if "\n" in old_inside:
            new_inside = "\n" + "".join(
                f"  {item},\n" for item in items
            )
        else:
            new_inside = " " + ", ".join(items) + " "

        start, end = brace_match.span(1)

        new_body = body[:start] + new_inside + body[end:]

        new_import = (
            "import "
            + new_body
            + ' from "react";'
        )

        # Replace only this exact import statement.
        text = (
            text[:named_import_match.start()]
            + new_import
            + text[named_import_match.end():]
        )

        with open(path, "w", encoding="utf-8") as f:
            f.write(text)

        print("FIXED")
        print("MERGED:" + ",".join(missing))
        sys.exit(0)

# ------------------------------------------------------------
# No named import exists.
#
# Cases:
#   import React from "react";
#
# We add a separate named import ONLY if necessary.
# This avoids destroying default / namespace imports.
# ------------------------------------------------------------

new_import = (
    "import { "
    + ", ".join(missing)
    + ' } from "react";'
)

# Put the new import after the existing React import.
last_react_import = imports[-1]

insert_at = last_react_import.end()

text = (
    text[:insert_at]
    + "\n"
    + new_import
    + text[insert_at:]
)

with open(path, "w", encoding="utf-8") as f:
    f.write(text)

print("FIXED")
print("ADDED:" + ",".join(missing))
PY
    )

    case "$RESULT" in
        NO_HOOKS)
            ;;
        ALREADY_OK)
            SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
            ;;
        FIXED*)
            echo "✅ FIXED: $file"
            echo "$RESULT" | grep -E '^(MERGED|ADDED):' | sed 's/^/   /'
            echo ""
            FIXED_COUNT=$((FIXED_COUNT + 1))
            ;;
        *)
            echo "⚠️  WARNING: Could not process $file"
            echo "$RESULT"
            echo ""
            ;;
    esac
}

# ============================================================
# Collect files first.
#
# We intentionally do NOT use:
#
#   done < <(...)
#
# ============================================================

TEMP_FILE="$(mktemp)"

trap 'rm -f "$TEMP_FILE"' EXIT

find "$ROOT_DIR" \
    -type f \
    \( \
        -name "*.tsx" \
        -o -name "*.ts" \
        -o -name "*.jsx" \
        -o -name "*.js" \
    \) \
    ! -path "*/node_modules/*" \
    ! -path "*/.next/*" \
    ! -path "*/dist/*" \
    ! -path "*/build/*" \
    -print > "$TEMP_FILE"

# ============================================================
# Scan
# ============================================================

while IFS= read -r file; do

    [ -z "$file" ] && continue

    SCANNED_COUNT=$((SCANNED_COUNT + 1))

    fix_file "$file"

done < "$TEMP_FILE"

# ============================================================
# Summary
# ============================================================

echo ""
echo "============================================================"
echo "📊 SUMMARY"
echo "============================================================"
echo ""

echo "📁 Files scanned : $SCANNED_COUNT"
echo "🔧 Files fixed   : $FIXED_COUNT"
echo "⏭️  Already OK    : $SKIPPED_COUNT"
echo ""

if [ "$FIXED_COUNT" -eq 0 ]; then
    echo "✅ Tidak ada import React yang perlu ditambahkan."
else
    echo "✅ React imports berhasil diperbaiki."
fi