import { Metadata } from 'next'
import Image from 'next/image'
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';

// Mock data for demonstration
const mockProfessionals = [
  {
    id: '1',
    name: 'Tendai Mukamuri',
    title: 'Architect',
    location: 'Harare',
    avatar: '/api/placeholder/48/48',
    specializations: ['Residential', 'Commercial', 'Sustainable Design'],
    rating: 4.8,
    reviewCount: 24,
    experience: '8 years',
    verified: true,
    premium: true,
  },
  {
    id: '2',
    name: 'Chipo Nyamangara',
    title: 'Civil Engineer',
    location: 'Bulawayo',
    avatar: '/api/placeholder/48/48',
    specializations: ['Structural', 'Foundation', 'Site Planning'],
    rating: 4.6,
    reviewCount: 18,
    experience: '6 years',
    verified: true,
  },
  {
    id: '3',
    name: 'Blessing Chitongo',
    title: 'Contractor',
    location: 'Mutare',
    avatar: '/api/placeholder/48/48',
    specializations: ['Construction', 'Project Management', 'Quality Control'],
    rating: 4.9,
    reviewCount: 31,
    experience: '12 years',
    verified: true,
    premium: true,
  },
];

export const metadata: Metadata = {
  title: 'Dashboard - BuildDiaspora Zimbabwe',
  description: 'Your personal dashboard for building projects in Zimbabwe',
}

export default function DashboardPage() {
  const breadcrumbs = [
    { label: 'Dashboard' }
  ];

  return (
    <DashboardLayout 
      title="Welcome back to your build journey"
      breadcrumbs={breadcrumbs}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-primary-500 mb-2">6/12</div>
              <div className="text-body-small text-neutral-600">Stages Complete</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-accent-400 mb-2">$45K</div>
              <div className="text-body-small text-neutral-600">Estimated Cost</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-success mb-2">18</div>
              <div className="text-body-small text-neutral-600">Months Duration</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-info mb-2">15</div>
              <div className="text-body-small text-neutral-600">Professionals</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Current Progress */}
        <div className="lg:col-span-2 space-y-8">
          {/* Current Stage */}
          <Card>
            <CardHeader>
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-heading-2 text-neutral-900">Current Stage: Foundation</h2>
                  <Badge variant="warning">In Progress</Badge>
                </div>
                <p className="text-body text-neutral-600 mt-2">
                  Laying the groundwork for your building project with proper excavation and concrete work.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="px-6 pb-6">
                <ProgressBar 
                  value={65} 
                  showLabel={true} 
                  label="Foundation Progress"
                  className="mb-4"
                />
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-body-small text-neutral-600">Site preparation completed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-body-small text-neutral-600">Excavation finished</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span className="text-body-small text-neutral-600">Concrete pouring in progress</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-neutral-300 rounded-full"></div>
                    <span className="text-body-small text-neutral-400">Foundation curing pending</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="primary">View Stage Details</Button>
                  <Button variant="secondary">Update Progress</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="p-6 pb-4">
                <h2 className="text-heading-2 text-neutral-900">Recent Activity</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 bg-neutral-50 rounded-lg">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-body text-neutral-900">Foundation inspection scheduled</p>
                      <p className="text-body-small text-neutral-600">Tomorrow at 10:00 AM with certified inspector</p>
                    </div>
                    <span className="text-caption text-neutral-500">2 hours ago</span>
                  </div>
                  
                  <div className="flex gap-4 p-4 bg-neutral-50 rounded-lg">
                    <div className="w-2 h-2 bg-accent-400 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-body text-neutral-900">Cost estimate updated</p>
                      <p className="text-body-small text-neutral-600">New materials pricing reflected in calculator</p>
                    </div>
                    <span className="text-caption text-neutral-500">1 day ago</span>
                  </div>
                  
                  <div className="flex gap-4 p-4 bg-neutral-50 rounded-lg">
                    <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-body text-neutral-900">Professional consultation completed</p>
                      <p className="text-body-small text-neutral-600">Meeting with structural engineer finalized</p>
                    </div>
                    <span className="text-caption text-neutral-500">3 days ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <div className="p-6 pb-4">
                <h3 className="text-heading-3 text-neutral-900">Quick Actions</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="px-6 pb-6 space-y-3">
                <Button variant="secondary" className="w-full justify-start">
                  Schedule Inspection
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  Update Progress
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  Find Professionals
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  Cost Calculator
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Professionals */}
          <Card>
            <CardHeader>
              <div className="p-6 pb-4">
                <h3 className="text-heading-3 text-neutral-900">Recommended for You</h3>
                <p className="text-body-small text-neutral-600">Professionals for your current stage</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="px-6 pb-6 space-y-4">
                {mockProfessionals.slice(0, 2).map((professional) => (
                  <div key={professional.id} className="flex items-start gap-3 p-3 border border-neutral-200 rounded-lg">
                    <Image
                      src={professional.avatar}
                      alt={`${professional.name} profile`}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-body font-medium text-neutral-900 truncate">
                          {professional.name}
                        </h4>
                        {professional.verified && (
                          <Badge variant="verified">Verified</Badge>
                        )}
                      </div>
                      <p className="text-body-small text-neutral-600 mb-1">{professional.title}</p>
                      <p className="text-caption text-neutral-500">{professional.location}</p>
                    </div>
                  </div>
                ))}
                <Button variant="secondary" className="w-full">
                  View All Professionals
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <div className="p-6 pb-4">
                <h3 className="text-heading-3 text-neutral-900">Next Steps</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="px-6 pb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-primary-600 text-caption font-medium">1</span>
                  </div>
                  <div>
                    <p className="text-body text-neutral-900">Complete foundation curing</p>
                    <p className="text-body-small text-neutral-600">Wait 7-14 days for proper setting</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-neutral-600 text-caption font-medium">2</span>
                  </div>
                  <div>
                    <p className="text-body text-neutral-900">Begin framing stage</p>
                    <p className="text-body-small text-neutral-600">Start structural framework</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-neutral-600 text-caption font-medium">3</span>
                  </div>
                  <div>
                    <p className="text-body text-neutral-900">Electrical rough-in</p>
                    <p className="text-body-small text-neutral-600">Install wiring and outlets</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 