import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Users, GraduationCap, TrendingUp, Clock, Brain, MessageSquare, BarChart3, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { studentsApi, analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import type { AnalyticsResponse, StudentPublic } from "@/types";

const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#C084FC'];

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.getSummary().then(res => res.data),
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsApi.getAllStudents().then(res => res.data),
  });

  const isLoading = analyticsLoading || studentsLoading;

  const StatCard = ({ title, value, description, icon: Icon, color }: {
    title: string;
    value: string | number;
    description: string;
    icon: any;
    color: string;
  }) => (
    <Card className="hover:shadow-custom transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your AI Campus administration system
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => navigate('/chat')}
          className="bg-gradient-primary hover:bg-gradient-primary/90 text-white"
        >
          <Brain className="mr-2 h-4 w-4" />
          AI Assistant
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/students')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/analytics')}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          View Analytics
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={analytics?.total_students || 0}
          description="Registered in the system"
          icon={Users}
          color="text-primary"
        />
        <StatCard
          title="Active Last 7 Days"
          value={analytics?.active_last_7_days || 0}
          description="Students with recent activity"
          icon={TrendingUp}
          color="text-success"
        />
        <StatCard
          title="Departments"
          value={analytics?.students_by_department?.length || 0}
          description="Different academic departments"
          icon={GraduationCap}
          color="text-secondary"
        />
        <StatCard
          title="Recent Enrollments"
          value={analytics?.recent_onboarded?.length || 0}
          description="New students this month"
          icon={Clock}
          color="text-warning"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Students by Department</CardTitle>
            <CardDescription>
              Distribution of students across departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.students_by_department || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analytics?.students_by_department || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
            <CardDescription>
              Latest students added to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.recent_onboarded?.slice(0, 6).map((student) => (
                <div key={student.id} className="flex items-center space-x-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {student.department} • {student.student_id}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {new Date(student.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              )) || (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent enrollments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message for New Users */}
      {user && (
        <Card className="bg-gradient-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">
              Welcome to AI Campus Admin, {user.full_name || user.username}!
            </CardTitle>
            <CardDescription>
              Get started by exploring the AI assistant or managing student records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => navigate('/chat')}
                className="bg-gradient-primary hover:bg-gradient-primary/90 text-white"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Try AI Assistant
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/students')}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Students
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};