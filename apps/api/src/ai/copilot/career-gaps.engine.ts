import { Injectable } from '@nestjs/common';
import { CareerAnalysis, CareerGap } from '@recruitflow/shared';

interface ExperienceInput {
  company: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
}

@Injectable()
export class CareerGapsEngine {
  detectCareerGaps(experiences: ExperienceInput[]): CareerAnalysis {
    if (experiences.length < 2) {
      return {
        hasGaps: false,
        gaps: [],
        message: 'No significant employment gaps detected.',
      };
    }

    const sorted = [...experiences].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

    const gaps: CareerGap[] = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      const endDate = current.isCurrent ? new Date() : current.endDate;
      if (!endDate) continue;

      const gapStart = new Date(endDate);
      const gapEnd = new Date(next.startDate);
      const months = Math.round(
        (gapEnd.getTime() - gapStart.getTime()) / (1000 * 60 * 60 * 24 * 30.44),
      );

      if (months >= 3) {
        gaps.push({
          from: this.formatMonth(gapStart),
          to: this.formatMonth(gapEnd),
          months,
          label: `${this.formatMonth(gapStart)} → ${this.formatMonth(gapEnd)}`,
        });
      }
    }

    if (gaps.length === 0) {
      return {
        hasGaps: false,
        gaps: [],
        message: 'No significant employment gaps detected.',
      };
    }

    const largest = gaps.reduce((a, b) => (a.months > b.months ? a : b));
    return {
      hasGaps: true,
      gaps,
      message: `${largest.months} month employment gap detected (${largest.label}).`,
    };
  }

  private formatMonth(d: Date): string {
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}
