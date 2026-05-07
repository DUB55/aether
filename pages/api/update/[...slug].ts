import { NextApiRequest, NextApiResponse } from 'next';

interface UpdateInfo {
  version: string;
  body: string;
  date: string;
  signature: string;
  url: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { slug } = req.query;
    const [target, currentVersion] = (slug as string[]).filter(Boolean);

    if (!target || !currentVersion) {
      return res.status(400).json({ error: 'Missing target or version' });
    }

    // Get latest version from environment variables
    const latestVersion = process.env.AETHER_DESKTOP_VERSION || '1.0.0';
    const updateUrl = process.env.AETHER_DESKTOP_UPDATE_URL || '';
    const updateSignature = process.env.AETHER_DESKTOP_UPDATE_SIGNATURE || '';

    // Compare versions (simple semver comparison)
    const isNewer = compareVersions(latestVersion, currentVersion);

    if (!isNewer) {
      return res.status(204).end(); // No update available
    }

    // Get platform-specific update info
    const platformUpdateInfo = getPlatformUpdateInfo(target, latestVersion, updateUrl, updateSignature);

    if (!platformUpdateInfo) {
      return res.status(404).json({ error: 'Platform not supported' });
    }

    res.status(200).json(platformUpdateInfo);
  } catch (error) {
    console.error('Update check failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function compareVersions(latest: string, current: string): boolean {
  const latestParts = latest.split('.').map(Number);
  const currentParts = current.split('.').map(Number);

  for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
    const latestPart = latestParts[i] || 0;
    const currentPart = currentParts[i] || 0;

    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }

  return false;
}

function getPlatformUpdateInfo(
  target: string,
  version: string,
  baseUrl: string,
  signature: string
): UpdateInfo | null {
  const baseUrlClean = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const date = new Date().toISOString();

  const platforms: Record<string, string> = {
    'windows-x86_64': `${baseUrlClean}/aether-ai-${version}-x64-setup.nsis.exe`,
    'windows-aarch64': `${baseUrlClean}/aether-ai-${version}-arm64-setup.nsis.exe`,
    'darwin-x86_64': `${baseUrlClean}/aether-ai-${version}-x64.dmg`,
    'darwin-aarch64': `${baseUrlClean}/aether-ai-${version}-arm64.dmg`,
    'linux-x86_64': `${baseUrlClean}/aether-ai-${version}-amd64.AppImage`,
    'linux-aarch64': `${baseUrlClean}/aether-ai-${version}-arm64.AppImage`,
  };

  const url = platforms[target];
  if (!url) return null;

  return {
    version,
    body: `Aether AI IDE ${version} - Latest update with new features and improvements.`,
    date,
    signature,
    url,
  };
}
