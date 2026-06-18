import { Injectable } from '@nestjs/common';
import { InterviewQuestionSet } from '@recruitflow/shared';

const ROLE_QUESTIONS: Record<string, string[]> = {
  frontend: [
    'Explain React reconciliation and the virtual DOM.',
    'How would you optimize a large React application for performance?',
    'What is the difference between CSR and SSR? When would you choose each?',
    'Explain React Context vs Redux — when do you use which?',
    'Describe a difficult UI bug you solved recently.',
    'How do you approach component design for reusability and accessibility?',
    'Walk through your strategy for managing application state at scale.',
  ],
  backend: [
    'Explain how you design RESTful APIs for scalability.',
    'Describe your approach to database indexing and query optimization.',
    'How do you handle authentication and authorization in distributed systems?',
    'Tell me about a production incident you debugged and resolved.',
    'Compare microservices vs monolith — when would you choose each?',
    'How do you ensure data consistency in concurrent systems?',
  ],
  fullstack: [
    'Walk through a feature you built end-to-end from UI to database.',
    'How do you balance frontend and backend trade-offs in system design?',
    'Explain your approach to API contract design between frontend and backend teams.',
    'Describe how you handle deployment and CI/CD for full-stack applications.',
    'Tell me about a time you optimized performance across the entire stack.',
  ],
  default: [
    'Walk me through the most complex project you led from conception to delivery.',
    'How do you prioritize competing demands from multiple stakeholders?',
    'Describe a technical disagreement and how you resolved it.',
    'What metrics do you use to measure success in your role?',
    'Tell me about a time you had to learn something new under a tight deadline.',
    'How would you approach your first 30 days in this position?',
    'Describe a situation where you failed and what you learned.',
  ],
};

@Injectable()
export class InterviewQuestionEngine {
  generateInterviewQuestions(jobTitle: string, skills: string[]): InterviewQuestionSet {
    const title = jobTitle.toLowerCase();
    const skillText = skills.join(' ').toLowerCase();

    let pool = ROLE_QUESTIONS.default;
    if (title.includes('frontend') || skillText.includes('react') || skillText.includes('vue')) {
      pool = ROLE_QUESTIONS.frontend;
    } else if (title.includes('backend') || skillText.includes('node') || skillText.includes('python')) {
      pool = ROLE_QUESTIONS.backend;
    } else if (title.includes('full stack') || title.includes('fullstack')) {
      pool = ROLE_QUESTIONS.fullstack;
    }

    const hash = jobTitle.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const count = 5 + (hash % 3);
    const questions = this.pick(pool, count, hash);

    return {
      roleTitle: jobTitle,
      questions,
      provider: 'copilot-interview-engine',
    };
  }

  private pick<T>(arr: T[], count: number, seed: number): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = (seed + i) % (i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(count, copy.length));
  }
}
