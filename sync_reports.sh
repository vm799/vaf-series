#!/bin/bash
# Sync build reports into portfolio/data/ after each run
# Usage: ./sync_reports.sh

PORTFOLIO="$(dirname "$0")/portfolio/data"
mkdir -p "$PORTFOLIO"

copy_if_exists() {
  local src="$1"
  local dest="$2"
  if [ -f "$src" ]; then
    cp "$src" "$dest"
    echo "✓ $(basename $dest)"
  fi
}

copy_if_exists "vaf-am-build-01-ingestion/reports/ingestion_report.json"    "$PORTFOLIO/build_01.json"
copy_if_exists "vaf-am-build-02-sanitisation/reports/sanitisation_report.json" "$PORTFOLIO/build_02.json"
copy_if_exists "vaf-am-build-03-identity/reports/identity_report.json"       "$PORTFOLIO/build_03.json"
copy_if_exists "vaf-am-build-04-rag/reports/rag_report.json"                 "$PORTFOLIO/build_04.json"
copy_if_exists "vaf-am-build-05-self-evolving/reports/self_evolving_report.json" "$PORTFOLIO/build_05.json"
copy_if_exists "vaf-am-build-06-council/reports/council_report.json"         "$PORTFOLIO/build_06.json"
copy_if_exists "vaf-am-build-07-compliance/reports/compliance_report.json"   "$PORTFOLIO/build_07.json"
copy_if_exists "vaf-am-build-08-synthesis/reports/synthesis_report.json"     "$PORTFOLIO/build_08.json"
copy_if_exists "vaf-am-build-09-output/reports/output_report.json"           "$PORTFOLIO/build_09.json"

echo ""
echo "Reports synced to portfolio/data/"
