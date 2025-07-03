'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Eye, 
  Clock, 
  MapPin, 
  Users, 
  TrendingUp,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { SecurityEvent, SecurityAlert, SecuritySeverity, SecurityEventType } from '@/lib/security/monitoring';

interface SecurityStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  topIPs: Array<{ ip: string; count: number }>;
  alertCount: number;
  unacknowledgedAlerts: number;
}

interface SecurityDashboardProps {
  className?: string;
}

export default function SecurityDashboard({ className }: SecurityDashboardProps) {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch security statistics
      const statsResponse = await fetch(`/api/security/stats?timeframe=${timeframe}`);
      if (!statsResponse.ok) throw new Error('Failed to fetch security stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch recent events
      const eventsResponse = await fetch(`/api/security/events?limit=20&timeframe=${timeframe}`);
      if (!eventsResponse.ok) throw new Error('Failed to fetch security events');
      const eventsData = await eventsResponse.json();
      setEvents(eventsData);

      // Fetch unacknowledged alerts
      const alertsResponse = await fetch('/api/security/alerts?acknowledged=false');
      if (!alertsResponse.ok) throw new Error('Failed to fetch security alerts');
      const alertsData = await alertsResponse.json();
      setAlerts(alertsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/security/alerts/${alertId}/acknowledge`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to acknowledge alert');
      
      // Refresh data
      await fetchSecurityData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, [timeframe]);

  const getSeverityColor = (severity: SecuritySeverity): string => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadgeVariant = (severity: SecuritySeverity) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatEventType = (type: string): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading security dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 ${className}`}>
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <XCircle className="h-8 w-8 text-red-500 mr-2" />
            <span className="text-red-600">{error}</span>
            <Button 
              onClick={fetchSecurityData} 
              variant="outline" 
              size="sm" 
              className="ml-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-800">Security Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Timeframe Selector */}
          <div className="flex space-x-2">
            {(['24h', '7d', '30d'] as const).map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe(period)}
              >
                {period}
              </Button>
            ))}
          </div>
          
          <Button onClick={fetchSecurityData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Unacknowledged Security Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium text-slate-800">{alert.message}</p>
                      <p className="text-sm text-slate-600">
                        {formatTimestamp(alert.triggered_at)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => acknowledgeAlert(alert.id)}
                    variant="outline"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Acknowledge
                  </Button>
                </div>
              ))}
              {alerts.length > 5 && (
                <p className="text-sm text-slate-600 text-center">
                  +{alerts.length - 5} more alerts
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Activity className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-slate-600">Total Events</p>
              <p className="text-2xl font-bold text-slate-800">
                {stats?.totalEvents || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-slate-600">Alerts</p>
              <p className="text-2xl font-bold text-slate-800">
                {stats?.alertCount || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <XCircle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-slate-600">Critical Events</p>
              <p className="text-2xl font-bold text-slate-800">
                {stats?.eventsBySeverity?.critical || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-slate-600">Unique IPs</p>
              <p className="text-2xl font-bold text-slate-800">
                {stats?.topIPs?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Severity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Events by Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats?.eventsBySeverity || {}).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(severity as SecuritySeverity)}`} />
                    <span className="capitalize font-medium">{severity}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top IP Addresses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Top IP Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.topIPs?.slice(0, 5).map((ipData, index) => (
                <div key={ipData.ip} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                      {ipData.ip}
                    </span>
                  </div>
                  <Badge variant="outline">{ipData.count} events</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-slate-600 text-center py-4">No security events found</p>
            ) : (
              events.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getSeverityBadgeVariant(event.severity)}>
                      {event.severity}
                    </Badge>
                    <div>
                      <p className="font-medium text-slate-800">
                        {formatEventType(event.type)}
                      </p>
                      <p className="text-sm text-slate-600">
                        {event.ip_address} • {formatTimestamp(event.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {event.user_id && (
                      <p className="text-sm text-slate-600">User: {event.user_id.slice(0, 8)}...</p>
                    )}
                    {event.resolved ? (
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Event Type Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(stats?.eventsByType || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium text-slate-800">
                  {formatEventType(type)}
                </span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 