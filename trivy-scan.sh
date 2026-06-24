#!/bin/bash
echo "Scanning containers with Trivy..."
docker images --format "{{.Repository}}:{{.Tag}}" | grep citizen-portal | xargs -I {} trivy image {}
echo "Scan complete."
