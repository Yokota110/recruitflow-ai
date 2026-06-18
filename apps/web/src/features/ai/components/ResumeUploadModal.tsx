'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { importResume, parseResume } from '../services/resume-parser.service';
import type { ParsedResume } from '../types';

export function ResumeUploadModal({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedResume | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');

  const parseMutation = useMutation({
    mutationFn: (f: File) => parseResume(f),
    onSuccess: (data) => {
      setPreview(data);
      setStep('preview');
    },
  });

  const importMutation = useMutation({
    mutationFn: (f: File) => importResume(f),
    onSuccess: (data) => {
      setStep('done');
      setTimeout(() => {
        router.push(`/candidates/${data.candidate.id}`);
        onClose?.();
      }, 1500);
    },
  });

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-[#E8653A]" />
          Upload Resume
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'upload' && (
          <>
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-[#E8E2D9] rounded-xl p-8 text-center hover:border-[#E8653A]/40 transition-colors"
            >
              <FileText className="h-10 w-10 mx-auto text-[#9C958A] mb-3" />
              <p className="text-sm text-[#6B6560] mb-2">Drag & drop PDF or DOCX</p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <span className="text-sm text-[#E8653A] font-semibold cursor-pointer hover:underline">
                  Browse files
                </span>
              </label>
              {file && <p className="text-xs text-[#9C958A] mt-3">{file.name}</p>}
            </div>
            <Button
              className="w-full"
              disabled={!file || parseMutation.isPending}
              onClick={() => file && parseMutation.mutate(file)}
            >
              {parseMutation.isPending ? 'Parsing...' : 'Parse Resume'}
            </Button>
          </>
        )}

        {step === 'preview' && preview && file && (
          <>
            <div className="bg-[#F5F1EA] rounded-xl p-4 space-y-2">
              <p className="font-semibold text-[#1A1814]">{preview.firstName} {preview.lastName}</p>
              <p className="text-xs text-[#6B6560]">{preview.email} · {preview.phone}</p>
              <p className="text-xs text-[#6B6560]">{preview.summary}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {preview.skills.map((s) => (
                  <span key={s.name} className="text-[10px] bg-[#FDF0EB] text-[#C4522A] px-2 py-0.5 rounded-md">{s.name}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('upload')}>Back</Button>
              <Button
                className="flex-1"
                disabled={importMutation.isPending}
                onClick={() => importMutation.mutate(file)}
              >
                {importMutation.isPending ? 'Creating...' : 'Add to ATS'}
              </Button>
            </div>
          </>
        )}

        {step === 'done' && (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-[#2D8A6E] mx-auto mb-3" />
            <p className="font-semibold text-[#1A1814]">Candidate created successfully</p>
            <p className="text-sm text-[#9C958A] mt-1">Redirecting to profile...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
