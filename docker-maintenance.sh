#!/bin/bash
# ==========================================
# DOCKER MAINTENANCE SCRIPT
# Jalankan secara berkala via cron
# ==========================================

echo "🧹 Starting Docker cleanup..."

# 1. Stop dan hapus container yang tidak terpakai
echo "Removing unused containers..."
docker container prune -f

# 2. Hapus image yang tidak terpakai (kecuali yang sedang running)
echo "Removing unused images..."
docker image prune -af --filter "until=24h"

# 3. Hapus volume yang tidak terpakai
echo "Removing unused volumes..."
docker volume prune -f

# 4. Hapus network yang tidak terpakai
echo "Removing unused networks..."
docker network prune -f

# 5. Hapus build cache (PENTING!)
echo "Removing build cache..."
docker builder prune -af --filter "until=48h"

# 6. Cleanup containerd snapshots
echo "Cleaning containerd snapshots..."
if command -v ctr &> /dev/null; then
    ctr -n moby images prune
fi

# 7. Tampilkan disk usage setelah cleanup
echo "📊 Disk usage after cleanup:"
docker system df

# 8. Tampilkan space yang tersisa
echo "💾 Available disk space:"
df -h /var/lib/docker /var/lib/containerd

echo "✅ Cleanup completed!"