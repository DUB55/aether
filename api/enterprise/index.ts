import { enterpriseManager, Team, TeamMember, EnterpriseConfig } from '../../src/lib/enterprise/enterprise-manager';

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, query } = req;
    const teamId = query.teamId;

    switch (method) {
      case 'GET':
        if (teamId) {
          // Get specific team
          const team = enterpriseManager.getTeam(teamId);
          if (!team) {
            return res.status(404).json({ error: 'Team not found' });
          }
          return res.status(200).json(team);
        } else if (query.action === 'audit-logs') {
          // Get audit logs for a team
          if (!teamId) {
            return res.status(400).json({ error: 'Team ID required' });
          }
          const logs = enterpriseManager.getAuditLogs(teamId, query.limit ? parseInt(query.limit) : 100);
          return res.status(200).json({ logs });
        } else if (query.ownerId) {
          // Get teams by owner
          const teams = enterpriseManager.getTeamsByOwner(query.ownerId);
          return res.status(200).json(teams);
        } else if (query.memberId) {
          // Get teams by member
          const teams = enterpriseManager.getTeamsByMember(query.memberId);
          return res.status(200).json(teams);
        } else {
          // Get all teams
          const teams = enterpriseManager.getAllTeams();
          return res.status(200).json(teams);
        }

      case 'POST':
        const { action } = req.body;

        if (action === 'create-team') {
          // Create a new team
          const { name, ownerId, subscription } = req.body;
          const team = await enterpriseManager.createTeam(name, ownerId, subscription || 'free');
          return res.status(201).json({ team });
        }

        if (action === 'add-member') {
          // Add member to team
          if (!teamId) {
            return res.status(400).json({ error: 'Team ID required' });
          }
          const member = await enterpriseManager.addMember(teamId, req.body);
          return res.status(201).json({ member });
        }

        if (action === 'add-custom-domain') {
          // Add custom domain
          if (!teamId) {
            return res.status(400).json({ error: 'Team ID required' });
          }
          const { domain } = req.body;
          await enterpriseManager.addCustomDomain(teamId, domain);
          return res.status(201).json({ message: 'Custom domain added successfully' });
        }

        return res.status(400).json({ error: 'Invalid action' });

      case 'PUT':
        if (!teamId) {
          return res.status(400).json({ error: 'Team ID required' });
        }

        const { action: putAction } = req.body;

        if (putAction === 'update-member-role') {
          // Update member role
          const { userId, newRole } = req.body;
          await enterpriseManager.updateMemberRole(teamId, userId, newRole);
          return res.status(200).json({ message: 'Member role updated successfully' });
        }

        if (putAction === 'update-settings') {
          // Update team settings
          await enterpriseManager.updateTeamSettings(teamId, req.body.settings);
          return res.status(200).json({ message: 'Team settings updated successfully' });
        }

        if (putAction === 'upgrade-subscription') {
          // Upgrade team subscription
          const { newSubscription } = req.body;
          await enterpriseManager.upgradeSubscription(teamId, newSubscription);
          return res.status(200).json({ message: 'Subscription upgraded successfully' });
        }

        return res.status(400).json({ error: 'Invalid action' });

      case 'DELETE':
        if (!teamId) {
          return res.status(400).json({ error: 'Team ID required' });
        }

        const { action: deleteAction } = req.body;

        if (deleteAction === 'remove-member') {
          // Remove member from team
          const { userId } = req.body;
          await enterpriseManager.removeMember(teamId, userId);
          return res.status(200).json({ message: 'Member removed successfully' });
        }

        if (deleteAction === 'remove-custom-domain') {
          // Remove custom domain
          const { domain } = req.body;
          await enterpriseManager.removeCustomDomain(teamId, domain);
          return res.status(200).json({ message: 'Custom domain removed successfully' });
        }

        if (deleteAction === 'delete-team') {
          // Delete team
          await enterpriseManager.deleteTeam(teamId);
          return res.status(200).json({ message: 'Team deleted successfully' });
        }

        return res.status(400).json({ error: 'Invalid action' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[Enterprise API] Error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
}
