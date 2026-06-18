'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Input, Select, Label } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CandidateSource } from '@recruitflow/shared';

export function NewCandidatePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    source: 'OTHER' as CandidateSource,
  });

  const mutation = useMutation({
    mutationFn: () => api<{ id: string }>('/candidates', { method: 'POST', body: JSON.stringify(form) }),
    onSuccess: (c) => router.push(`/candidates/${c.id}`),
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="animate-fade-up">
      <PageHeader title="Add Candidate" description="Create a new candidate profile" />
      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input value={form.firstName} onChange={set('firstName')} required />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={form.lastName} onChange={set('lastName')} required />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={set('location')} />
            </div>
            <div>
              <Label>Source</Label>
              <Select value={form.source} onChange={set('source')}>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="INDEED">Indeed</option>
                <option value="REFERRAL">Referral</option>
                <option value="CAREERS_PAGE">Careers Page</option>
                <option value="AGENCY">Agency</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creating...' : 'Add Candidate'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
