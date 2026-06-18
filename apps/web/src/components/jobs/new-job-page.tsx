'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select, Label } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export function NewJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    department: '',
    location: '',
    employmentType: 'FULL_TIME',
    description: '',
    requirements: '',
    salaryMin: '',
    salaryMax: '',
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      api<{ id: string }>('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          salaryMin: data.salaryMin ? parseInt(data.salaryMin) : undefined,
          salaryMax: data.salaryMax ? parseInt(data.salaryMax) : undefined,
        }),
      }),
    onSuccess: (job) => router.push(`/jobs/${job.id}`),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="animate-fade-up">
      <PageHeader title="Create Job" description="Add a new open position" />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Job Title</Label>
                <Input value={form.title} onChange={set('title')} placeholder="Senior Full Stack Engineer" required />
              </div>
              <div>
                <Label>Department</Label>
                <Input value={form.department} onChange={set('department')} placeholder="Engineering" required />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={form.location} onChange={set('location')} placeholder="San Francisco, CA" required />
              </div>
              <div>
                <Label>Employment Type</Label>
                <Select value={form.employmentType} onChange={set('employmentType')}>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                </Select>
              </div>
              <div>
                <Label>Salary Range (USD)</Label>
                <div className="flex gap-2">
                  <Input value={form.salaryMin} onChange={set('salaryMin')} placeholder="Min" type="number" />
                  <Input value={form.salaryMax} onChange={set('salaryMax')} placeholder="Max" type="number" />
                </div>
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={set('description')} rows={4} required />
              </div>
              <div className="col-span-2">
                <Label>Requirements</Label>
                <Textarea value={form.requirements} onChange={set('requirements')} rows={4} required />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creating...' : 'Create Job'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
