'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Badge, Skeleton } from '@/components/ui/badge';
import {
  fetchCampaigns, fetchTemplates, createCampaign, sendCampaign,
  createTemplate, previewTemplate, fetchTalentPool,
} from '../services/crm.service';
import {
  CAMPAIGN_STATUS_LABELS, EMAIL_TEMPLATE_TYPE_LABELS, EmailTemplateType, CampaignStatus,
} from '@recruitflow/shared';
import { Send, Plus, Eye, Mail } from 'lucide-react';

export function OutreachPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'campaigns' | 'templates'>('campaigns');
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [preview, setPreview] = useState<{ subject: string; body: string } | null>(null);
  const [campaignForm, setCampaignForm] = useState({ name: '', templateId: '', candidateIds: [] as string[] });
  const [templateForm, setTemplateForm] = useState({
    name: '', subject: '', body: '', type: EmailTemplateType.INITIAL_OUTREACH,
  });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
  });

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });

  const { data: pool } = useQuery({
    queryKey: ['talent-pool-outreach'],
    queryFn: () => fetchTalentPool({ limit: 20 }),
    enabled: showCreate,
  });

  const sendMutation = useMutation({
    mutationFn: sendCampaign,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  const createCampaignMutation = useMutation({
    mutationFn: () => createCampaign(campaignForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setShowCreate(false);
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: () => createTemplate(templateForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setShowTemplateEditor(false);
    },
  });

  const previewMutation = useMutation({
    mutationFn: () => previewTemplate(templateForm),
    onSuccess: setPreview,
  });

  const toggleCandidate = (id: string) => {
    setCampaignForm((f) => ({
      ...f,
      candidateIds: f.candidateIds.includes(id)
        ? f.candidateIds.filter((c) => c !== id)
        : [...f.candidateIds, id],
    }));
  };

  return (
    <div>
      <PageHeader
        title="Email Outreach"
        description="Create campaigns, manage templates, and reach candidates"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setTab('templates'); setShowTemplateEditor(true); }}>
              <Plus className="h-4 w-4" /> New Template
            </Button>
            <Button onClick={() => { setTab('campaigns'); setShowCreate(true); }}>
              <Plus className="h-4 w-4" /> New Campaign
            </Button>
          </div>
        }
      />

      <div className="flex gap-2 mb-6">
        {(['campaigns', 'templates'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm px-4 py-2 rounded-xl font-medium transition-colors ${
              tab === t ? 'bg-[#E8653A] text-white' : 'bg-[#F5F1EA] text-[#6B6560] hover:bg-[#EDE8E0]'
            }`}
          >
            {t === 'campaigns' ? 'Campaigns' : 'Templates'}
          </button>
        ))}
      </div>

      {showCreate && (
        <Card className="p-4 mb-4 space-y-3">
          <p className="font-semibold text-[#1A1814]">Create Campaign</p>
          <Input placeholder="Campaign name" value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} />
          <Select value={campaignForm.templateId} onChange={(e) => setCampaignForm({ ...campaignForm, templateId: e.target.value })}>
            <option value="">Select template...</option>
            {templates?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <p className="text-xs text-[#9C958A]">Recipients ({campaignForm.candidateIds.length} selected)</p>
          <div className="max-h-32 overflow-y-auto space-y-1 border border-[#E8E2D9] rounded-lg p-2">
            {pool?.data.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-[#F5F1EA] p-1 rounded">
                <input
                  type="checkbox"
                  checked={campaignForm.candidateIds.includes(c.id)}
                  onChange={() => toggleCandidate(c.id)}
                />
                {c.firstName} {c.lastName} — {c.email}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createCampaignMutation.mutate()} disabled={!campaignForm.name || !campaignForm.templateId}>
              Create Campaign
            </Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {showTemplateEditor && (
        <Card className="p-4 mb-4 space-y-3">
          <p className="font-semibold text-[#1A1814]">Email Template Editor</p>
          <Input placeholder="Template name" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} />
          <Select value={templateForm.type} onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value as EmailTemplateType })}>
            {Object.values(EmailTemplateType).map((t) => (
              <option key={t} value={t}>{EMAIL_TEMPLATE_TYPE_LABELS[t]}</option>
            ))}
          </Select>
          <Input placeholder="Subject — use {{candidate_name}}, {{job_title}}, {{company_name}}" value={templateForm.subject} onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })} />
          <Textarea
            placeholder="Body — variables: {{candidate_name}}, {{job_title}}, {{company_name}}, {{interview_date}}"
            value={templateForm.body}
            onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
            rows={6}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => previewMutation.mutate()}><Eye className="h-4 w-4" /> Preview</Button>
            <Button onClick={() => createTemplateMutation.mutate()}>Save Template</Button>
            <Button variant="outline" onClick={() => { setShowTemplateEditor(false); setPreview(null); }}>Cancel</Button>
          </div>
          {preview && (
            <Card className="p-3 bg-[#F5F1EA]">
              <p className="text-xs font-semibold text-[#1A1814]">Subject: {preview.subject}</p>
              <pre className="text-xs text-[#6B6560] mt-2 whitespace-pre-wrap">{preview.body}</pre>
            </Card>
          )}
        </Card>
      )}

      {tab === 'campaigns' ? (
        isLoading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : (
          <div className="space-y-2">
            {campaigns?.map((c) => (
              <Card key={c.id}>
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#F5F1EA] flex items-center justify-center">
                      <Mail className="h-5 w-5 text-[#E8653A]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1814]">{c.name}</p>
                      <p className="text-xs text-[#9C958A]">
                        {c.template.name} · {c.recipientCount} recipients
                        {c.sendDate && ` · ${new Date(c.sendDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.status === CampaignStatus.SENT ? 'success' : 'default'}>
                      {CAMPAIGN_STATUS_LABELS[c.status]}
                    </Badge>
                    {c.status !== CampaignStatus.SENT && (
                      <Button size="sm" onClick={() => sendMutation.mutate(c.id)}>
                        <Send className="h-3.5 w-3.5" /> Send (Mock)
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates?.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t.name}</CardTitle>
                <Badge variant="outline">{EMAIL_TEMPLATE_TYPE_LABELS[t.type]}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-medium text-[#1A1814] truncate">{t.subject}</p>
                <p className="text-[10px] text-[#9C958A] mt-1 line-clamp-2">{t.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
